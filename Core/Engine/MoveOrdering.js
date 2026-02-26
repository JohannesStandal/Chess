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
        sortedMoves = sortedMoves.filter(move => move != TTbestMove)
        sortedMoves.unshift(TTbestMove)    
    }


    return sortedMoves
}

