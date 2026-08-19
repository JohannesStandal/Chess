//Hovudklasse for sjakkbrettet
//Denne klassen simulerer reglar for sjakkbrettet og er 
//Hjernen bak programmet

const maxNumMoves = 512

import { ChessHelper } from "../Utils/Chess_Helper.js"
import { zobristHash } from "./hashing.js"
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
        this.capturedPieceHistory = new Array(maxNumMoves)
        this.castlingRightsHistory = new Array(maxNumMoves)
        this.epSquareHistory = new Array (maxNumMoves)

        this.hashHighHistory = new Array (maxNumMoves)
        this.hashLowHistory = new Array (maxNumMoves)
        
        // Hash
        this.hash = new zobristHash()

        // Track pieces
        this.whiteKingSquare = 0
        this.blackKingSquare = 0

        
        this.pl = new PieceLists()
    }

    Reset(){
        this.ply = 0
        this.halfMoveClock = 0

        this.square = new Uint8Array(64).fill(0)

        this.capturedPieceHistory = new Array(maxNumMoves)
        this.castlingRightsHistory = new Array(maxNumMoves)
        this.epSquareHistory = new Array (maxNumMoves)

        this.hashHighHistory = new Array (maxNumMoves)
        this.hashLowHistory = new Array (maxNumMoves)

        this.playedMoves = []
        this.playedMovesUCI = []

        this.pl.Clear()
        
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
        this.hash.CreateHash(this)

        this.hashHighHistory[this.ply] = this.hash.high
        this.hashLowHistory [this.ply] = this.hash.low
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
        // this.playedMoves.push(move)
        // this.playedMovesUCI.push(Move.ToUCI(move))

        if (move == null){
            console.log("Null move wtf? position was")
            console.log(this.Export_Fen())
        }
            
        // decode move
        const start = Move.Start(move)
        const target = Move.Target(move)
        const flag = Move.Flag(move)

        const movedPiece = this.square[start]
        const capturedPiece = this.square[target]

        if (movedPiece == Piece.none){
            console.error("No piece moved in make move WTF")
        }

        // save game state for unmake move
        this.capturedPieceHistory[this.ply] = capturedPiece
        this.castlingRightsHistory[this.ply] = this.castlingRights
        this.epSquareHistory[this.ply] = this.enPassantSquare

        this.hashHighHistory[this.ply] = this.hash.high
        this.hashLowHistory[this.ply] = this.hash.low
        
        this.ply ++
        
        // update castling rights
        this.castlingRights &= ChessHelper.updateCastleRights[start] 
        this.castlingRights &= ChessHelper.updateCastleRights[target]

        // moving the piece
        this.square[target] = movedPiece
        this.square[start] = 0

        // update piece list
        this.pl.Remove(capturedPiece, target)
        this.pl.Move(movedPiece, start, target)

        // update hash for the capture and move
        this.hash.Remove(capturedPiece, target)
        this.hash.Move(movedPiece, start, target)

        // en-passant capture
        if (flag == Move.flags.epCapture){
            // remove pawn from piece list
            const pawn = this.square[this.enPassantSquare]
            // Remove pawn from piece list
            this.pl.Remove(pawn, this.enPassantSquare)

            // Remove pawn from board
            this.square[this.enPassantSquare] = 0
        }

        // updates en-passant square
        if (flag == Move.flags.doublePush){
            this.enPassantSquare = target

            // Add ep square from hash
            this.hash.EnPassantSquare(this.enPassantSquare)
            

        }
        else {
            // Remove ep square from hash
            this.hash.EnPassantSquare(this.enPassantSquare)
            
            this.enPassantSquare = null
        }


        // promotion logic
        if (Move.IsPromotion(move)){
            // create new piece
            const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen]
            const pieceType = pieceTypes[flag & 0b0011]
            const color = movedPiece & 0b11000
            
            const newPiece = color | pieceType

            this.square[target] = newPiece

            // Replace pawn with promoted piece in piece lists
            this.pl.Remove(movedPiece, target)
            this.pl.Add(newPiece, target)

            // Replace pawn with promoted piece in hash
            this.hash.Remove(movedPiece, target)
            this.hash.Add(newPiece, target)
        }

        // incremental king tracking (kind of reduntand with pl but meeh)
        if (movedPiece == (Piece.white | Piece.king)) this.whiteKingSquare = target
        if (movedPiece == (Piece.black | Piece.king)) this.blackKingSquare = target

        // Move the rook when castling
        if (flag == Move.flags.kingCastle){
            const rookSquare = start + 3
            const targetSquare = start + 1

            const rook = this.square[rookSquare]

            this.square[targetSquare] = rook
            this.square[rookSquare] = 0
            
            // Move rook in pl and hash
            this.pl.Move(rook, rookSquare, targetSquare)
            this.hash.Move(rook, rookSquare, targetSquare)
        }
        // same for queenside
        else if (flag == Move.flags.queenCastle){
            const rookSquare = start - 4
            const targetSquare = start - 1

            const rook = this.square[rookSquare]

            this.square[targetSquare] = rook
            this.square[rookSquare] = 0

            // Move rook in pl and hash
            this.pl.Move(rook, rookSquare, targetSquare)
            this.hash.Move(rook, rookSquare, targetSquare)
        }
        
        // Switch color to move
        this.white_To_Move = !this.white_To_Move
        this.hash.whiteToMove()
    }

    Unmake_Move(move){
        this.playedMoves.pop()
        this.playedMovesUCI.pop()

        // Restores the previous position if one exists
        if (this.ply == 0) return
        
        // Flips the turn
        this.white_To_Move = !this.white_To_Move
        
        // Restore lost data from history tables
        this.ply--

        
        this.castlingRights = this.castlingRightsHistory[this.ply]
        this.enPassantSquare = this.epSquareHistory[this.ply]
        this.hash.hash = this.hashHistory[this.ply]

        // decode move
        const start = Move.Start(move)
        const target = Move.Target(move)
        const flag = Move.Flag(move)

        const capturedPiece = this.capturedPieceHistory[this.ply]
        const movedPiece = this.square[target]

        if (movedPiece == Piece.none){
            console.error("\n No piece moved in unmakeMove WTF? Line was")
            console.error(this.playedMovesUCI)
            console.error(this.playedMoves)
            console.error("\n")
        }
            

        const friendlyColor = (this.white_To_Move) ? Piece.white : Piece.black

        // Undo the move
        this.square[start]  = movedPiece
        this.square[target] = capturedPiece

        this.pl.Move(movedPiece, target, start)
        this.pl.Add(capturedPiece, target)

        // checking if the moved piece was a promoted pawn
        if (Move.IsPromotion(move)){
            // Replace the promoted piece with a pawn
            const pawn = Piece.pawn | friendlyColor
            this.square[start] = pawn
            
            // Replace promoted piece in the piece list
            this.pl.Remove(movedPiece, start)
            this.pl.Add(pawn, start)
        }

        // move rook back in case of castling
        if (flag == Move.flags.kingCastle){
            const rook = Piece.rook | friendlyColor
            
            const rookStart = start + 3
            const rookEnd = start + 1

            this.square[rookStart] = rook
            this.square[rookEnd] = 0

            this.pl.Move(rook, rookEnd, rookStart)
        }
        else if (flag == Move.flags.queenCastle){
            const rook = Piece.rook | friendlyColor
            
            const rookStart = start - 4
            const rookEnd = start - 1

            this.square[rookStart] = rook
            this.square[rookEnd] = 0

            this.pl.Move(rook, rookEnd, rookStart)
        }
        
        // en passant capture
        if (flag == Move.flags.epCapture){
            const enemyColor = (this.white_To_Move) ? Piece.black : Piece.white
            const pawn = Piece.pawn | enemyColor

            this.square[this.enPassantSquare] = pawn
            this.pl.Add(pawn, this.enPassantSquare)
        }

        // incremental king tracking
        if (movedPiece == (Piece.white | Piece.king)) this.whiteKingSquare = start
        if (movedPiece == (Piece.black | Piece.king)) this.blackKingSquare = start

    }

    Make_NullMove(){
        // A null move is simply skipping your turn.
        
        // store history stuff
        this.epSquareHistory[this.ply] = this.enPassantSquare
        this.capturedPieceHistory[this.ply] = Piece.none
        this.castlingRightsHistory[this.ply] = this.castlingRights
        this.hashHistory[this.ply] = this.hash.hash
        
        // skip your turn
        this.white_To_Move = !this.white_To_Move
        this.hash.toggleTurn()
        
        // remove ep square
        this.enPassantSquare = null

        this.ply += 1
    }

    Unmake_NullMove(){
        // A null move is simply skipping your turn.
        this.ply --

        // get history stuff
        this.enPassantSquare = this.epSquareHistory[this.ply]
        this.hash.hash = this.hashHistory[this.ply]
        
        // skip your turn
        this.white_To_Move = !this.white_To_Move
        this.hash.toggleTurn()
    }

    HasNonPawnMaterial(){
        const color = this.white_To_Move ? Piece.white : Piece.black


        const numBishops = this.pl.Count(color | Piece.bishop)
        const numRooks   = this.pl.Count(color | Piece.rook  )
        const numQueens  = this.pl.Count(color | Piece.queen )

        return 0 < (numBishops + numRooks + numQueens)
    }

    CheckThreeFold(){

        const currentHigh = this.hash.high
        const currentLow = this.hash.low

        let frequency = 1
        let end = this.ply

        for (let i = 0; i < end; i++){
            const high = this.hashHighHistory[i]
            const low  = this.hashLowHistory[i]

            if (currentHigh == high && currentLow == low){
                frequency ++
            }
            if (2 < frequency){
                return true
            }
        }

        return false
    }
}
