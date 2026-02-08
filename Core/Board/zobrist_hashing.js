import { zobrist_hash_values, hash_white_to_move} from "../../Constants/zobrist_hash_values.js"
import { Piece } from "./piece.js"
import { Move } from "./piece.js"

export class zobrist_hashing {
    constructor(){
        this.hash = BigInt(0)
    }

    createHash(board, white_to_move){
        this.hash = BigInt(0)
        for (let squareIndex = 0; squareIndex < 64; squareIndex++){
            const pieceType = board[squareIndex]
            this.hash ^= zobrist_hash_values[pieceType][squareIndex]
        }

        if (white_to_move) this.hash ^= hash_white_to_move
        //console.log(this.hash)
    }

    toggleTurn(){
        this.hash ^= hash_white_to_move
    }

    togglePiece(squareIndex, piece){
        this.hash ^= zobrist_hash_values[piece][squareIndex]
    }



    incrementHash(move, board){
        // increments a hash value based on move data
        const movedPiece = board.square[move.start]
        const capturedPiece = board.square[move.target]

        // remove the pieces from the hash
        this.togglePiece(move.start, movedPiece)

        // general logic
        // remove old piece -> check for en passant -> remove captured -> check promotion -> place new piece -> flip turn
        // extra logic for rook move in case of castling

        // remove captured piece
        if (move.IsCapture()){
            if (move.flag == Move.flags.epCapture){
                // remove pawn from en passant
                const pawn = board.square[board.enPassantSquare]
                this.togglePiece(board.enPassantSquare, pawn)
            }
            else {
                // remove general captured piece
                this.togglePiece(move.target, capturedPiece)
            }
        }
        
        let pieceToAdd = movedPiece
        // in case of promotion add the promotion piece, and not the orginally moved piece
        if (move.IsPromotion()){
            // generate promotion piece
             // create new piece
            const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen]
            const color = movedPiece & 0b11000
            const pieceType = pieceTypes[move.flag & 0b0011]
            pieceToAdd = color | pieceType
        }
        // add piece to hash
        this.togglePiece(move.target, pieceToAdd)

        // castling logic
        if (move.flag == Move.flags.kingCastle){
            const rookStart = move.start + 3
            const rookTarget = move.start + 1
            const rook = board.square[rookStart]
            this.togglePiece(rookStart, rook)
            this.togglePiece(rookTarget, rook)
        }
        else if (move.flag == Move.flags.queenCastle){
            const rookStart = move.start - 4
            const rookTarget = move.start - 1
            const rook = board.square[rookStart]
            this.togglePiece(rookStart, rook)
            this.togglePiece(rookTarget, rook)
        }

        // flip side to move
        this.toggleTurn()
    }
}