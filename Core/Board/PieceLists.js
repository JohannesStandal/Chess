import { Piece } from "./piece.js"

export class PieceLists {
    constructor() {
        this.listFromPiece = new Array(32)
        this.Clear()

        // Keep track of a pieces index in their corresponding piece list
        this.pieceListIndexes = new Uint16Array(64)
    }

    Clear(){
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
    }

    Count(piece){
        return this.listFromPiece[piece].length
    }

    Add(piece, squareIndex){
        if (piece == Piece.none) return
        
        // Find corresponding piece list
        const list = this.listFromPiece[piece]
        
        // Add to list and track index
        list.push(squareIndex)
        this.pieceListIndexes[squareIndex] = list.length - 1
    }

    Remove(piece, square){
        if (piece == Piece.none) return
        // Get the corresponding list and list index for the specific piece
        const list = this.listFromPiece[piece]
        const listIndex = this.pieceListIndexes[square]
        // console.log(list)
        // console.log(square, listIndex)
        // return

        // Get the list and square index for the piece at the end of the corresponding piece list
        const lastPieceIndex = list.length - 1
        const lastPieceSquare = list[lastPieceIndex]

        // Replace the piece we want to remove, with the last one in the list
        list[listIndex] = lastPieceSquare
        this.pieceListIndexes[lastPieceSquare] = listIndex

        // Remove last piece in the list
        list.pop()
    }

    Move(piece, startSquare, targetSquare){
        // Get the corresponding list and list index for the specific piece
        const list = this.listFromPiece[piece]
        const listIndex = this.pieceListIndexes[startSquare]

        // Update the piece in the piece list
        list[listIndex] = targetSquare
        
        // Update piecelist index lookup array
        this.pieceListIndexes[targetSquare] = listIndex
    }

    
}