//Hovudklasse for sjakkbrettet
//Denne klassen simulerer reglar for sjakkbrettet og er 
//Hjernen bak programmet

const maxNumMoves = 512

import { ChessHelper } from "../Utils/Chess_Helper.js"
import { zobrist_hashing} from "./zobrist_hashing.js"
import { Piece} from "./piece.js"
import { Move } from "./move.js"
import { PieceLists } from "./PieceLists.js"

export class Board {
    constructor(){
        // board representation
        this.square = new Uint8Array(64).fill(0)
        this.white_To_Move = true
        this.castlingRights = 0b1111
        this.halfMoveClock = 0
        this.enPassantSquare = null
        this.ply = 0
        
        // history 
        this.playedMoves = []
        this.capturedPieceHistory = new Array(maxNumMoves)
        this.castlingRightsHistory = new Array(maxNumMoves)
        this.epSquareHistory = new Array (maxNumMoves)
        this.hashHistory = new Array (maxNumMoves)
        
        // Hash
        this.zobrist = new zobrist_hashing()

        // Track pieces
        this.whiteKingSquare = 0
        this.blackKingSquare = 0

        
        this.pl = new PieceLists()
    }

    Reset(){
        this.square = new Array(64).fill(0)
        this.stack = []
        this.playedMoves = []
        this.repetitionTable = []
    }

    Load_Fen(fen){
        // Empty the board
        this.Reset()

        // Parse the fen info: position, color to move, castle rights, EP square, halfmove clock
        const data = fen.split(" ")
        const piece_positions = data[0].split("")

        // Set up the positon
        let file = 0
        let rank = 7

        piece_positions.forEach(char => {
            if (char == "/"){
                // Start next rank
                file = 0
                rank --
            }
        
            else {
                // jump to next file specified by number
                if (!isNaN(char)){
                    file += parseInt(char)
                }
        
                else {
                    // piece data
                    const color = (char == char.toLowerCase()) ? Piece.black : Piece.white
                    const piece = color | Piece.From_Symbol[char.toLowerCase()]
                    const index = rank * 8 + file

                    // place the piece
                    this.square[index] = piece

                    // track kings
                    if (piece == (Piece.white | Piece.king)) this.whiteKingSquare = index
                    if (piece == (Piece.black | Piece.king)) this.blackKingSquare = index

                    // add to Piece Lists
                    this.pl.Add(piece, index)
                    file ++
                }
            }
        });

        // Side to move
        this.white_To_Move = (data[1] == "w") 
        
        // Castle Rights
        this.castlingRights = 0b0000
        const castlingRights = data[2].split("")
        castlingRights.forEach(char => {
            if (char == "-") this.castlingRights = 0b0000
            else if (char == "K") this.castlingRights += 0b1000
            else if (char == "Q") this.castlingRights += 0b0100
            else if (char == "k") this.castlingRights += 0b0010
            else if (char == "q") this.castlingRights += 0b0001
        })

        // Hash
        this.zobrist.createHash(this.square, this.white_To_Move)
        this.hashHistory = [this.zobrist.hash]
    }

    Export_Fen(){
        // Board
        let fen = ""

        for (let rank = 7; 0 <= rank; rank--){
            let empty = 0
            for (let file = 0; file < 8; file++){
                
                const squareIndex = rank * 8 + file
                const piece = this.square[squareIndex]

                if (piece == 0){
                    empty ++
                    continue
                }
                
                if (1 <= empty){
                    fen += String(empty)
                }
                
                empty = 0
                const symbol = Piece.From_Number[piece]
                //console.log(squareIndex, piece, symbol)
                fen += symbol
            }

            if (1 <= empty) fen += String(empty)
            if (0 < rank) fen += "/"
        }
        // side to move
        const sideToMove = (this.white_To_Move) ? " w " : " b "
        fen += sideToMove

        // castling rights
        const lookUp = ["", "q", "k", "kq"]
        // 00 = -, 01 = q, 10 = k, 11 = kq
        fen += lookUp[(this.castlingRights >> 2) & 0b11].toUpperCase()
        fen += lookUp[this.castlingRights & 0b11]

        if (this.castlingRights == 0) fen += "-"

        // ep square 
        if (this.enPassantSquare == null){
            fen += " -"
        }
        else {
            fen += " " + String(this.enPassantSquare)
        }
        // half move clock
        fen += " 0 0"
        return fen
    }
    
    Make_Move(move){
        // decode move
        const start = Move.Start(move)
        const target = Move.Target(move)
        const flag = Move.Flag(move)


        let capturedPiece = this.square[target]

        // save game state for unmake move
        this.capturedPieceHistory[this.ply] = capturedPiece
        this.castlingRightsHistory[this.ply] = this.castlingRights
        this.epSquareHistory[this.ply] = this.enPassantSquare
        this.hashHistory[this.ply] = this.zobrist.hash
        this.playedMoves[this.ply] = move
        
        this.ply ++
        
        // Update hash
        this.zobrist.incrementHash(move, this)
        
        // update castling rights
        this.castlingRights &= ChessHelper.updateCastleRights[start] 
        this.castlingRights &= ChessHelper.updateCastleRights[target]

        // en-passant capture
        if (flag == Move.flags.epCapture){
            capturedPiece = this.square[this.enPassantSquare]
            this.square[this.enPassantSquare] = 0
        }

        // updates en-passant square
        if (flag == Move.flags.doublePush){
            this.enPassantSquare = target
        }
        else {
            this.enPassantSquare = null
        }

        // Find original piece
        let movedPiece = this.square[start]

        // promotion logic
        if (Move.IsPromotion(move)){
            // create new piece
            const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen]
            const color = movedPiece & 0b11000

            const pieceType = pieceTypes[flag & 0b0011]
            
            movedPiece = color | pieceType
        } 

        // moving the piece
        this.square[target] = movedPiece
        this.square[start] = 0

        // incremental king tracking
        if (movedPiece == (Piece.white | Piece.king)) this.whiteKingSquare = target
        if (movedPiece == (Piece.black | Piece.king)) this.blackKingSquare = target

        // if there is a castle, the rook should be moved as well
        if (flag == Move.flags.kingCastle){
            const rookSquare = start + 3
            const targetSquare = start + 1

            this.square[targetSquare] = this.square[rookSquare]
            this.square[rookSquare] = 0
        }
        else if (flag == Move.flags.queenCastle){
            const rookSquare = start - 4
            const targetSquare = start - 1

            this.square[targetSquare] = this.square[rookSquare]
            this.square[rookSquare] = 0
        }
        
        
        // flip turn and store game history
        this.white_To_Move = !this.white_To_Move
        
    }

    Unmake_Move(move){
        //sjekkar om det eksisterer ein spelhistorikk
        //Dersom det ikkje er det avbryter den operasjonen
        if (this.ply == 0) return
        
        // Flips the turn
        this.white_To_Move = !this.white_To_Move
        

        // Restore lost data from history tables
        this.ply--

        const capturedPiece = this.capturedPieceHistory[this.ply]
        this.castlingRights = this.castlingRightsHistory[this.ply]
        this.enPassantSquare = this.epSquareHistory[this.ply]
        this.zobrist.hash = this.hashHistory[this.ply]

        this.playedMoves[this.ply] = 0

        // decode move
        const start = Move.Start(move)
        const target = Move.Target(move)
        const flag = Move.Flag(move)

        // Reconstructing position
        let movedPiece = this.square[target]
        //const capturedPiece = previousPosition.capturedPiece
        
        const friendlyColor = (this.white_To_Move) ? Piece.white : Piece.black
        // checking if the moved piece was a promoted pawn
        if (Move.IsPromotion(move)){
            movedPiece = Piece.pawn | friendlyColor
        }

        this.square[start] = movedPiece
        this.square[target] = capturedPiece

        // move rook back in case of castling
        if (flag == Move.flags.kingCastle){
            this.square[start + 1] = 0
            this.square[start + 3] = Piece.rook | friendlyColor
        }
        else if (flag == Move.flags.queenCastle){
            this.square[start - 1] = 0
            this.square[start - 4] = Piece.rook | friendlyColor
        }
        
        // en passant capture
        if (flag == Move.flags.epCapture){
            const enemyColor = (this.white_To_Move) ? Piece.black : Piece.white
            this.square[this.enPassantSquare] = Piece.pawn | enemyColor
        }

        // incremental king tracking
        if (movedPiece == (Piece.white | Piece.king)) this.whiteKingSquare = start
        if (movedPiece == (Piece.black | Piece.king)) this.blackKingSquare = start

    }

    CheckThreeFold(){
        return false

        const currentPosHash = this.zobrist.hash
        let frequency = 1
        let end = this.ply

        for (let i = 0; i < end; i++){
            const hash = this.hashHistory[i]
            if (hash == currentPosHash){
                frequency ++
            }
            if (2 < frequency){
                return true
            }
        }

        return false
    }
}
