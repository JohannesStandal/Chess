import { ChessHelper } from "../Utils/Chess_Helper.js"
import { AttackTables } from "../Constants/AttackTables.js"
import { Piece } from "./piece.js"
import { Move } from "./move.js"

AttackTables.init()

const maxNumLegalMoves = 218

export class MoveGenerator {
    constructor(board){
        this.board = board

        // Important data for generating legal moves
        this.pinMask = new Array(64).fill(0)
        this.blockingSquares = []
        this.checkers = []
        
        // Move Array
        this.moves = new Uint16Array(maxNumLegalMoves)
        this.count = 0

        
        this.uncertain = true
    }

    Add(move){
        this.moves[this.count] = move
        this.count++
    }

    ComputeKingSafety(){
            
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
            let kings = ChessHelper.LocateKings(this.board)
            const friendlyKingSquare = (this.board.white_To_Move) ? kings[0] : kings[1]
            
            const enemyColor = (this.board.white_To_Move) ? Piece.black : Piece.white
    
             
    
            // The algoritm is going to generate moves from the friendly king square. If it finds a hostile piece that attacks it
            // it will add them to the kingAttackers array.
            
            // Generate knight moves from friendly king square. Check if any knight is attacking the king
            const KnightAttackers = AttackTables.knight[friendlyKingSquare]
            for (let startSquare of KnightAttackers){
                const piece = this.board.square[startSquare]
                if (piece == (Piece.knight | enemyColor) ){
                    this.checkers.push(startSquare)
                    this.blockingSquares.push(startSquare)
                }
            }
    
            // Do the same for attacking pawns
            const pawnAttackers = (this.board.white_To_Move) ? 
                AttackTables.whitePawn[friendlyKingSquare] : 
                AttackTables.blackPawn[friendlyKingSquare]
    
            for (let startSquare of pawnAttackers){
                const piece = this.board.square[startSquare]
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
                    const pieceOnTargetSquare = this.board.square[target]
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
    
    SquareUnderAttack(squareIndex, whiteAttacks){
        // Checks if a squareIndex is under attack by the enemy
        const opponentColor = (whiteAttacks) ? Piece.white : Piece.black 
        
        // Check for potential attacking knights
        const knightAttacks = AttackTables.knight[squareIndex]
        for (let i = 0; i < knightAttacks.length; i++){
            // Find every possible knight attacker
            const attackIndex = knightAttacks[i]
            const piece = this.board.square[attackIndex]

            
            // check for knight
            if (piece == (Piece.knight | opponentColor)) return true
        }

        // check for potential attacking king
        const kingAttacks = AttackTables.king[squareIndex]
        for (let i = 0; i < kingAttacks.length; i++){
            const attackIndex = kingAttacks[i]
            const piece = this.board.square[attackIndex]

            if (piece == (Piece.king | opponentColor)) return true
        }

        // Check for potential attacking pawns
        const pawnAttacks = (whiteAttacks) ? 
            AttackTables.blackPawn[squareIndex] :
            AttackTables.whitePawn[squareIndex]  
        
        for (let i = 0; i < pawnAttacks.length; i++){
            const attackIndex = pawnAttacks[i]
            const piece = this.board.square[attackIndex]

            if (piece == (Piece.pawn | opponentColor)) return true
        }


        // generate attacking sliding moves
        for (let i = 0; i < 8; i++){

            const offset = Piece.directionOffsets[i]
            const numSquaresToEdge = ChessHelper.numSquaresToEdge[squareIndex][i]
            const slidingPiece = (i < 4) ? (Piece.rook | opponentColor) : (Piece.bishop | opponentColor)

            for (let n = 0; n < numSquaresToEdge; n++){
                
                const target = squareIndex + offset * (n+1)
                const pieceOnTargetSquare = this.board.square[target]

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

    GenerateMoves(){
        // Reset array pointer
        this.count = 0
        this.uncertain = false

        const kings = ChessHelper.LocateKings(this.board)
        let friendlyKingSquare = this.board.white_To_Move ? kings[0] : kings[1]

        // If there is a double check, we only consider kingmoves
        this.GenerateKingMoves(friendlyKingSquare)
        if (1 < this.checkers.length) return this.moves.slice(0, this.count)

        // GenerateOtherMoves
        for (let startSquare = 0; startSquare < 64; startSquare++){
            const pieceOnTargetSquare = this.board.square[startSquare]
            
            // Skip empty and enemy squares
            if (Piece.CheckPieceColor(pieceOnTargetSquare, this.board.white_To_Move) ||
                pieceOnTargetSquare == 0){
                continue
            }

            // pawns
            if (Piece.IsType(pieceOnTargetSquare, Piece.pawn)){
                this.GeneratePawnMoves(startSquare)
            }

            // knights
            if (Piece.IsType(pieceOnTargetSquare, Piece.knight)){
                this.GenerateKnightMoves(startSquare)   
            }

            // slidingPiece
            if (Piece.IsSlidingPiece(pieceOnTargetSquare)){
                this.GenerateSlidingMoves(startSquare)
            }
        }

        return this.moves.slice(0, this.count)
    }

    GeneratePawnMoves(start){
        // Use piececloro to find direction offsets 
        const pawnIsWhite = this.board.white_To_Move

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
            if (this.board.square[target] != 0){
                break
            }
            const flag = (n == 2) ? Move.flags.doublePush : Move.flags.quietMove
            
            if (promotion){
                this.Add(Move.EncodeUINT16(start, target, Move.flags.bishopPromotion ))
                this.Add(Move.EncodeUINT16(start, target, Move.flags.knightPromotion ))
                this.Add(Move.EncodeUINT16(start, target, Move.flags.rookPromotion   ))
                this.Add(Move.EncodeUINT16(start, target, Move.flags.queenPromotion  ))
            }
            else {
                this.Add(Move.EncodeUINT16(start, target, flag))
            }

            if (! doublePush) break
        }
        
        // Generate Attacks
        const pawnAttacks = (pawnIsWhite) ? AttackTables.whitePawn[start] : AttackTables.blackPawn[start]
        
        // en passant target
        let epTarget = null
        //console.log(this.enPassantSquare)
        if (this.enPassantSquare != null){
            epTarget = this.enPassantSquare + 8 * dir
        }
        //console.log(epTarget)
        for (const target of pawnAttacks){
            // limit captures to diagonal pins
            const offset = Math.abs(target - start)
            if (pinType != 0){
                if (offset == 7 && pinType != Piece.pin_NW_SE) continue 
                if (offset == 9 && pinType != Piece.pin_NE_SW) continue
            }

            // En passant
            if (target == epTarget){
                this.Add(Move.EncodeUINT16(start, target, Move.flags.epCapture))
            }
            
            // Check if there is an enemy piece on the capture square
            const targetPiece = this.square[target]
            if (Piece.CheckPieceColor(targetPiece, !this.white_To_Move)){
                if (promotion){
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.bishopPromoCapture))
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.knightPromoCapture))
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.rookPromoCapture))
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.queenPromoCapture))
                }
                else {
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.captures))
                }
            }
        }
    }

    GenerateKnightMoves(start){
        // if pinned it cant move
        const pin = this.pinMask[start]
        if (pin != 0) return []

        let targetSquares = AttackTables.knight[start]

        targetSquares.forEach(targetSquare =>{
            const pieceOnTargetSquare = this.square[targetSquare]
            //Dersom ruta er tom er trekket eit quiet move
            if (pieceOnTargetSquare == 0){

                const move = Move.EncodeUINT16(start, targetSquare, Move.flags.quietMove)
                this.Add(move)
            }

            //Om brikka vi landar på er fientleg kan vi lagre som anrep
            else if (! Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)){
                const move = Move.EncodeUINT16(start, targetSquare, Move.flags.captures)
                this.Add(move)
                
            }
            //Om brikka vi landar på er vennleg er gjeldande trekk er ulovleg
            //Vi tren derfor ikkje å gjere noko
        })
    }

    GenerateKingMoves(start){
        // remove king from the board
        const king = this.board.square[start]
        this.board.square[start] = 0

        const kingAttacks = AttackTables.king[start]
        for (let target of kingAttacks){
            // King shouldnt wander into danger
            if (this.SquareUnderAttack(target, !this.white_To_Move)) continue

            const pieceOnTargetSquare = this.square[target]
            if (pieceOnTargetSquare == 0){
                this.Add(Move.EncodeUINT16(start, target, Move.flags.quietMove))
            }
            if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)){
                this.Add(Move.EncodeUINT16(start, target, Move.flags.captures))
            }
        }
        // Add king back
        this.square[start] = king
        
        // castle rights
        const castleRights = (this.white_To_Move) ? this.castlingRights >> 2 : this.castlingRights
        const myKingSquare = (this.white_To_Move) ? 4 : 60

        // castle kingside
        if ((castleRights & 0b10) == 0b10){
           
            let legal = ! this.SquareUnderAttack(myKingSquare, !this.board.white_To_Move)
            for (let i = 1; i < 3; i++){
                // If the move is illegal we dont need to investigate further
                if (! legal){
                    break
                }

                const squareToCheck = myKingSquare + i
                // Check if the square is empty
                if (this.board.square[squareToCheck] != 0){
                    legal = false 
                }
                // Check if the square is under attack
                else if ((i < 3) && this.SquareUnderAttack(squareToCheck, !this.board.white_To_Move)){
                    legal = false 
                }
            }

            if (legal) this.Add(Move.EncodeUINT16(myKingSquare, myKingSquare + 2, Move.flags.kingCastle))

        }
        //castle queenside
        if ((castleRights & 0b01) == 0b01){
          
            let legal = ! this.SquareUnderAttack(myKingSquare, !this.board.white_To_Move)

            for (let i = 1; i < 4 ; i++){
                const squareToCheck = myKingSquare - i
                if (! legal){
                    break
                }
                // Check if square is empty
                if (this.board.square[squareToCheck] != 0){
                    legal = false 
                }
                // Check if square is under attack
                else if ((i < 3) && this.SquareUnderAttack(squareToCheck, !this.board.white_To_Move)){
                    legal = false 
                }
            }

            if (legal) this.Add(Move.EncodeUINT16(myKingSquare, myKingSquare - 2, Move.flags.queenCastle))
        }
    }

    GenerateSlidingMoves(piece, start){
        // Get the piece type and position data
        let pieceType = piece & 0b111
        let data = ChessHelper.numSquaresToEdge[start]

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
                const pieceOnTargetSquare = this.board.square[target]

                // Friendly piece stops scan
                if (Piece.CheckPieceColor(pieceOnTargetSquare, this.board.white_To_Move)){
                    break
                }
                // Adds capture move
                if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.board.white_To_Move)){
                    this.Add(Move.EncodeUINT16(start, target, Move.flags.captures))
                    break
                }
                // Adds quiet move
                this.Add(Move.EncodeUINT16(start, target, Move.flags.quietMove))
            }
        
        }
    }
}