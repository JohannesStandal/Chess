import { Piece } from "../Board/piece.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"

export class Evaluation {
    
    static mirroredBoard = new Array(64)
    static mapFromPieceType = Array(12)

    static kingMap = [
        -40, -40, -40, -50, -50, -40, -40, -40,
        -30, -30, -30, -40, -40, -30, -30, -30,
        -20, -20, -20, -30, -30, -20, -20, -20,
        -10, -10, -10, -20, -20, -10, -10, -10,
          0,   0,   0, -10, -10,   0,   0,   0,
         10,  10,   5,   0,   0,   5,  10,  10,
         30,  30,  10,   0,   0,  10,  30,  30,
         40,  40,  20,   0,   0,  20,  40,  40
    ]

    static pawnMap = [
        0,  0,  0,  0,  0,  0,  0,  0,
        10, 10, 10,-10,-10, 10, 10, 10,
        5,  5, 10, 20, 20, 10,  5,  5,
        5,  5, 15, 25, 25, 15,  5,  5,
        10, 10, 20, 30, 30, 20, 10, 10,
        20, 20, 30, 35, 35, 30, 20, 20,
        30, 30, 30, 30, 30, 30, 30, 30,
        0,  0,  0,  0,  0,  0,  0,  0
    ]

    static knightMap = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30, 10, 20, 30, 30, 20, 10,-30,
        -30,  5, 20, 30, 30, 20,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ]

    static bishopMap = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  0, 10, 15, 15, 10,  0,-10,
        -10,  5,  5, 15, 15,  5,  5,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ]

    static rookMap = [
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  5, 10, 15, 15, 10,  5,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        0,  0,  5, 10, 10,  5,  0,  0
    ]

    static queenMap = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5, 10, 10,  5,  0, -5,
        0,  0,  5, 10, 10,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
    ]


    static {
        //Generer spegla brett
        let i = 0
        for (let rank = 7; rank >= 0; rank--){
            for (let file = 0; file < 8; file++){
                const squareIndex =  rank * 8 + file
                this.mirroredBoard[squareIndex] = i
                i++
            }
        }
        
        //Setter opp kart for brikketyper
        this.mapFromPieceType[Piece.king] = this.kingMap
        this.mapFromPieceType[Piece.pawn] = this.pawnMap
        this.mapFromPieceType[Piece.knight] = this.knightMap
        this.mapFromPieceType[Piece.bishop] = this.bishopMap
        this.mapFromPieceType[Piece.rook] = this.rookMap
        this.mapFromPieceType[Piece.queen] = this.queenMap
    }

    // Board

    static evaluate(board){
        /**
         * Rekner ein skalar verdi som representerer kor gunstig posisjonen er for
         * spelaren sin tur det er. Dette er viktig for å få riktig resultat frå negamax funksjonen
         */
        //if (ChessHelper.isInsufficientMaterial(board)) return 0

        

       
        let score = 0

        const materialWeight = 1
        const positionBonusWeight = 1
        const kingWeight = 100

        score += this.countMaterial(board) * materialWeight
        
        const endgameWeight = ChessHelper.CalculateEndgameWeight(board)
        score += this.positionBonus(board, endgameWeight) * positionBonusWeight
        score += this.forceKingToCornerWithKing(board, endgameWeight) * kingWeight

        return score
        
    }

    static countMaterial(board){
        // tell materiale
        let materialScore = 0
        for (let i = 0; i < 64; i++){
            // Finner brikke type (inga brikke får vidare)
            const piece = board.square[i]
            if (piece == 0) continue
            
            // forteikn 
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            materialScore += sign * Piece.getPieceValue(piece)
        }

        return materialScore
    }

    static positionBonus(board, endgameWeight){
        let score = 0

        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue

            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1

            const pieceType = piece & 0b00111
            const mapIndex = (Piece.CheckPieceColor(piece, true)) ? i : Evaluation.mirroredBoard[i]

            const bonus = Evaluation.mapFromPieceType[pieceType][mapIndex]
            
            score += sign * bonus * 0.2
            
        }
        return score * (1 - endgameWeight)
    }

    static forceKingToCornerWithKing(board, endgameWeight){
        
        let score = 0

        // find kings
        let friendlyKingSquare = 0
        let enemyKingSquare = 0

        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            if (!Piece.IsType(piece, Piece.king)) continue

            const isFriendly = Piece.CheckPieceColor(piece, board.white_To_Move)

            if (isFriendly) friendlyKingSquare = i
            else enemyKingSquare = i
        }

        // friendly king
        const friendlyKingRank = ChessHelper.Rank(friendlyKingSquare)
        const friendlyKingFile = ChessHelper.File(friendlyKingSquare)
       
        // rekn ut avstand til midthen for fiendtleg konge
        const enemyKingRank = ChessHelper.Rank(enemyKingSquare)
        const enemyKingFile = ChessHelper.File(enemyKingSquare)

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

        return score * Math.min(endgameWeight, 1)
    }

    // Moves
    static Move(move, board){
        let score = 0
        score += this.MVV_LVA_ordering(move, board)
        score += this.PieceSquareTables(move, board)
        return score
    }

    static MVV_LVA_ordering(move, board){
    //Most valuable victim - Least valuable attacker 
    //Prioritises moves where a low value piece captures a high value piece
    let pieceTypeMoved = board.square[move.start] & 0b0111 
    let pieceTypeAttacked = board.square[move.target] & 0b0111

    return Piece.pieceValues[pieceTypeAttacked] - Piece.pieceValues[pieceTypeMoved]
    }

    static PieceSquareTables(move, board){
        const piece = board.square[move.start]
        const pieceType =  piece & 0b00111
        
        const startIndex = (Piece.CheckPieceColor(piece, true)) ? move.start : Evaluation.mirroredBoard[move.start]
        const targetIndex = (Piece.CheckPieceColor(piece, true)) ? move.target : Evaluation.mirroredBoard[move.target]

        const bonusOld = Evaluation.mapFromPieceType[pieceType][startIndex]
        const bonusNew = Evaluation.mapFromPieceType[pieceType][targetIndex]

        return bonusOld - bonusNew
    }
}
