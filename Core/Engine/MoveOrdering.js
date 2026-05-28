import { Evaluation } from "./evaluation.js"

export function MoveOrder(board, moveGenerator, ply, TTbestMove, bestRootMove){
    // Define the area of the move array we are working with
    const moveStart = moveGenerator.GetMoveIndex(0, ply)
    const moveEnd = moveGenerator.GetMoveIndex(moveGenerator.count, ply)
    
    // Score every relevant move in the move array
    for (let i = moveStart; i < moveEnd; i++){
        // Best move from previous iterations of iterative deepening is first
        if (moveGenerator.moves[i] == bestRootMove){
            moveGenerator.scores[i] = 1200000
        }
        // Transposition table best move is second, if it is not the same as the previous best move
        else if (moveGenerator.moves[i] == TTbestMove){
            moveGenerator.scores[i] = 1000000
        }
        // Score the move from heuristic evaluation
        else {
            moveGenerator.scores[i] = Evaluation.Move(moveGenerator.moves[i], board)
        }
    }

    // Sort the moves in place based on their scores
    for (let i = moveStart; i < moveEnd; i++){
        for (let j = i + 1; j < moveEnd; j++){
            if (moveGenerator.scores[j] > moveGenerator.scores[i]){
                swap(moveGenerator.scores, i, j)
                swap(moveGenerator.moves, i, j)
            }
        }
    }
    
}

function swap(arr, i, j){
    if (i == j) return

    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp   
}

export function InsertFirst(moves, move){
    const index = moves.indexOf(move)
    if (index == -1) return moves
    for (let i = index; 0 < i; i--){
        const a = moves[i-1]
        moves[i] = a
    }
    moves[0] = move
    return moves

}