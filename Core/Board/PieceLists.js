import { Piece } from "./piece.js"

export class PieceLists {
    constructor() {
        this.listFromPiece = new Array(32)

        this.listFromPiece[Piece.king   | Piece.white] = []
        this.listFromPiece[Piece.pawn   | Piece.white] = []
        this.listFromPiece[Piece.knight | Piece.white] = []
        this.listFromPiece[Piece.bishop | Piece.white] = []
        this.listFromPiece[Piece.rook   | Piece.white] = []
        this.listFromPiece[Piece.queen  | Piece.white] = []

        this.listFromPiece[Piece.king   | Piece.black] = []
        this.listFromPiece[Piece.pawn   | Piece.black] = []
        this.listFromPiece[Piece.knight | Piece.black] = []
        this.listFromPiece[Piece.bishop | Piece.black] = []
        this.listFromPiece[Piece.rook   | Piece.black] = []
        this.listFromPiece[Piece.queen  | Piece.black] = []

        // Keep track of a pieces index in their corresponding piece list
        this.pieceListIndexes = new Uint16Array(64)
    }

    Count(piece){
        return this.listFromPiece[piece].length
    }

    Add(piece, squareIndex){
        // Find corresponding piece list
        const list = this.listFromPiece[piece]
        
        // Add to list and track index
        list.push(squareIndex)
        this.pieceListIndexes[squareIndex] = list.length
    }

}