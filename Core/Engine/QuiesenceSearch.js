import { Evaluation } from "./evaluation.js"
import { MoveOrder } from "./MoveOrdering.js"

export function QuiesenceSearch(board, timeManager, alpha, beta){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    if (timeManager.ExceededTimeLimit()) return null

    // stand pat
    let bestValue = Evaluation.evaluate(board)

    if (bestValue >= beta){
        return bestValue
    }
    
    alpha = Math.max(alpha, bestValue)

    //Genererer lovlege angrep
    let captureMoves = board.GenerateCaptures()
    captureMoves = MoveOrder(board, captureMoves)
    
    for (let move of captureMoves){
        board.Make_Move(move)
        let score = - QuiesenceSearch(board, timeManager, -beta, -alpha)
        board.Unmake_Move(move)

        
        if (score >= beta){
            return score
        }
        bestValue = Math.max(bestValue, score)
        alpha = Math.max(alpha, score)
    }

    return bestValue
}