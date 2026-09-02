import { Transposition_Table } from "./Transposition_Table.js"
import { MoveOrder } from "./MoveOrdering.js"
import { QuiescenceSearch } from "./QuiesenceSearch.js"
import { Move } from "../Board/move.js"
import { checkMateScore, drawScore, mateTreshold, maxSearchDepth, maxExtensions, exitDetectFrequency} from "../Constants/SearchConstants.js"
import { MoveGenerator } from "../MoveGeneration/MoveGenerator.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

export class Search {
    constructor(board, searchManager){
        this.board = board
        this.MoveGenerator = new MoveGenerator()
        this.manager = searchManager
        this.TT = new Transposition_Table()
        
        this.bestMove = null
        this.totalNodeCount = 0
    }

    GetPrincipalVariation(variaton = [], depth=16){
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
        
        this.board.Make_Move(TT.move)
        this.GetPrincipalVariation(variaton, depth - 1)
        this.board.Unmake_Move(TT.move)

        return variaton
    }

    IterativeDeepening(){
        console.log("\n New Search ")
        
        const hashStartHigh = this.board.hash.high >>> 0
        const hashStartlow = this.board.hash.low >>> 0

        // console.log("\n Expected TT hit for this search")
        // console.log(this.TT.Read(hashStartHigh, hashStartlow, 0, 0))
        
        // start searchtime
        this.manager.Start()
        this.bestMove = null
    
        let bestScore;

        this.totalNodeCount = 0


        // iterative deepening
        for (let depth = 1; depth < maxSearchDepth; depth++){        
            // search the position
            const score = this.Negamax(depth, 0, -checkMateScore, checkMateScore, 0, true)
            this.totalNodeCount += this.manager.nodeCount

            console.log(
                "depth: ", depth, 
                "Bestmove: ", Move.ToUCI(this.bestMove), 
                "Nodes: ", this.manager.nodeCount, 
                "Score: ", Math.round(score)
            )

            
            // stop search if time limit is exceeded
            if (this.manager.cancelSearch){
                break
            }

            this.manager.SetPlyMin(depth)
            bestScore = score
        }

        console.log(`Finished search ${this.manager.plyMin}/${this.manager.plyMax}`)
        console.log(this.totalNodeCount, " searced in ", this.manager.elapsedMS, "ms")

        if (mateTreshold <= bestScore){
                const mateDepth = checkMateScore - bestScore
                console.log("Found forced checkmate at M" + Math.ceil(mateDepth / 2))
                this.manager.Stop()
            }


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
        if (this.manager.nodeCount % exitDetectFrequency == 0){
            this.manager.ExceededTimeLimit()
        }

        if (this.manager.cancelSearch){
            return 0
        }

        this.manager.nodeCount ++

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
        
        if (TT.hit && TT.depth >= depth){
            if (ply == 0 && this.bestMove == null){
                // console.log(this.bestMove, TT.move)
                this.bestMove = TT.move
            }
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
            return QuiescenceSearch(this.board, this.manager, ply, alpha, beta, this.nodeCount)
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
        MoveOrder(this.board, this.MoveGenerator, ply, TT.move, this.bestMove)
        
        // Can the search be extended?
        const canExtend = totalExtensions < maxExtensions 

        // // Null move pruning 
        const R = 3
        const nmpAllowed = (
                doNull         && // Not already in a null move branch
                !inCheck       && // Not in check
                R + 1 <= depth && // Prevents reducing shallow searches
                0 < ply        && // Avoid NMP at root node
                this.board.HasNonPawnMaterial() // Avoid zugswang
            )
        
        if (nmpAllowed){
            // Search a null move window
            this.board.Make_NullMove()
            const score = - this.Negamax(depth - 1 - R, ply + 1, -beta, -beta + 1, totalExtensions, false)
            this.board.Unmake_NullMove()

            // Important exit point for iterative deepening
            if (this.manager.cancelSearch) return 0

            // If the nullmove
            if (beta <= score){
                return score
            }
        }
    
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
            if (this.manager.cancelSearch) return 0

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
