import { Transposition_Table } from "./TT_map.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { MoveOrder } from "./MoveOrdering.js"
import { QuiescenceSearch } from "./QuiesenceSearch.js"
import { Move } from "../Board/move.js"
import { checkMateScore, drawScore, mateTreshold, maxSearchDepth, maxExtensions} from "../Constants/SearchConstants.js"
import { MoveGenerator } from "../MoveGeneration/MoveGenerator.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

export class Search {
    constructor(board, timeManager){
        this.board = board
        this.MoveGenerator = new MoveGenerator()
        this.timeManager = timeManager
        this.TT = new Transposition_Table()
        
        this.bestMove = null

        this.nodeCount = 0
        this.totalNodeCount = 0
    }

    IterativeDeepening(){
        console.log("\n New Search ")
        // console.log("TT SIZE BEFORE:", this.TT.table.size)
        // console.log(this.TT)
        // console.log(this.board.hash)
        const startHash = this.board.hash.Get64BitHash()
        // console.log("hash start: ", startHash)

        // console.log("\n Expected TT hit for this search")
        // console.log("Has entry: ", this.TT.table.has(startHash))
        // console.log(this.TT.table.get(startHash))
        
        // start searchtime
        this.timeManager.Start()
        this.bestMove = null
        this.TT.collisions = 0


        this.totalNodeCount = 0
        // iterative deepening
        for (let depth = 1; depth < maxSearchDepth; depth++){
            // tracking nodes too see improvement
            this.nodeCount = 0
                        
            // search the position
            const score = this.Negamax(depth, 0, -Infinity, Infinity, 0, true)
            this.totalNodeCount += this.nodeCount

            console.log(
                "depth: ", depth, 
                "Bestmove: ", Move.ToUCI(this.bestMove), 
                "Nodes: ", this.nodeCount, 
                "Score: ", Math.round(score)
            )

            if (mateTreshold <= score){
                const mateDepth = checkMateScore - score
                console.log("Found forced checkmate at M" + Math.ceil(mateDepth / 2))
                this.timeManager.Stop()
            }
            // stop search if time limit is exceeded
            if (this.timeManager.cancelSearch){
                break
            }
        }

        console.log(this.totalNodeCount, " searced in ", this.timeManager.timeLimitMS, "ms")
        // console.log("TT collisions ", this.TT.collisions)

        // console.log("TT SIZE AFTER:", this.TT.table.size)

        // console.log("\n root tt entry for next search")
        // console.log(this.TT.table.get(startHash))

        // In case a depth 1 search we pick the best move from move ordering
        if (this.bestMove == null){
            this.MoveGenerator.GenerateMoves(this.board, 0)
            this.bestMove = this.MoveGenerator.moves[0]
        }

        
     
        // console.log("TT SIZE AFTER:", this.TT.table.size)
        // console.log(this.TT)
        
        return this.bestMove
    }

    fixedDepthSearch(depth){
        this.bestMove = null

        // search the position
        const score = this.Negamax(depth, 0, -Infinity, Infinity, 0)
        console.log(
            "depth: ", depth, 
            "Bestmove: ", Move.ToUCI(this.bestMove), 
            "Nodes: ", nodesSearched, 
            "Score: ", Math.round(score)
        )

        const move = Move.ToUCI(this.bestMove)
    }

    Negamax(depth, ply, alpha, beta, totalExtensions, doNull){
        if (this.timeManager.ExceededTimeLimit()){
            return 0
        }
        this.nodeCount ++

        // check for threefold repetition
        if (this.board.CheckThreeFold()) {
           return drawScore
        }

        // Save old hash
        const hash = this.board.hash.Get64BitHash()
        

        // Store the original lowerbound value before starting the search
        // This will be used later when storing results in the transposition table
        const originalAlpha = alpha
    
        //transposition table
        const TT = this.TT.Read(hash, ply, depth)
        // if (ply == 0){
        //     console.log("Root TT hit: ", TT)
        // }
        if (TT.hit){
            if (ply == 0 && this.bestMove == null){
                this.bestMove = TT.move
            }
            
            // TT position is accurate
            if (TT.flag == "EXACT"){
                return TT.score
            }

            // update upper or lower bound
            if (TT.flag == "UPPER"){
                beta = Math.min(beta, TT.score)
            }
            else if (TT.flag == "LOWER"){
                alpha = Math.max(alpha, TT.score)
            }

            // early cutoff
            if (beta <= alpha){
                return TT.score
            }
        }

        // Start quiesence search at leaf nodes
        if (depth == 0){
            return QuiescenceSearch(this.board, this.timeManager, ply + 1, alpha, beta, this.nodeCount)
        }

        // Generate legal moves
        this.MoveGenerator.GenerateMoves(this.board, ply)
        const numMoves = this.MoveGenerator.count
        
        // Checkmate or stalemate detection
        const inCheck = AttackDetector.InCheck(this.board, this.board.white_To_Move) 

        if (numMoves == 0){    
            //Checkmate
            if (inCheck){
                return -(checkMateScore - ply)
            }
            
            //Stalemate
           return drawScore
        }

        // Moveordering. TT moves comes first, except for in the root node
        // where the best move from the previous search should be considered first
        MoveOrder(this.board, this.MoveGenerator, ply, TT.bestMove, this.bestMove)
        
        // Can the search be extended?
        const canExtend = totalExtensions < maxExtensions 

        // // Null move pruning 
        // const nmpAllowed = (
        //         doNull     && // Not already in a null move branch
        //         !inCheck   && // Not in check
        //         4 <= depth && // Prevents reducing shallow searches
        //         0 < ply    && // Avoid NMP at root node
        //         this.board.HasNonPawnMaterial() // Avoid zugswang
        //     )
        
        // if (nmpAllowed && false){
        //     // Search a null move window
        //     this.board.Make_NullMove()
        //     const score = - this.Negamax(depth - 4, ply + 1, -beta, -beta + 1, totalExtensions, false)
        //     this.board.Unmake_NullMove()

        //     // Important exit point for iterative deepening
        //     if (this.timeManager.cancelSearch) return 0

        //     // If the nullmove
        //     if (beta <= score){
        //         return beta
        //     }
        // }
    
        // Iterate over every legal move
        let bestMoveThisIteration = null
        
        // Get indexes from the move array
        const moveStart = this.MoveGenerator.GetMoveIndex(0, ply)
        const moveEnd = this.MoveGenerator.GetMoveIndex(numMoves, ply)

        for (let moveIndex = moveStart; moveIndex < moveEnd; moveIndex++){

            const move = this.MoveGenerator.moves[moveIndex]
            
            // Check and promotion extension
            const moveIsPromotion = Move.IsPromotion(move)
            const extensions = (canExtend && (inCheck || moveIsPromotion) ) ? 1 : 0
            
            // Evaluate future position
            this.board.Make_Move(move)
        
            const score = - this.Negamax(
                depth - 1 + extensions, 
                ply + 1, 
                -beta, 
                -alpha, 
                totalExtensions + extensions,
                true,
            )
            
            this.board.Unmake_Move(move)
            
            // exit point for iterative deepening
            if (this.timeManager.cancelSearch) return 0

            // If the best possible outcome exceeds previous search results, overwrite
            // the best move and the best score in this position
            if (alpha < score){
                alpha = score
                bestMoveThisIteration = move
                // Keep track of the best move from the root position as well
                if (ply == 0){
                    this.bestMove = bestMoveThisIteration
                }
            }
    
            // lowerbound fail high node
            if (beta <= score){
                this.TT.Store(hash, ply, depth, score, "LOWER", bestMoveThisIteration)
                return score
            }       
        }
        
        
        // Store final result in Transposition Table
        let flag = ""
        if (alpha <= originalAlpha) flag = "UPPER";
        else flag = "EXACT";

        this.TT.Store(hash, ply, depth, alpha, flag, bestMoveThisIteration)
    
        return alpha
    }
}
