import { Evaluation } from "./evaluation.js"
import { MoveOrder } from "./MoveOrdering.js"
import { checkMateScore, drawScore } from "../Constants/SearchConstants.js"
import { MoveGenerator } from "../MoveGeneration/MoveGenerator.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"
import { Move } from "../Board/move.js"
const moveGenerator = new MoveGenerator()

export function QuiescenceSearch(board, timeManager, ply, alpha, beta){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    if (timeManager.ExceededTimeLimit()) return undefined

    // move generation
    let moves;

    // If in check explore all continuations
    if (AttackDetector.InCheck(board, board.white_To_Move)){
        moves = moveGenerator.GenerateMoves(board)
    }
    // Generate tactical moves (Promotion, captures, checks)
    else {
        moves = moveGenerator.TacticalMoves(board)
    }

    // Checkmate detection
    if (moves.length == 0 && AttackDetector.InCheck(board, board.white_To_Move)){
        return - (checkMateScore - ply)
    }

    // stand pat
    let standPat = Evaluation.evaluate(board)
    if (beta <= standPat) return standPat
    alpha = Math.max(alpha, standPat)
    
    // Recursive search with alpha beta pruning
    moves = MoveOrder(board, moves)
    
    for (let move of moves){
        board.Make_Move(move)
        let score = - QuiescenceSearch(board, timeManager, ply + 1, -beta, -alpha)
        board.Unmake_Move(move)

        if (score >= beta) return score
        alpha = Math.max(alpha, score)
    }

    return alpha
}