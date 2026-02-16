import { Evaluation } from "./evaluation.js"

export function MoveOrder(board, moves){
    const sortedMoves = moves.sort((a, b) => {
        const valueA = Evaluation.Move(a, board)
        const valueB = Evaluation.Move(b, board)

        return valueB - valueA 
    }
    )

    //sortedMoves.forEach(move =>{console.log(move.CoordinatesNotation())})
    return sortedMoves
}