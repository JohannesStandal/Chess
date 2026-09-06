import { Piece } from "../Board/piece.js"
export class ChessHelper {
    static numSquaresToEdge = new Array(64)
    
    static indexToLetter = new Array(64)
    static letterToIndex = {}

    static updateCastleRights = [
        //Queen side <- | -> King side
        11, 15, 15, 15,  3, 15, 15,  7,   // Utilizing & operator to remove castle rights
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b0111 = 7  => remove white kingside castle
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1011 = 11 => remove white queenside castle
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b0011 = 3  => remove all white castling
        15, 15, 15, 15, 15, 15, 15, 15,   // 
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1101 = 13 => remove black kingside castle
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1110 = 14 => remove black queenside castle
        14, 15, 15, 15, 12, 15, 15, 13,   // 0b1100 = 12 => remove all black castling
    ]

    // Precompute numbers of squares to the edge for different 
    // Direction offsets
    static {
        for (let file = 0; file < 8; file++){
            for (let rank = 0; rank < 8; rank++){
                
                const squareIndex = rank * 8 + file

                const numNorth = 7 - rank
                const numEast = 7 - file
                const numSouth = rank
                const numWest = file 

                this.numSquaresToEdge[squareIndex] = [
                    numWest,
                    numEast,
                    numNorth,
                    numSouth,
                    Math.min(numNorth, numEast),
                    Math.min(numSouth, numWest),
                    Math.min(numWest, numNorth),
                    Math.min(numEast, numSouth),
                ]
            }
        }
    }
    // Precompute Index to letter
    static {
        const letters = "abcdefgh"
        for (let rank = 0; rank < 8; rank++){
            for (let file = 0; file < 8; file++){
                let index = rank * 8 + file
                this.indexToLetter[index] = letters[file] + String(rank+1)
            }
        }
    }
    // Precompute letter to Index
    static {
        for (let i = 0; i < 64; i++){
            const letter = this.indexToLetter[i]
            this.letterToIndex[letter] = i
        }
    }

    static isInsufficientMaterial(board) {
    let whitePieces = []
    let blackPieces = []

    for (let i = 0; i < 64; i++) {
        const piece = board.square[i]
        if (piece == 0) continue
        if (Piece.CheckPieceColor(piece, true)) whitePieces.push(piece)
        else blackPieces.push(piece)
    }

    // Fjern konger
    whitePieces = whitePieces.filter(p => !Piece.IsType(p, Piece.king))
    blackPieces = blackPieces.filter(p => !Piece.IsType(p, Piece.king))

    // Begge bare konge
    if (whitePieces.length === 0 && blackPieces.length === 0) return true

    // Konge + løper eller konge + springer mot bare konge
    const simpleMinor = (pieces) =>
        pieces.length === 1 && (Piece.IsType(pieces[0], Piece.bishop) || Piece.IsType(pieces[0], Piece.knight))

    if ((simpleMinor(whitePieces) && blackPieces.length === 0) ||
        (simpleMinor(blackPieces) && whitePieces.length === 0)) {
        return true
    }

    // Løper mot løper, samme farge (mer avansert sjekk kan legges til senere)
    return false
}

    static RankIndex(squareIndex){
        return Math.floor(squareIndex / 8)
    }

    static FileIndex(squareIndex){
        return squareIndex % 8
    }

    static SquareIndex(rank, file){
        return rank * 8 + file
    }

    static ColorHasInsufficientMaterial(board, color){
        const numPawns   = board.pl.Count(color | Piece.pawn  )
        const numKnights = board.pl.Count(color | Piece.knight)
        const numBishops = board.pl.Count(color | Piece.bishop)
        const numRooks   = board.pl.Count(color | Piece.rook  )
        const numQueens  = board.pl.Count(color | Piece.queen )

        const numTotal = numPawns + numKnights + numBishops + numRooks + numQueens

        // King + two pieces or more is always sufficient
        if (1 < numTotal) return false

        // lone king
        if (numTotal == 0) return true

        // lone bishop or knight
        if (numBishops == 1 || numKnights == 1) return true

        // We have enough material
        return false
    }

    static manhattanDistance(square1, square2){
        const file1 = this.FileIndex(square1)
        const rank1 = this.RankIndex(square1)

        const file2 = this.FileIndex(square2)
        const rank2 = this.RankIndex(square2)

        const dst = Math.abs(file1 - file2) + Math.abs(rank1 - rank2)
        return dst
    }

    static InsufficientMaterial(board){
        const white = this.ColorHasInsufficientMaterial(board, Piece.white)
        const black = this.ColorHasInsufficientMaterial(board, Piece.black)

        return (white && black)
    }
    
}

