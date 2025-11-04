class zobrist_hashing {
    constructor(){
        this.hash = BigInt(0)
    }

    createHash(board){
        this.hash = BigInt(0)
        for (let squareIndex = 0; squareIndex < 64; squareIndex++){
            const pieceType = board[squareIndex]
            if (pieceType == 0) continue
            this.hash ^= zobrist_hash_values[pieceType][squareIndex]
        }
        console.log(this.hash)
    }

    removePiece(square, pieceType){
        this.hash ^= zobrist_hash_values[pieceType][square]
    }

    addPiece(square, piece){
        this.hash ^= zobrist_hash_values[pieceType][square]
    }

    updateHash(move, board){
        
    }
}

console.log(zobrist_hash_values[Piece.black | Piece.rook][63])