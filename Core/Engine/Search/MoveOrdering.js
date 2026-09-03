import { pieceValues } from "../Evaluation/evaluation.js"
import { PieceSquareTables } from "../Evaluation/PieceSquareTables.js"
import { Move } from "../../Board/move.js"

export function MoveOrder(board, moveGenerator, ply, hashMove, killer1, killer2){
    // Order moves from predicted best to worst
    /**
    *   - hash move           score = 10000
    *   - winning capture     220 <= score <= 800
    *   - killer 1            score = 150
    *   - killer 2            score = 100
    *   - quiet move          score = 0
    *   - losing capture      score < 0
    */

    // Define the area of the move array we are working with
    const moveStart = moveGenerator.GetMoveIndex(0, ply)
    const moveEnd = moveGenerator.GetMoveIndex(moveGenerator.count, ply)
    
    // Score every relevant move in the move array
    for (let i = moveStart; i < moveEnd; i++){
        const move = moveGenerator.moves[i]
        
        // Hash move always comes first
        if (move == hashMove){
            moveGenerator.scores[i] = 10000
            continue
        }

        // Killer moves come next
        else if (move == killer1){
            moveGenerator.scores[i] = 150
            continue
        }
        else if (move == killer2){
            moveGenerator.scores[i] = 100
            continue
        }

        // Score the move from heuristic evaluation
        moveGenerator.scores[i] = EstimateMoveScore(move, board)
        
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

function EstimateMoveScore(move, board){
    const start = Move.Start(move)
    const target = Move.Target(move) 
    const flag = Move.Flag(move)
    
    let score = 0
    
    // MVV LVA for captures
    if (Move.IsCapture(move)){
        score += MVV_LVA(start, target, board)
    }
    // PST for quiet moves (score range -20 to +20)
    else {
        const movedPiece = board.square[start]

        // PST ordering
        const startBonus = Math.abs (PieceSquareTables.MidgameValue(movedPiece, start))
        const targetBonus = Math.abs (PieceSquareTables.MidgameValue(movedPiece, target))

        // Incentivise moving to a better square for the given piece
        score += (targetBonus - startBonus)
    }

    // Promotion bonus
    if (Move.IsPromotion(move)){
        // Score for knights, bishops, rooks, and queens
        const promotionScores = [300, 320, 500, 900]
        const index = flag & 0b11

        score += promotionScores[index]
    }
    
    return score
}

function MVV_LVA(start, target, board){
    //Most valuable victim - Least valuable attacker 
    //Prioritises moves where a low value piece captures a high value piece
    const pieceTypeMoved = board.square[start] & 0b0111 
    const pieceTypeAttacked = board.square[target] & 0b0111

    const attackerValue = pieceValues[pieceTypeMoved]
    const victimValue = pieceValues[pieceTypeAttacked]

    return victimValue - attackerValue
}

function swap(arr, i, j){
    if (i == j) return

    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp   
}