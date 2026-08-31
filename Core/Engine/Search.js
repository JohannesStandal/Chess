import { Transposition_Table } from "./Transposition_Table.js"
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

    GetPrincipalVariations(depth){
        const variations = []
        console.log(this.TT)
        

        // Generate every move
        this.MoveGenerator.GenerateMoves(this.board, 0)

        // Get indexes from the move array
        const numMoves = this.MoveGenerator.count

        const moveStart = this.MoveGenerator.GetMoveIndex(0, 0)
        const moveEnd = this.MoveGenerator.GetMoveIndex(numMoves, 0)

        for (let moveIndex = moveStart; moveIndex < moveEnd; moveIndex++){
            const move = this.MoveGenerator.moves[moveIndex]
            const uciMove = Move.ToUCI(move)

            const line = []
            const TTentries = []
        
            line.push(uciMove)


            this.board.Make_Move(move)

            // Get hash
            const high = this.board.hash.high >>> 0
            const low = this.board.hash.low >>> 0

            // Read positon from TT
            const TT = this.TT.Read(high, low, 1, 0)

           

            // If position doesnt exist we have no PVS
            if (TT.hit == false){
                this.board.Unmake_Move(move)
                console.log("Variation from", uciMove,  " has never been explored")
                continue
            }
            this.GetPV(line, TTentries, depth)

            this.board.Unmake_Move(move)

            variations.push({
                score: -TT.score,
                moves: line,
                TTentries: TTentries,
            })

            TTentries.forEach(entry => {
                entry.move = Move.ToUCI(entry.move)
            });

            break
        }
        // Sort variations
        variations.sort((a, b) => (a.score < b.score) ? 1 : -1)
        console.log(variations)
        return variations
    }

    GetPV(variaton, TTentries, depth){
        // console.log(variaton)
        // Get hash
        const high = this.board.hash.high >>> 0
        const low = this.board.hash.low >>> 0

        const TT = this.TT.Read(high, low, 0, 0)

        
        // console.log(TT)
        if (!TT.hit  || depth == 0){
            // console.log("No hit return")
            return
        }
        
        const uciMove = Move.ToUCI(TT.move)
        variaton.push(uciMove)
        TTentries.push(TT)

        this.board.Make_Move(TT.move)
        this.GetPV(variaton, TTentries, depth - 1)
        this.board.Unmake_Move(TT.move)
    }

    IterativeDeepening(){
        // this.TT.SetSizeMB(64)
        console.log("\n New Search ")
        // console.log("TT SIZE BEFORE:", this.TT.table.size)
        // console.log(this.TT)

        // console.log(this.board.hash)
        // const startHash = this.board.hash.Get64BitHash()
        // console.log("hash start: ", startHash)
        // Save old hash
        const hashStartHigh = this.board.hash.high >>> 0
        const hashStartlow = this.board.hash.low >>> 0

        // this.TT.SetSizeMB(64)


        console.log("\n Expected TT hit for this search")
        console.log(this.TT.Read(hashStartHigh, hashStartlow, 0, 0))
        
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
            const score = this.Negamax(depth, 0, -checkMateScore, checkMateScore, 0, true)
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
        // console.log(this.TT.Read(hashStartHigh, hashStartlow, 0, 0))
        

        // In case a depth 1 search we pick the best move from move ordering
        if (this.bestMove == null){
            this.MoveGenerator.GenerateMoves(this.board, 0)
            this.bestMove = this.MoveGenerator.moves[0]
        }

        const line = []

        this.GetPV(line, [], 10)
        console.log(line)
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
        const high = this.board.hash.high >>> 0
        const low = this.board.hash.low >>> 0

        // Store the original lowerbound value before starting the search
        // This will be used later when storing results in the transposition table
        const originalAlpha = alpha
        
        //transposition table
        const TT = this.TT.Read(high, low, ply, depth)
        
        if (TT.hit && TT.depth >= depth && ply != 0){
            // TT position is accurate
            if (TT.flag == "EXACT"){
                return TT.score
            }

            // update upper or lower bound
            else if (TT.flag == "LOWER" && TT.score >= beta){
                return TT.score
            }
            else if (TT.flag == "UPPER" && TT.score <= alpha){
                return TT.score
            }
            
        }

        // Start quiesence search at leaf nodes
        if (depth == 0){
            return QuiescenceSearch(this.board, this.timeManager, ply, alpha, beta, this.nodeCount)
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
        // const R = 3
        // const nmpAllowed = (
        //         doNull         && // Not already in a null move branch
        //         !inCheck       && // Not in check
        //         R + 1 <= depth && // Prevents reducing shallow searches
        //         0 < ply        && // Avoid NMP at root node
        //         this.board.HasNonPawnMaterial() // Avoid zugswang
        //     )
        
        // if (nmpAllowed){
        //     // Search a null move window
        //     this.board.Make_NullMove()
        //     const score = - this.Negamax(depth - 1 - R, ply + 1, -beta, -beta + 1, totalExtensions, false)
        //     this.board.Unmake_NullMove()

        //     // Important exit point for iterative deepening
        //     if (this.timeManager.cancelSearch) return 0

        //     // If the nullmove
        //     if (beta <= score){
        //         return score
        //     }
        // }
    
        // Iterate over every legal move
        let bestMove = null
        let bestScore = -checkMateScore
        
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
                doNull,
            )
            
            this.board.Unmake_Move(move)
            
            // exit point for iterative deepening
            if (this.timeManager.cancelSearch) return 0

            // Track best score and move
            if (bestScore < score){
                bestScore = score
                bestMove  = move
            }

            
            alpha = Math.max(alpha, score)
    
            // lowerbound fail high node
            if (beta <= alpha){
                // this.TT.Store(high, low, ply, depth, beta, "BETA")
                break
            }       
        }

        if (ply == 0){
            this.bestMove = bestMove
        }
        
        
        
        
        // Store final result in Transposition Table
        let flag = ""
        if (bestScore <= originalAlpha) flag = "UPPER"
        else if (bestScore >= beta) flag = "LOWER"
        else flag = "EXACT"

        this.TT.Store(high, low, ply, depth, bestScore, flag, bestMove)
    
        return bestScore
    }
}
