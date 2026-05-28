import { Piece } from "../Board/piece.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { Move } from "../Board/move.js"
import { PieceSquareTables } from "./PieceSquareTables.js"

export class Evaluation {
    static pieceValues = new Array(12)
    static {
        this.pieceValues[Piece.none] = 0
        this.pieceValues[Piece.king] = 0
        this.pieceValues[Piece.pawn] = 100
        this.pieceValues[Piece.knight] = 320
        this.pieceValues[Piece.bishop] = 330
        this.pieceValues[Piece.rook] = 500
        this.pieceValues[Piece.queen] = 900 
    }

    static evaluate(board){
        /**
         * Estimate how good the position is for the given player. Positiv -> Winning
         * while negative -> losing.
         */

        // Game phase in the range 0 to 1, where 0 = Endgame, 1 = Mid game
        const phase = this.calculateGamePhase(board)
        
        // Accumulate the scores
        const generalScore = this.generalScore(board)
        const midGameScore = this.midGameScore(board) * phase
        const endGameScore = this.endGameScore(board) * (1 - phase)
    
        return generalScore + midGameScore + endGameScore
    }

    static generalScore(board){
        // Evaluation terms that apply for the entire game
        let score = 0

        const materialWeight = 1
        const positionWeight = 1

        score += this.countMaterial(board) * materialWeight
        score += this.positionBonus(board) * positionWeight

        return score
    }

    static midGameScore(board){
        // Evaluation terms important for the midgame
        let score = 0

        
        return 0
    }

    static endGameScore(board){
        // Evaluation terms important for the endgame
        let score = 0

        const mopUpWeigth = 1

        score += this.mopUpScore(board) * mopUpWeigth

        return score
    }

    static calculateGamePhase(board){
        // Count up non pawn material
        let total = 0
        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            const pieceType = Piece.Type(piece)

            switch (pieceType){
                case(Piece.knight):
                    total += 1
                    break

                case(Piece.knight):
                    total += 1
                    break

                case(Piece.rook):
                    total += 2
                    break

                case(Piece.queen):
                    total += 4
                    break
            }
        }
        return total / 24
    }

    static countMaterial(board){
        // Count the total material on the board
        let materialScore = 0

        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue
            
            const pieceType = Piece.Type(piece)
            const value = this.pieceValues[pieceType]
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            materialScore += sign * value
        }

        return materialScore
    }

    static positionBonus(board, phase){
        let score = 0

        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue

            
            const bonus = PieceSquareTables.Value(piece, i)
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            score += sign * bonus
        }

        return score
    }

    static mobilityBonus(board){
        const myMobility = board.GenerateLegalMoves().length
        // board.white_To_Move = !board.white_To_Move
        // const opponentMobility = board.GenerateLegalMoves().length
        // board.white_To_Move = !board.white_To_Move
        return myMobility //- opponentMobility
    }

    static mopUpScore(board, phase){
        let score = 0

        // find kings
        let friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        let enemyKingSquare = board.white_To_Move ? board.blackKingSquare : board.whiteKingSquare

        // friendly king
        const friendlyKingRank = ChessHelper.RankIndex(friendlyKingSquare)
        const friendlyKingFile = ChessHelper.FileIndex(friendlyKingSquare)
       
        // rekn ut avstand til midthen for fiendtleg konge
        const enemyKingRank = ChessHelper.RankIndex(enemyKingSquare)
        const enemyKingFile = ChessHelper.FileIndex(enemyKingSquare)

        // oppfordre til å få fiendtlig konge til hjørne av brettet
        const enemyKingDstToCenterRank = Math.abs(enemyKingRank - 3.5)
        const enemyKingDstToCenterFile = Math.abs(enemyKingFile - 3.5)

        // total distance to center
        const enemyKingDstToCenter = (enemyKingDstToCenterRank + enemyKingDstToCenterFile)
        score += enemyKingDstToCenter / 7
        
        // encourage kings to be close to each other
        const RankDistance = Math.abs(friendlyKingRank - enemyKingRank) 
        const FileDistance = Math.abs(friendlyKingFile - enemyKingFile) 
        const kingDistance = FileDistance + RankDistance

        
        score += (14 - kingDistance) / 14

        return score
    }
}
