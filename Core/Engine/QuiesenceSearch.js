import { Evaluation } from "./evaluation.js"
import { MoveOrder } from "./MoveOrdering.js"
import { checkMateScore, drawScore } from "../Constants/SearchConstants.js"
import { MoveGenerator } from "../MoveGeneration/MoveGenerator.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"
import { Move } from "../Board/move.js"


const moveGenerator = new MoveGenerator()

export function QuiescenceSearch(board, timeManager, ply, alpha, beta, nodeCount){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    if (timeManager.ExceededTimeLimit()) return alpha
    nodeCount ++
    
    // move generation
    let moves;

    const inCheck = AttackDetector.InCheck(board, board.white_To_Move)
    // If in check explore all continuations
    if (inCheck){
        moveGenerator.GenerateMoves(board, ply)
    }

    // Generate tactical moves (Promotion, captures, checks)
    else {
        moveGenerator.TacticalMoves(board, ply)
    }
    
    const numMoves = moveGenerator.count
    const moveStart = moveGenerator.GetMoveIndex(0, ply)
    const moveEnd = moveGenerator.GetMoveIndex(numMoves, ply)    

    // Checkmate detection
    if (numMoves == 0 && inCheck){
        return - (checkMateScore - ply)
    }


    // stand pat
    let standPat = Evaluation.evaluate(board)
    if (beta <= standPat) return standPat
    alpha = Math.max(alpha, standPat)
    
    // Order moves from assumed best to worst based on heuristics
    MoveOrder(board, moveGenerator, ply, null, null)
    
    // Recursive search with alpha beta pruning
    for (let moveIndex = moveStart; moveIndex < moveEnd; moveIndex++){
        const move = moveGenerator.moves[moveIndex]
        
        board.Make_Move(move)
        let score = - QuiescenceSearch(board, timeManager, ply + 1, -beta, -alpha, nodeCount)
        board.Unmake_Move(move)

        if (score >= beta) return score
        alpha = Math.max(alpha, score)
    }

    return alpha
}