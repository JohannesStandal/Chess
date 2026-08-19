import { Piece } from "./piece.js"
import { Move } from "./move.js"

import {
    pieceHashHigh, pieceHashLow, 
    epHashHigh, epHashLow, 
    castleHigh, castleLow, 
    whiteToMoveHigh, whiteToMoveLow
} from "../Constants/hashValues.js"


export class zobristHash {
    constructor(){
        // High and low 32 bit numbers as JS does not feature native 64 bit
        this.high = 0
        this.low = 0 
    }

    // Add and remove does the same, but this naming makes it far more intuitive to use
    Add(piece, squareIndex){
        // Adding a piece to the hash
        const index = piece * 64 + squareIndex

        this.high ^= pieceHashHigh[index]
        this.low  ^= pieceHashLow [index]
    }

    Remove(piece, squareIndex){
        // Removing a piece from the hash
        const index = piece * 64 + squareIndex
        
        this.high ^= pieceHashHigh[index]
        this.low  ^= pieceHashLow [index]
    }

    Move(piece, from, to){
        // Moving a piece in the hash
        this.Remove(piece, from)
        this.Add(piece, to)
    }

    EnPassantSquare(squareIndex){
        // Null check
        if (squareIndex == null) return

        this.high ^= epHashHigh[squareIndex]
        this.low  ^= epHashLow [squareIndex]
    }

    CastlingRights(castlingRightsUpdate){
        // castlingRights is a 4 bit integer

        // white king
        if (castlingRightsUpdate & 0b1000){
            this.high ^= castleHigh[0]
            this.low  ^= castleLow [0]
        }

        // white queen
        if (castlingRightsUpdate & 0b0100){
            this.high ^= castleHigh[1]
            this.low  ^= castleLow [1]
        }

        // black king
        if (castlingRightsUpdate & 0b0010){
            this.high ^= castleHigh[2]
            this.low  ^= castleLow [2]
        }

        // black queen
        if (castlingRightsUpdate & 0b0001){
            this.high ^= castleHigh[3]
            this.low  ^= castleLow [3]
        }
    }
}