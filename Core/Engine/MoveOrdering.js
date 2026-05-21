import { Evaluation } from "./evaluation.js"

export function MoveOrder(board, moves, TTbestMove){
    // Score moves
    let sortedMoves = moves.sort((a, b) => {
        const valueA = Evaluation.Move(a, board)
        const valueB = Evaluation.Move(b, board)

        return valueB - valueA 
    })
    // Add TT bestmove as the first move to check
    if (TTbestMove != null){
        sortedMoves = InsertFirst(sortedMoves, TTbestMove)  
    }

    return sortedMoves
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

