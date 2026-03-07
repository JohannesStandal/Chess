//Hovudklasse for sjakkbrettet
//Denne klassen simulerer reglar for sjakkbrettet og er 
//Hjernen bak programmet

import { ChessHelper } from "../Utils/Chess_Helper.js"
import { zobrist_hashing} from "./zobrist_hashing.js"
import { Piece} from "./piece.js"
import { Move } from "./move.js"
import { AttackTables } from "../Constants/AttackTables.js"
AttackTables.init()

export class Board {
    constructor(){
        // blir fiksa når du lastar inn ein FEN
        this.square = new Uint8Array(64).fill(0)
        this.white_To_Move = true
        this.castlingRights = 0b1111
        this.halfMoveClock = 0
        this.enPassantSquare = null
        
        
        
        // lagrer spillhistorikk
        this.playedMoves = []
        this.stack = []
        this.repetitionTable = []
        this.zobrist = new zobrist_hashing()
        
        // Important data for generating legal moves
        this.pinMask = new Array(64).fill(0)
        this.blockingSquares = []
        this.checkers = []
        
    }

    Reset(){
        this.square = new Array(64).fill(0)
        this.stack = []
        this.playedMoves = []
    }

    //Denne funksjonen kan laste inn sjakkposisjonar frå standart sjakknotasjon (FEN)
    Load_Fen(fen){
        //Tømmer brett
        this.Reset()

        //Deler opp FEN i dei ulike infodelane
        // 0 = Posisjon, 1 = Spelar sin tur, 2 = Rokade, 3 = en pessant, 4/5 half move clock
        const data = fen.split(" ")
        const piece_positions = data[0].split("")

        //Setter opp posisjon
        let file = 0
        let rank = 7

        piece_positions.forEach(char => {
            if (char == "/"){
                file = 0
                rank --
            }
            else {
                if (!isNaN(char)){
                    file += parseInt(char)
                }
                else {
                    let color = (char == char.toLowerCase()) ? Piece.black : Piece.white
                    this.square[rank*8+file] = color | Piece.From_Symbol[char.toLowerCase()]
                    file ++
                }
            }
        });

        //Kven sin tur det er
        this.white_To_Move = (data[1] == "w") 
        
        //Rokade
        this.castlingRights = 0b0000
        const castlingRights = data[2].split("")
        castlingRights.forEach(char => {
            if (char == "-") this.castlingRights = 0b0000
            else if (char == "K") this.castlingRights += 0b1000
            else if (char == "Q") this.castlingRights += 0b0100
            else if (char == "k") this.castlingRights += 0b0010
            else if (char == "q") this.castlingRights += 0b0001
        })

        this.zobrist.createHash(this.square, this.white_To_Move)
        this.repetitionTable = [this.zobrist.hash]
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
        // lagrer spillhistorikk
        this.stack.push({
            // Posisjons info
            capturedPiece: capturedPiece,
            castlingRights:     this.castlingRights,
            enPassantSquare:    this.enPassantSquare,
            hash: this.zobrist.hash
        })
        //Oppdaterer variablar
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
        this.playedMoves.push(move)
        this.repetitionTable.push(this.zobrist.hash)

        // just to check for hash errors
        // const compare = new zobrist_hashing()
        // compare.createHash(this.square, this.white_To_Move)

        // if (this.zobrist.hash != compare.hash){
        //     console.error("Error with incremental HASH", [...this.playedMoves])
        //     this.zobrist.hash = compare.hash
        // }
    }

    Unmake_Move(move){
        //sjekkar om det eksisterer ein spelhistorikk
        //Dersom det ikkje er det avbryter den operasjonen
        if (this.stack.length == 0) return
        
        // Flips the turn
        this.white_To_Move = !this.white_To_Move

        //overfører data frå forrige posisjon
        const previousPosition = this.stack.pop()
        
        // stored position info
        this.castlingRights = previousPosition.castlingRights
        this.enPassantSquare = previousPosition.enPassantSquare
        this.zobrist.hash = previousPosition.hash
        
        // decode move
        const start = Move.Start(move)
        const target = Move.Target(move)
        const flag = Move.Flag(move)

        // Reconstructing position
        let movedPiece = this.square[target]
        const capturedPiece = previousPosition.capturedPiece
        
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

        // Remove move from gamehistory
        this.playedMoves.pop()
        this.repetitionTable.pop()
    }

    computeKingSafety(){
        
        /**
         *  This is a complex function to; locate kings, detect pinned pieces, find checks and doublecheks, as well as keep track of ways to resolve checks 
         * 
         * - If the kingAttackers array is empty, you can make any legal move accounting for pins
         * 
         * - If the kingAttackers array has one element, you must move to one of the blockingsquares.
         *   The blockingsquares array describes the path from the kingAttacker to the friendly king. 
         *   If your moves target square is in the blocker array it will resolve or block the check.
         *   
         *  - If the kingAttackers array has two elements, then there is a double check. In this case we only care about the king moves.
         * 
         */

        // Clear arrays
        this.pinMask.fill(0)
        this.checkers.length = 0
        this.blockingSquares.length = 0
        
        // the squares you can move to in order to resolve a check (either by blocking path or capturing the attacker)
        // This will be countered by a double check in wich we only generate king moves

        // update king locations
        let kings = ChessHelper.LocateKings(this)
        const friendlyKingSquare = (this.white_To_Move) ? kings[0] : kings[1]
        
        const enemyColor = (this.white_To_Move) ? Piece.black : Piece.white

         

        // The algoritm is going to generate moves from the friendly king square. If it finds a hostile piece that attacks it
        // it will add them to the kingAttackers array.
        
        // Generate knight moves from friendly king square. Check if any knight is attacking the king
        const KnightAttackers = AttackTables.knight[friendlyKingSquare]
        for (let startSquare of KnightAttackers){
            const piece = this.square[startSquare]
            if (piece == (Piece.knight | enemyColor) ){
                this.checkers.push(startSquare)
                this.blockingSquares.push(startSquare)
            }
        }

        // Do the same for attacking pawns
        const pawnAttackers = (this.white_To_Move) ? 
            AttackTables.whitePawn[friendlyKingSquare] : 
            AttackTables.blackPawn[friendlyKingSquare]

        for (let startSquare of pawnAttackers){
            const piece = this.square[startSquare]
            if (piece == (Piece.pawn | enemyColor) ){
                this.checkers.push(startSquare)
                this.blockingSquares.push(startSquare)
            }
        }

        // Generate sliding moves from the friendly king square. If it finds a friendly piece 
        // it is marked as a potenially pinned piece. If the next piece it finds is a valid sliding 
        // piece for the given direction, we confirm that the piece is pinned.

        // If the first piece we find is a valid attacker, we mark it as a checker. We store 
        // the squareIndexes along the path of the sliding piece as blocking squares. In order to resolve
        // the check we must move a non king piece to one of the blocker squares
        
        
        let data = ChessHelper.numSquaresToEdge[friendlyKingSquare]
        const blockingSquares = []
        let potentialPinnedPiece;
        
        //directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]
        //  0 -> 3: Rette trekk
        //  4 -> 7: Diagonale trekk

        for (let i = 0; i < 8; i++){
            // Double check means there are only king moves and no need to compute pins
            if (2 == this.checkers.length) return
            
            // Valid sliding piece type
            const otherSlidingPiece = (i < 4) ? Piece.rook : Piece.bishop
            
            const offset = Piece.directionOffsets[i]
            const pinType = Piece.pins[i]
            
            blockingSquares.length = 0
            potentialPinnedPiece = null

            for (let n = 0; n < data[i]; n++){
                // Move along path
                const target = friendlyKingSquare + offset * (n+1)
                const pieceOnTargetSquare = this.square[target]
                blockingSquares.push(target)
                
                // If the square is empty we continue
                if (pieceOnTargetSquare == 0){
                    continue
                }

               
                // Enemy checker
                else if (pieceOnTargetSquare == (Piece.queen | enemyColor) || 
                         pieceOnTargetSquare == (otherSlidingPiece | enemyColor)){
                        
                    // if there is no pinned piece our king is in danger
                    if (potentialPinnedPiece == null){
                        this.blockingSquares = [...blockingSquares]
                        this.checkers.push(target)
                    }
                    // Add pinmask if there is a potentially pinned piece
                    else {
                        this.pinMask[potentialPinnedPiece] = pinType
                    }
                    break
                }

                else {
                    // Other Enemy piece
                    if ((pieceOnTargetSquare & 0b11000) == enemyColor){
                        break
                    }
                    // Friendly piece
                    else {
                        if (potentialPinnedPiece != null){
                            break
                        }
                        potentialPinnedPiece = target
                    }
                } 
            }
        }
    }

    squareUnderAttack(squareIndex, whiteAttacks){
        // Checks if a squareIndex is under attack by the enemy
        const opponentColor = (whiteAttacks) ? Piece.white : Piece.black 
        
        // Check for potential attacking knights
        const knightAttacks = AttackTables.knight[squareIndex]
        for (let i = 0; i < knightAttacks.length; i++){
            // Find every possible knight attacker
            const attackIndex = knightAttacks[i]
            const piece = this.square[attackIndex]

            
            // check for knight
            if (piece == (Piece.knight | opponentColor)) return true
        }

        // check for potential attacking king
        const kingAttacks = AttackTables.king[squareIndex]
        for (let i = 0; i < kingAttacks.length; i++){
            const attackIndex = kingAttacks[i]
            const piece = this.square[attackIndex]

            if (piece == (Piece.king | opponentColor)) return true
        }

        // Check for potential attacking pawns
        const pawnAttacks = (whiteAttacks) ? 
            AttackTables.blackPawn[squareIndex] :
            AttackTables.whitePawn[squareIndex]  
        
        for (let i = 0; i < pawnAttacks.length; i++){
            const attackIndex = pawnAttacks[i]
            const piece = this.square[attackIndex]

            if (piece == (Piece.pawn | opponentColor)) return true
        }


        // generate attacking sliding moves
        for (let i = 0; i < 8; i++){

            const offset = Piece.directionOffsets[i]
            const numSquaresToEdge = ChessHelper.numSquaresToEdge[squareIndex][i]
            const slidingPiece = (i < 4) ? (Piece.rook | opponentColor) : (Piece.bishop | opponentColor)

            for (let n = 0; n < numSquaresToEdge; n++){
                
                const target = squareIndex + offset * (n+1)
                const pieceOnTargetSquare = this.square[target]

                //Om brikka er vennleg kan vi ikkje gå lenger, og gjeldande trekk er ulovleg
                if (pieceOnTargetSquare == 0){
                    continue
                }

                // Enemy piece is a potential attacker
                else if (
                    pieceOnTargetSquare == (Piece.queen | opponentColor) ||
                    pieceOnTargetSquare == slidingPiece
                    ){
                    return true
                }

                // If the squere is occupied by a friendly piece the square is safe
                else {
                    break
                }
            }
        
        }

        return false
        
    }

    InCheck(white){
        const index = (white) ? 0 : 1

        // find the friendly king square
        const KingSquare = ChessHelper.LocateKings(this)[index]
        
        // check if the king square is under attack
        return this.squareUnderAttack(KingSquare, ! white)
    }

    GenerateSlidingMoves(piece, start){
        let moves = []

        // Get the piece type and position data
        let pieceType = piece & 0b111
        let data = ChessHelper.numSquaresToEdge[start]

        
        //directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]

        // horizontal movement
        let startIndex = (pieceType == Piece.bishop) ? 4 : 0
        // diagonal movement
        let endIndex = (pieceType == Piece.rook) ? 4 : 8

        for (let i = startIndex; i < endIndex; i++){
            
            // Piece is pinned in this direction
            const PinType = this.pinMask[start]
            const PinTypeForThisDirection = Piece.pins[i]
           
            // Force the piece to move along the pin line
            if (! (PinType == 0 || PinType == PinTypeForThisDirection)) continue

            let offset = Piece.directionOffsets[i]
            
            for (let n = 0; n < data[i]; n++){
                const target = start + offset * (n+1)
                const pieceOnTargetSquare = this.square[target]

                //Om brikka er vennleg kan vi ikkje gå lenger, og gjeldande trekk er ulovleg
                if (Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)){
                    break
                }
                //Dersom brikka er fientleg er det eit angrep
                if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)){
                    const move = Move.EncodeUINT16(start, target, Move.flags.captures)
                    moves.push(move)    
                    break
                }
                //Legger til quiet move
                const move = Move.EncodeUINT16(start, target, Move.flags.quietMove)
                moves.push(move)
            }
        
        }

        return moves
    }

    GenerateKnightMoves(start){
        // if pinned it cant move
        const pin = this.pinMask[start]
        if (pin != 0) return []

        let targetSquares = AttackTables.knight[start]
        let moves = []

        targetSquares.forEach(targetSquare =>{
            const pieceOnTargetSquare = this.square[targetSquare]
            //Dersom ruta er tom er trekket eit quiet move
            if (pieceOnTargetSquare == 0){

                const move = Move.EncodeUINT16(start, targetSquare, Move.flags.quietMove)
                moves.push(move)
            }

            //Om brikka vi landar på er fientleg kan vi lagre som anrep
            else if (! Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)){
                const move = Move.EncodeUINT16(start, targetSquare, Move.flags.captures)
                moves.push(move)
                
            }
            //Om brikka vi landar på er vennleg er gjeldande trekk er ulovleg
            //Vi tren derfor ikkje å gjere noko

        })
        return moves

    }

    GeneratePawnMoves(start){
        let moves = []
        //finner retning avhengig av farge 
        const pawnIsWhite = this.white_To_Move

        // Parameters for black / white pawns
        const dir = (pawnIsWhite) ? 1 : -1
        const doublePush = (pawnIsWhite) ? (start < 16) : (47 < start)
        const promotion = (pawnIsWhite) ? (47 < start) : (start < 16)
        
        const pinType = this.pinMask[start]
        const canMoveForward = (pinType == Piece.pin_N_S || pinType == 0)
        

        for (let n = 1; n<3; n++){
            // Constrain the piece to the pin
            if (!canMoveForward) break
            
            // Double push at start index
            const target = start + 8 * n * dir
            if (this.square[target] != 0){
                break
            }
            const flag = (n == 2) ? Move.flags.doublePush : Move.flags.quietMove
            
            if (promotion){
                moves.push(Move.EncodeUINT16(start, target, Move.flags.bishopPromotion ))
                moves.push(Move.EncodeUINT16(start, target, Move.flags.knightPromotion ))
                moves.push(Move.EncodeUINT16(start, target, Move.flags.rookPromotion   ))
                moves.push(Move.EncodeUINT16(start, target, Move.flags.queenPromotion  ))
            }
            else {
                moves.push(Move.EncodeUINT16(start, target, flag))
            }

            if (! doublePush) break
        }
        
        // Generate Attacks
        const pawnAttacks = (pawnIsWhite) ? AttackTables.whitePawn[start] : AttackTables.blackPawn[start]
        
        // en passant target
        const epTarget = null
        if (this.enPassantSquare != null){
            const epTarget = this.enPassantSquare + 8 * dir
        }
        
        for (const target of pawnAttacks){
            // limit captures to diagonal pins
            const offset = Math.abs(target - start)
            if (pinType != 0){
                if (offset == 7 && pinType != Piece.pin_NW_SE) continue 
                if (offset == 9 && pinType != Piece.pin_NE_SW) continue
            }

            // En passant
            if (target == epTarget){
                const move = Move.EncodeUINT16(start, target, Move.flags.epCapture)
                moves.push(move)
            }
            
            // Check if there is an enemy piece on the capture square
            const targetPiece = this.square[target]
            if (Piece.CheckPieceColor(targetPiece, !this.white_To_Move)){
                if (promotion){
                    moves.push(Move.EncodeUINT16(start, target, Move.flags.bishopPromoCapture))
                    moves.push(Move.EncodeUINT16(start, target, Move.flags.knightPromoCapture))
                    moves.push(Move.EncodeUINT16(start, target, Move.flags.rookPromoCapture))
                    moves.push(Move.EncodeUINT16(start, target, Move.flags.queenPromoCapture))
                }
                else {
                    moves.push(Move.EncodeUINT16(start, target, Move.flags.captures))
                }
            }
        }

        return moves
    }

    GenerateKingMoves(start){
        let moves = []

        // remove king from the board
        const king = this.square[start]
        this.square[start] = 0

        const kingAttacks = AttackTables.king[start]
        for (let target of kingAttacks){
            // King shouldnt wander into danger
            if (this.squareUnderAttack(target, !this.white_To_Move)) continue

            const pieceOnTargetSquare = this.square[target]
            if (pieceOnTargetSquare == 0){
                moves.push(Move.EncodeUINT16(start, target, Move.flags.quietMove))
            }
            if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)){
                moves.push(Move.EncodeUINT16(start, target, Move.flags.captures))
            }
        }
        // Add king back
        this.square[start] = king
        
        // castle rights
        const castleRights = (this.white_To_Move) ? this.castlingRights >> 2 : this.castlingRights
        const myKingSquare = (this.white_To_Move) ? 4 : 60

        // castle kingside
        if ((castleRights & 0b10) == 0b10){
           
            let legal = ! this.squareUnderAttack(myKingSquare, !this.white_To_Move)
            for (let i = 1; i < 3; i++){
                // If the move is illegal we dont need to investigate further
                if (! legal){
                    break
                }
                const squareToCheck = myKingSquare + i
                //Er ruta tom
                if (this.square[squareToCheck] != 0){
                    legal = false 
                }
                //Er ruta under angrep
                else if ((i < 3) && this.squareUnderAttack(squareToCheck, !this.white_To_Move)){
                    legal = false 
                }
            }

            if (legal) moves.push(Move.EncodeUINT16(myKingSquare, myKingSquare + 2, Move.flags.kingCastle))

        }
        //castle queenside
        if ((castleRights & 0b01) == 0b01){
          
            let legal = ! this.squareUnderAttack(myKingSquare, !this.white_To_Move)

            for (let i = 1; i < 4 ; i++){
                const squareToCheck = myKingSquare - i
                if (! legal){
                    break
                }
                //Er ruta tom
                if (this.square[squareToCheck] != 0){
                    legal = false 
                }
                //Er ruta under angrep
                else if ((i < 3) && this.squareUnderAttack(squareToCheck, !this.white_To_Move)){
                    legal = false 
                }
            }
            if (legal) moves.push(Move.EncodeUINT16(myKingSquare, myKingSquare - 2, Move.flags.queenCastle))

        }
        
        return moves
    }

    GenerateLegalMoves(){
        // returns a list of the legal moves for the given position
        let moves = []

        // Calculate pins, checkers and blocking squares
        this.computeKingSafety()

        // In a double check scenario you can only move the king
        if (1 < this.checkers.length){
            const kings = ChessHelper.LocateKings(this)
            const KingSquare = (this.white_To_Move) ? kings[0] : kings[1]
            return this.GenerateKingMoves(KingSquare)
        }

        // Generate normal moves
        for (let squareIndex = 0; squareIndex < 64; squareIndex++){
            const piece = this.square[squareIndex]
            if (piece == 0) continue
            if (Piece.CheckPieceColor(piece, !this.white_To_Move)) continue
            
            // King Moves
            if (Piece.IsType(piece, Piece.king)){
                moves.push(...this.GenerateKingMoves(squareIndex))
            }

            // Pawn Moves
            if (Piece.IsType(piece, Piece.pawn)){
                moves.push(...this.GeneratePawnMoves(squareIndex))
            }

            // Knight Moves
            if (Piece.IsType(piece, Piece.knight)){
                moves.push(...this.GenerateKnightMoves(squareIndex))
            }

            // Sliding
            if (Piece.IsSlidingPiece(piece)){
                moves.push(...this.GenerateSlidingMoves(piece, squareIndex))
            }

        }

        // Make sure that moves resolve any exisitng checks
        if (this.checkers.length == 1){
            moves = moves.filter(move => {
                const start = Move.Start(move)
                const target = Move.Target(move)
                const piece = this.square[start]

                if (Piece.IsType(piece, Piece.king)) return true
                if (Move.Flag(move) == Move.flags.epCapture) return true
                
                return (this.blockingSquares.includes(target))
            });
        }

        // If there is no en passant move everything should be good
        if (this.enPassantSquare == null) return moves

        // Filter ep moves
        const filteredMoves = []
        const colorToCheck = this.white_To_Move
        for (let move of moves){
            if (true && Move.Flag(move) == Move.flags.epCapture){
                // Filter: Make -> detect check -> Unmake move
                
                // if not in check the move is legal
                this.Make_Move(move)
                if (! this.InCheck(colorToCheck)){
                    filteredMoves.push(move)
                }
                this.Unmake_Move(move)
            }
            else {
                filteredMoves.push(move)
            }
        }
        
        return filteredMoves
    } 

    GenerateTacticalMoves(){
        // generates tactical moves like promotions or captures
        let captureMoves = []
        const legalMoves = this.GenerateLegalMoves()
        legalMoves.forEach(move =>{
            if (Move.IsCapture(move) || Move.IsPromotion(move)) captureMoves.push(move)
        })
        
        return captureMoves
    }
}
