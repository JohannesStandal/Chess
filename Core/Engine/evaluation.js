import { Piece } from "../Board/piece.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { Move } from "../Board/move.js"
import { PieceSquareTables } from "./PieceSquareTables.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

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
        let midGameScore = 0

        // Weights
        const mobilityWeight = 1
        const kingExposureWeight = 1

        // find kings
        const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        const enemyKingSquare = board.white_To_Move ? board.blackKingSquare : board.whiteKingSquare

        
        // Sliding piece mobility bonus
        midGameScore += this.mobilityBonus(board) * mobilityWeight

        // King Exposure
        midGameScore += this.kingExposure(board, friendlyKingSquare, enemyKingSquare) * kingExposureWeight

        // Pawn shields. 
        midGameScore += this.pawnShields(board, friendlyKingSquare, board.white_To_Move)
        midGameScore -= this.pawnShields(board, enemyKingSquare, !board.white_To_Move)

        return midGameScore
    }

    static endGameScore(board){
        // Evaluation terms important for the endgame
        let endGameScore = 0

        // Weights for endgame score
        const mopUpWeigth = 1

        // find kings
        const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        const enemyKingSquare = board.white_To_Move ? board.blackKingSquare : board.whiteKingSquare

        endGameScore += this.mopUpScore(board, friendlyKingSquare, enemyKingSquare) * mopUpWeigth

        return endGameScore
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

                case(Piece.bishop):
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
        // Count up non pawn material
        let mobilityScore = 0

        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            const pieceType = Piece.Type(piece)

            let mobility;
            switch (pieceType){
                case(Piece.bishop):
                    mobility = AttackDetector.Mobility(board, i, false, true)
                    mobilityScore += sign * mobility * 4
                    break

                case(Piece.rook):
                    mobility = AttackDetector.Mobility(board, i, true, false)
                    mobilityScore += sign * mobility * 2 
                    break

                case(Piece.queen):
                    mobility = AttackDetector.Mobility(board, i, true, true)
                    mobilityScore += sign * mobility * 1
                    break
            }
        }
        return mobilityScore
    }

    static mopUpScore(board, friendlyKingSquare, enemyKingSquare){
        let score = 0

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

    static kingExposure(board, friendlyKingSquare, enemyKingSquare){
        let score = 0
        // Punish having an exposed king, but incentivise an exposed enemy king
        score -= AttackDetector.Mobility(board, friendlyKingSquare, true, false) * 4
        score -= AttackDetector.Mobility(board, friendlyKingSquare, false, true) * 2

        score += AttackDetector.Mobility(board, enemyKingSquare, true, false) * 4
        score += AttackDetector.Mobility(board, enemyKingSquare, false, true) * 2

        return score
    }

    static pawnShields(board, kingSquare, white) {
        let pawnShieldScore = 0

        const isKingside = kingSquare == (white ? 6 : 62)
        const isQueenside = kingSquare == (white ? 2 : 58)

        if (!isKingside && !isQueenside) return 0

        let shieldSquares;

        if (isKingside){
            shieldSquares = (white)
                ? [13, 14, 15, 21, 22, 23] // White shield squares
                : [53, 54, 55, 45, 46, 47] // Black shield squares
        }
        else if (isQueenside){
            shieldSquares = (white)
                ? [ 8,  9, 10, 16, 17, 18] // White shield squares
                : [48, 49, 50, 40, 41, 42] // Black shield squares
        }

        // Bonuses for a pawn on the different squares
        const weights = [10, 15, 10, 5, 8, 5]
        const color = (white) ? Piece.white : Piece.black

        for (let i = 0; i < 6; i++) {
            const targetSquare = shieldSquares[i]
            const piece = board.square[targetSquare]

            if (piece == (Piece.pawn | color)) {
                pawnShieldScore += weights[i]
            } 
            else {
                pawnShieldScore -= weights[i] // missing pawn is dangerous
            }
        }

        return pawnShieldScore;
    }
}