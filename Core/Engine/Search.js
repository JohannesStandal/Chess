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

    IterativeDeepening(){
        console.log("\n New Search ")
        // start searchtime
        this.timeManager.Start()
        this.bestMove = null

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
                " Nodes: ", this.nodeCount, 
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

        // In case a depth 1 search we pick the best move from move ordering
        if (this.bestMove == null){
            this.MoveGenerator.GenerateMoves(this.board, 0)
            this.bestMove = this.MoveGenerator.moves[0]
        }
        
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
        const hash = this.board.zobrist.hash

        //transposition table
        let TTbestMove = null
        
        if (this.TT.IsValidTransposition(hash, depth)){
            
            const entry = this.TT.table.get(hash)
            TTbestMove = entry.bestMove
            if (ply == 0 && this.bestMove == null){
                this.bestMove = entry.bestMove
            }
            
            /**
             Scale checkmates to match depth
             a M2 found at 3ply -> M3
            
             5 -> 9995 m in 5 ply "10 total ply" -> 9990
             same pos
             3 -> 9995 m in 5 ply " 8 total ply" -> 9992
            
             5 -> -9995 m in 5 ply "10 total ply" -> -9990
             same pos
             3 -> -9995 m in 5 ply " 8 total ply" -> -9992
            */
            
            // Positive checkmate -> subtract ply
            let scaledScore = entry.score

            if (mateTreshold < entry.score){    
                scaledScore = entry.score - ply
            }
            else if (entry.score < -mateTreshold){
                scaledScore = entry.score + ply 
            }

            // TT position is accurate
            if (entry.flag == "EXACT"){
                return scaledScore
            }
            // update upper or lower bound
            if (entry.flag == "UPPER"){
                beta = Math.min(beta, scaledScore)
            }
            else if (entry.flag == "LOWER"){
                alpha = Math.max(alpha, scaledScore)
            }
            // early cutoff
            if (alpha >= beta){
                return scaledScore
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
                const mateScore = -(checkMateScore - ply)
                return mateScore
            }
            
            //Stalemate
           return drawScore
        }

        // Moveordering. TT moves comes first, except for in the root node
        // where the best move from the previous search should be considered first
        let bestRootMove = null
        if (ply == 0){
            bestRootMove = this.bestMove
        }

        MoveOrder(this.board, this.MoveGenerator, ply, TTbestMove, bestRootMove)
        
        // Store the original lowerbound value before starting the search
        // This will be used later when storing results in the transposition table
        const originalAlpha = alpha

        // Can the search be extended?
        const canExtend = totalExtensions < maxExtensions 

        // Null move pruning 
        const nmpAllowed = (
                doNull     && // Not already in a null move branch
                !inCheck   && // Not in check
                4 <= depth && // Prevents reducing shallow searches
                0 < ply    && // Avoid NMP at root node
                this.board.HasNonPawnMaterial() // Avoid zugswang
            )
        
        if (nmpAllowed){
            // Search a null move window
            this.board.Make_NullMove()
            const score = - this.Negamax(depth - 4, ply + 1, -beta, -beta + 1, totalExtensions, false)
            this.board.Unmake_NullMove()

            // Important exit point for iterative deepening
            if (this.timeManager.cancelSearch) return 0

            // If the nullmove
            if (beta <= score){
                return beta
            }
        }
    
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
                totalExtensions + extensions
            )
            
            this.board.Unmake_Move(move)
            
            // exit point for iterative deepening
            if (this.timeManager.cancelSearch) return 0

            // If the best possible outcome exceeds precious search results, overwrite
            // the best move and the best score in this position
            if (alpha < score){
                alpha = score
                bestMoveThisIteration = move
                // Keep track of the best move from the root position as well
                if (ply == 0){
                    this.bestMove = move
                }
            }
    
            // lowerbound fail high node
            if (beta <= score){
                // 5: 9990 -> m in 10 ply -> 9995
                // 
                // 2: 9997 -> m in 3 ply -> 9999

                // 5: -9990 -> m in 10 ply -> -9995
                // 
                // 2: -9997 -> m in 3 ply -> -9999

                let scaledScore = score
                
                // Mate scaling
                if (mateTreshold < scaledScore)
                    scaledScore += ply
                else if (scaledScore < -mateTreshold)
                    scaledScore -= ply

                this.TT.AddPosition(hash, scaledScore, depth, "LOWER", move)

                return score
            }       
        }
        
        
        // Store final result in Transposition Table
        let flag = ""
        if (alpha <= originalAlpha) flag = "UPPER";
        else if (alpha >= beta) flag = "LOWER";
        else flag = "EXACT";


        let scaledScore = alpha

        // adjust checkmate scores to our depth
        // when storing in transposition table
        if (mateTreshold < scaledScore)
            scaledScore += ply
        else if (scaledScore < -mateTreshold)
            scaledScore -= ply

    
        this.TT.AddPosition(hash, scaledScore, depth, flag, bestMoveThisIteration)
    
        return alpha
    }
}
