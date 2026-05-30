import { Piece } from "../Board/piece.js"

export class PieceSquareTables {
    static mirroredBoard = new Array(64)
    static midMapForPiece = Array(32)
    static endMapForPiece = Array(32)
    
    static {
        // Mirrored board indexes
        let i = 0
        for (let rank = 7; rank >= 0; rank--){
            for (let file = 0; file < 8; file++){
                const squareIndex =  rank * 8 + file
                this.mirroredBoard[squareIndex] = i
                i++
            }
        }
    }

    // King should hide in the corner during the mid game
    // In endgames the king should centralize to support pawns
    static kingMid = [
         20, 30, 10,  0,  0, 10, 30, 20,
         20, 20,  0,  0,  0,  0, 20, 20,
        -10,-20,-20,-20,-20,-20,-20,-10,
        -20,-30,-30,-40,-40,-30,-30,-20,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
        -30,-40,-40,-50,-50,-40,-40,-30,
    ]

    static kingEnd = [
        -50,-30,-30,-30,-30,-30,-30,-50,
        -30,-30,  0,  0,  0,  0,-30,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 30, 40, 40, 30,-10,-30,
        -30,-10, 20, 30, 30, 20,-10,-30,
        -30,-20,-10,  0,  0,-10,-20,-30,
        -50,-40,-30,-20,-20,-30,-40,-50,
    ]
    
    // Pawns should dominate the center and protect the king early game,
    // but should aim to promote in endgames
    static pawnMid = [
         0,  0,  0,  0,  0,  0,  0,  0,
         5, 10, 10,-20,-20, 10, 10,  5,
         5, -5,-10,  0,  0,-10, -5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5,  5, 10, 25, 25, 10,  5,  5,
        10, 10, 20, 30, 30, 20, 10, 10,
        50, 50, 50, 50, 50, 50, 50, 50,
         0,  0,  0,  0,  0,  0,  0,  0,
    ]

    static pawnEnd = [
        0,  0,  0,  0,  0,  0,  0,  0,
        10, 10, 10, 10, 10, 10, 10, 10,
        20, 20, 20, 20, 20, 20, 20, 20,
        30, 30, 30, 30, 30, 30, 30, 30,
        45, 45, 45, 45, 45, 45, 45, 45,
        60, 60, 60, 60, 60, 60, 60, 60,
        90, 90, 90, 90, 90, 90, 90, 90,
        0,  0,  0,  0,  0,  0,  0,  0
    ]

    // Knight is slightly less useful in endgames, but should still take
    // control over the center
    static knightMid = [
        -50, -40, -30, -30, -30, -30, -40, -50,
        -40, -20,   0,   5,   5,   0, -20, -40,
        -30,   5,  15,  20,  20,  15,   5, -30,
        -30,  10,  20,  30,  30,  20,  10, -30,
        -30,   5,  20,  30,  30,  20,   5, -30,
        -30,   0,  15,  20,  20,  15,   0, -30,
        -40, -20,   0,   0,   0,   0, -20, -40,
        -50, -40, -30, -30, -30, -30, -40, -50
    ]

    static knightEnd = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ]

    // Bishops are usually a bit stronger in endgames, as there
    // are more open diagonals
    static bishopMid = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  0, 10, 15, 15, 10,  0,-10,
        -10,  5,  5, 15, 15,  5,  5,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ]

    static bishopEnd = [
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 15, 15, 10, 10,-10,
        -10, 10, 15, 20, 20, 15, 10,-10,
        -10, 10, 15, 15, 15, 15, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    ]

    // Rooks get a lot stronger when there are fewer pieces left
    static rookMid = [
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  5, 10, 15, 15, 10,  5,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        0,  0,  5, 10, 10,  5,  0,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        0,  0,  5, 10, 10,  5,  0,  0
    ]

    static rookEnd = [
        0,  5, 10, 15, 15, 10,  5,  0,
        5, 10, 15, 20, 20, 15, 10,  5,
        0,  5, 10, 15, 15, 10,  5,  0,
        0,  5, 10, 15, 15, 10,  5,  0,
        0,  5, 10, 15, 15, 10,  5,  0,
        0,  5, 10, 15, 15, 10,  5,  0,
        5, 10, 10, 10, 10, 10, 10,  5,
        0,  5, 10, 15, 15, 10,  5,  0
    ]

    // Queen is way stronger in endgames as it has a lot of mobility
    static queenMid = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5, 10, 10,  5,  0, -5,
      0,  0,  5, 10, 10,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
    ]

    static queenEnd = [
        -20,-10,-10, -5, -5,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -5,  0, 10, 15, 15, 10,  0, -5,
        0,  0, 10, 15, 15, 10,  0, -5,
        -5,  5, 10, 10, 10, 10,  5, -5,
        -10,  0,  5,  0,  0,  0,  0,-10,
        -20,-10,-10, -5, -5,-10,-10,-20
    ]

    // map arrays
    static {
        // Maps for midgame
        this.midMapForPiece[Piece.king   | Piece.white] = this.kingMid
        this.midMapForPiece[Piece.pawn   | Piece.white] = this.pawnMid
        this.midMapForPiece[Piece.knight | Piece.white] = this.knightMid
        this.midMapForPiece[Piece.bishop | Piece.white] = this.bishopMid
        this.midMapForPiece[Piece.rook   | Piece.white] = this.rookMid
        this.midMapForPiece[Piece.queen  | Piece.white] = this.queenMid

        this.midMapForPiece[Piece.king   | Piece.black] = this.MirroredMap(this.kingMid)
        this.midMapForPiece[Piece.pawn   | Piece.black] = this.MirroredMap(this.pawnMid)
        this.midMapForPiece[Piece.knight | Piece.black] = this.MirroredMap(this.knightMid)
        this.midMapForPiece[Piece.bishop | Piece.black] = this.MirroredMap(this.bishopMid)
        this.midMapForPiece[Piece.rook   | Piece.black] = this.MirroredMap(this.rookMid)
        this.midMapForPiece[Piece.queen  | Piece.black] = this.MirroredMap(this.queenMid)

        // Maps for endgames
        this.endMapForPiece[Piece.king   | Piece.white] = this.kingEnd
        this.endMapForPiece[Piece.pawn   | Piece.white] = this.pawnEnd
        this.endMapForPiece[Piece.knight | Piece.white] = this.knightEnd
        this.endMapForPiece[Piece.bishop | Piece.white] = this.bishopEnd
        this.endMapForPiece[Piece.rook   | Piece.white] = this.rookEnd
        this.endMapForPiece[Piece.queen  | Piece.white] = this.queenEnd

        this.endMapForPiece[Piece.king   | Piece.black] = this.MirroredMap(this.kingEnd)
        this.endMapForPiece[Piece.pawn   | Piece.black] = this.MirroredMap(this.pawnEnd)
        this.endMapForPiece[Piece.knight | Piece.black] = this.MirroredMap(this.knightEnd)
        this.endMapForPiece[Piece.bishop | Piece.black] = this.MirroredMap(this.bishopEnd)
        this.endMapForPiece[Piece.rook   | Piece.black] = this.MirroredMap(this.rookEnd)
        this.endMapForPiece[Piece.queen  | Piece.black] = this.MirroredMap(this.queenEnd)
    }

    static MirroredMap(map){
        // Set up a mirrored map to be used by the black pieces
        const mirroredMap = new Array(64)
        for (let i = 0; i<64; i++){
            const mirrorIndex = this.mirroredBoard[i]
            mirroredMap[i] = map[mirrorIndex]
        }
        return mirroredMap
    }

    static MidgameValue(piece, square){
        const mapMid = this.midMapForPiece[piece]
        const bonusMid = mapMid[square]
        return bonusMid
    }

    static EndgameValue(piece, square){
        const mapEnd = this.endMapForPiece[piece]
        const bonusEnd = mapEnd[square]
        return bonusEnd
    }
}