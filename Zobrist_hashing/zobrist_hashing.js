class zobrist_hashing {
    constructor(){
        this.hash = 0
    }

    createHash(board){
        this.hash = 0
        for (let i = 0; i < 64; i++){
            const pieceType = board.square[i]
            this.hash ^= zobrist_hash_values[pieceType][i]
        }
    }

    removePiece(square, piece){
        this.hash ^= zobrist_hash_values[pieceType][square]
    }

    addPiece(square, piece){
        this.hash ^= zobrist_hash_values[pieceType][square]
    }

    function
}

console.log(zobrist_hash_values[Piece.black | Piece.rook][63])