import { Evaluation } from "./evaluation.js"
import { PieceSquareTables } from "./PieceSquareTables.js"
import { Move } from "../Board/move.js"

export function MoveOrder(board, moveGenerator, ply, TTbestMove, bestRootMove){
    // Define the area of the move array we are working with
    const moveStart = moveGenerator.GetMoveIndex(0, ply)
    const moveEnd = moveGenerator.GetMoveIndex(moveGenerator.count, ply)
    
    // Score every relevant move in the move array
    for (let i = moveStart; i < moveEnd; i++){
        const move = moveGenerator.moves[i]
        // Best move from previous iterations of iterative deepening is first
        if (move == bestRootMove){
            moveGenerator.scores[i] = 1200000
        }
        // Transposition table best move is second, if it is not the same as the previous best move
        else if (move == TTbestMove){
            moveGenerator.scores[i] = 1000000
        }
        // Score the move from heuristic evaluation
        else {
            moveGenerator.scores[i] = EstimateMoveScore(move, board)
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

function EstimateMoveScore(move, board){
        let score = 0
        const start = Move.Start(move)
        const target = Move.Target(move) 
        const flag = Move.Flag(move)
        
        
        if (Move.IsCapture(move)){
            score += MVV_LVA(start, target, board)
        }
        else {
            const movedPiece = board.square[start]

            // PST ordering
            const startBonus = PieceSquareTables.MidgameValue(movedPiece, start)
            const targetBonus = PieceSquareTables.MidgameValue(movedPiece, target)

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

        const attackerValue = Evaluation.pieceValues[pieceTypeMoved]
        const victimValue = Evaluation.pieceValues[pieceTypeAttacked]
        

        return victimValue - attackerValue
    }

function swap(arr, i, j){
    if (i == j) return

    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp   
}