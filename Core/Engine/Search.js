import { Transposition_Table } from "./Transposition_Table.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { MoveOrder, InsertFirst } from "./MoveOrdering.js"
import { QuiescenceSearch } from "./QuiesenceSearch.js"
import { Move } from "../Board/move.js"
import { checkMateScore, drawScore, mateTreshold, maxSearchDepth} from "../Constants/SearchConstants.js"
import { MoveGenerator } from "../MoveGeneration/MoveGenerator.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

// constants
var nodesSearched;

export class Search {
    constructor(board, timeManager){
        this.board = board
        this.MoveGenerator = new MoveGenerator()
        this.timeManager = timeManager
        this.TT = new Transposition_Table()

        this.bestMove = null
    }

    IterativeDeepening(){
        // start searchtime
        this.timeManager.Start()
        this.bestMove = null

        //console.log("EndgameWGH: ",  ChessHelper.CalculateEndgameWeight(this.board))

        // iterative deepening
        for (let depth = 1; depth < maxSearchDepth; depth++){
            // tracking nodes too see improvement
            nodesSearched = 0
            
            // search the position
            this.currentDepth = depth
            const score = this.Negamax(depth, 0, -Infinity, Infinity)
            console.log("depth: ", depth, "Bestmove: ", Move.ToUCI(this.bestMove), " Nodes: ", nodesSearched, "Score: ", score)
            if (mateTreshold <= score){
                const mateDepth = checkMateScore - score
                console.log("Found forced checkmate at M" + Math.ceil(mateDepth / 2))
                this.timeManager.Stop()
            }
            // stop search if time limit is exceeded
            if (this.timeManager.cancelSearch){
                //console.log("Search canceled", this.currentDepth)
                break
            }
        }
        return this.bestMove ?? this.board.GenerateLegalMoves()[0]
    }

    Negamax(depth, ply, alpha, beta){
        if (this.timeManager.ExceededTimeLimit()){
            return undefined
        }
        nodesSearched ++

        // check for threefold repetition
        if (ChessHelper.checkForRepetitions(this.board.repetitionTable)) {
            //console.log("found threefold repetition in search at ply: ", ply)
            return drawScore
        }

        // Save old hash
        const hash = this.board.zobrist.hash

        //transposition table
        let TTbestMove = null
        
        if (this.TT.IsValidTransposition(hash, depth) && 
            depth != this.currentDepth){
            
            const entry = this.TT.table.get(hash)
            TTbestMove = entry.bestMove
            
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
            let mutatedScore = entry.score

            if (mateTreshold < entry.score){    
                mutatedScore = entry.score - ply
            }
            else if (entry.score < -mateTreshold){
                mutatedScore = entry.score + ply 
            }

            // TT position is accurate
            if (entry.flag == "EXACT"){
                return mutatedScore
            }
            // update upper or lower bound
            if (entry.flag == "UPPER"){
                beta = Math.min(beta, mutatedScore)
            }
            else if (entry.flag == "LOWER"){
                alpha = Math.max(alpha, mutatedScore)
            }
            // early cutoff
            if (alpha >= beta){
                return mutatedScore
            }
        }

        // Start quiesence search at leaf nodes
        if (depth == 0){
            return QuiescenceSearch(this.board, this.timeManager, ply + 1, alpha, beta)
        } 

        // Generate legal moves
        this.MoveGenerator.GenerateMoves(this.board, ply)
        const numMoves = this.MoveGenerator.count
        
        // Checkmate or stalemate detection
        if (numMoves == 0){    
            //Checkmate
            if (AttackDetector.InCheck(this.board, this.board.white_To_Move)){
                const mateScore = -(checkMateScore - ply)
                this.TT.AddPosition(hash, -checkMateScore, depth, "EXACT", null)
                return mateScore
            }
            
            //Stalemate
            this.TT.AddPosition(hash, drawScore, depth, "EXACT")
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
    
        // Iterate over every legal move
        let bestMoveThisIteration = null
        
        // Get indexes from the move array
        const moveStart = this.MoveGenerator.GetMoveIndex(0, ply)
        const moveEnd = this.MoveGenerator.GetMoveIndex(numMoves, ply)

        for (let moveIndex = moveStart; moveIndex < moveEnd; moveIndex++){
            const move = this.MoveGenerator.moves[moveIndex]
            
            // Evaluate future position
            this.board.Make_Move(move)
            const score = - this.Negamax(depth - 1, ply + 1, -beta, -alpha)
            this.board.Unmake_Move(move)
            
            // exit point for iterative deepening
            if (this.timeManager.cancelSearch) return undefined

            // If the best possible outcome exceeds precious search results, overwrite
            // the best move and the best score in this position
            if (alpha < score){
                alpha = score
                bestMoveThisIteration = move
                // Keep track of the best move from the root position as well
                if (depth == this.currentDepth){
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

                let scoreToStore = score
                
                if (mateTreshold < scoreToStore)
                    scoreToStore += ply
                else if (scoreToStore < -mateTreshold)
                    scoreToStore -= ply

                this.TT.AddPosition(hash, scoreToStore, depth, "LOWER", move)

                return score    
            }
        }
        
        // Store final result in Transposition Table
        let flag = ""
        if (alpha <= originalAlpha) flag = "UPPER";
        else if (alpha >= beta) flag = "LOWER";
        else flag = "EXACT";


        let scoreToStore = alpha
        // adjust checkmate scores to our depth
        // when storing in transposition table
        if (mateTreshold < scoreToStore)
            scoreToStore += ply
        else if (scoreToStore < -mateTreshold)
            scoreToStore -= ply

    
        this.TT.AddPosition(hash, scoreToStore, depth, flag, bestMoveThisIteration)
    
        return alpha
    }
}
