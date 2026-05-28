import { Piece } from "../Board/piece.js"

export class PieceSquareTables {
    static mirroredBoard = new Array(64)
    static midMapForPiece = Array(32)
    
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

    static kingMid = [
         40,  40,  100,  0,   0,  40, 100,  40,
         30,  30,  10,   0,   0,  10,  30,  30,
         10,  10,   5,   0,   0,   5,  10,  10,
          0,   0,   0, -10, -10,   0,   0,   0,
        -10, -10, -10, -20, -20, -10, -10, -10,
        -20, -20, -20, -30, -30, -20, -20, -20,
        -30, -30, -30, -40, -40, -30, -30, -30,
        -40, -40, -40, -50, -50, -40, -40, -40,
    ]

    static pawnMid = [
        0,  0,  0,   0,  0,  0,  0,  0,
        10, 10, 10,-10,-10, 10, 10, 10,
        5,  5,  10, 20, 20, 10,  5,  5,
        5,  5,  15, 25, 25, 15,  5,  5,
        10, 10, 20, 30, 30, 20, 10, 10,
        20, 20, 30, 35, 35, 30, 20, 20,
        30, 30, 30, 30, 30, 30, 30, 30,
        0,  0,   0,  0,  0,  0,  0,  0
    ]

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

    // map array
    static {
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

    static Value(piece, square){
        // Flexible for adding a new map for endgames
        const mapMid = this.midMapForPiece[piece]
        const bonusMid = map[square]
        return bonusMid
    }
}