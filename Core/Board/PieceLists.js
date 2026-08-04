import { Piece } from "./piece.js"

export class PieceLists {
    constructor() {

        // White pieces
        this.nWhitePawns = 0
        this.nWhiteKnights = 0
        this.nWhiteBishops = 0
        this.nWhiteRooks = 0
        this.nWhiteQueens = 0

        this.whitePawnsList = new Array(8)   // Max 8 pawns
        this.whiteKnightList = new Array(10) // Max 10 knights
        this.whiteBishopList = new Array(10) // Max 10 bishops
        this.whiteRookList = new Array(10)   // Max 10 rooks
        this.whiteQueenList = new Array(10)  // Max 10 queens

        // Black pieces
        this.nBlackPawns = 0
        this.nBlackKnights = 0
        this.nBlackBishops = 0
        this.nBlackRooks = 0
        this.nBlackQueens = 0

        this.blackPawnsList = new Array(8)   // Max 8 pawns
        this.blackKnightList = new Array(10) // Max 10 knights
        this.blackBishopList = new Array(10) // Max 10 bishops
        this.blackRookList = new Array(10)   // Max 10 rooks
        this.blackQueenList = new Array(10)  // Max 10 queens
        
        // Keep track of a pieces index in their corresponding piece list
        this.pieceListIndexes = new Uint16Array(64)

        // Easy acces to the different lists
        this.listFromPiece = new Array(22)

        this.listFromPiece[Piece.pawn   | Piece.white] = this.whitePawnsList
        this.listFromPiece[Piece.knight | Piece.white] = this.whiteKnightList
        this.listFromPiece[Piece.bishop | Piece.white] = this.whiteBishopList
        this.listFromPiece[Piece.rook   | Piece.white] = this.whiteRookList
        this.listFromPiece[Piece.queen  | Piece.white] = this.whiteQueenList

        this.listFromPiece[Piece.pawn   | Piece.black] = this.blackPawnsList
        this.listFromPiece[Piece.knight | Piece.black] = this.blackKnightList
        this.listFromPiece[Piece.bishop | Piece.black] = this.blackBishopList
        this.listFromPiece[Piece.rook   | Piece.black] = this.blackRookList
        this.listFromPiece[Piece.queen  | Piece.black] = this.blackQueenList
    }

    Add(){
        
    }


}