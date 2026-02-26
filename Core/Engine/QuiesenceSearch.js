import { Evaluation } from "./evaluation.js"
import { MoveOrder } from "./MoveOrdering.js"
import { checkMateScore, drawScore } from "../Constants/SearchConstants.js"


export function QuiesenceSearch(board, timeManager, ply, alpha, beta){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    if (timeManager.ExceededTimeLimit()) return undefined

    // move generation
    let moves;

    // If in check explore all continuations
    if (board.InCheck(board.white_To_Move)){
        moves = board.GenerateLegalMoves()
        
    }

    // Generate tactical moves (Promotion, captures, checks)
    else {
        moves = board.GenerateTacticalMoves()
    }

    // Checkmate detection
     if (moves.length == 0 && board.InCheck(board.white_To_Move)){
        return - (checkMateScore - ply)
    }

    // stand pat
    let bestValue = Evaluation.evaluate(board)

    if (bestValue >= beta){
        return bestValue
    }
    
    alpha = Math.max(alpha, bestValue)
    
    
   
    
    
    // Recursive search with alpha beta pruning
    moves = MoveOrder(board, moves)
    
    for (let move of moves){
        board.Make_Move(move)
        let score = - QuiesenceSearch(board, timeManager, ply + 1, -beta, -alpha)
        board.Unmake_Move(move)

        
        if (score >= beta){
            return score
        }
        bestValue = Math.max(bestValue, score)
        alpha = Math.max(alpha, score)
    }

    return bestValue
}