import { ChessHelper } from "../Utils/Chess_Helper.js"
import { AttackTables } from "./AttackTables.js"
import { AttackDetector } from "./Attack.js"
import { Piece } from "../Board/piece.js"
import { Move } from "../Board/move.js"
import { maxSearchDepth } from "../Constants/SearchConstants.js"
AttackTables.init()

const maxNumLegalMoves = 218

export class MoveGenerator {
    constructor(){
        // Important data for generating legal moves
        this.pinMask = new Array(64).fill(0)
        this.blockingSquares = new Array(64).fill(false)
        this.checkers = []
        
        this.maxNumLegalMoves = 218
        
        // Move Array
        this.moves = new Uint16Array(this.maxNumLegalMoves * 256)
        this.scores = new Array(this.maxNumLegalMoves * 256)
        this.count = 0
        this.ply = 0
    }

    GetMoveIndex(index, ply){
        return ply * this.maxNumLegalMoves + index
    }

    GetMove(index, ply){
        return this.moves[this.GetMoveIndex(index, ply)]
    }

    Add(start, target, flag, kingMove=false){
        const inCheck = (0 < this.checkers.length)
        const epCapture = (flag == Move.flags.epCapture)
        const blockCheck = this.blockingSquares[target]

        // en passant and king moves have done a strict checks earlier
        if (epCapture || kingMove){
            // all good
        }

        // When in check any move must the check 
        else if (inCheck && !blockCheck){
            return
        }

        const move = Move.EncodeUINT16(start, target, flag)
        this.moves[this.ply * this.maxNumLegalMoves + this.count] = move
        this.count++
    }

    ComputeKingSafety(board){
            
            /**
             *  This is a complex function to; locate kings, detect pinned pieces, 
             *  find checks and doublecheks, as well as keep track of ways to resolve checks 
             * 
             * - If the kingAttackers array is empty, you can make any legal move accounting for pins
             * 
             * - If the kingAttackers array has one element, you must move to one of the blockingsquares.
             *   The blockingsquares array describes the path from the kingAttacker to the friendly king. 
             *   If your moves target square is in the blocker array it will resolve or block the check.
             *   
             *  - If the kingAttackers array has two elements, then there is a double check. 
             *    In this case we only care about the king moves.
             * 
             */
    
            // Clear arrays
            this.pinMask.fill(0)
            this.checkers.length = 0
            this.blockingSquares = new Array(64).fill(false)
            
            // the squares you can move to in order to resolve a check (either by blocking path or capturing the attacker)
            // This will be countered by a double check in wich we only generate king moves
    

            const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
            const enemyColor = (board.white_To_Move) ? Piece.black : Piece.white
    
             
    
            // The algoritm is going to generate moves from the friendly king square. If it finds a hostile piece that attacks it
            // it will add them to the kingAttackers array.
            
            // Generate knight moves from friendly king square. Check if any knight is attacking the king
            const KnightAttackers = AttackTables.knight[friendlyKingSquare]
            for (let startSquare of KnightAttackers){
                const piece = board.square[startSquare]
                if (piece == (Piece.knight | enemyColor) ){
                    this.checkers.push(startSquare)
                    this.blockingSquares[startSquare] = true
                }
            }
    
            // Do the same for attacking pawns
            const pawnAttackers = (board.white_To_Move) ? 
                AttackTables.whitePawn[friendlyKingSquare] : 
                AttackTables.blackPawn[friendlyKingSquare]
    
            for (let startSquare of pawnAttackers){
                const piece = board.square[startSquare]
                if (piece == (Piece.pawn | enemyColor) ){
                    this.checkers.push(startSquare)
                    this.blockingSquares[startSquare] = true
                }
            }
    
            // Generate sliding moves from the friendly king square. If it finds a friendly piece 
            // it is marked as a potenially pinned piece. If the next piece it finds is a valid sliding 
            // piece for the given direction, we confirm that the piece is pinned.
    
            // If the first piece we find is a valid attacker, we mark it as a checker. We store 
            // the squareIndexes along the path of the sliding piece as blocking squares. In order to resolve
            // the check we must move a non king piece to one of the blocker squares
            
            
            let data = ChessHelper.numSquaresToEdge[friendlyKingSquare]
            const potentialBlockingSquares = []
            let potentialPinnedPiece;
            
            // Check if a sliding attack is possible
            const numBishops = board.pl.Count(Piece.bishop | enemyColor)
            const numRooks   = board.pl.Count(Piece.rook   | enemyColor)
            const numQueens  = board.pl.Count(Piece.queen  | enemyColor)

            const needsHorizontalCheck = 0 < (numRooks + numQueens)
            const needsDiagonalCheck   = 0 < (numBishops + numQueens)
            
            const startIndex = needsHorizontalCheck ? 0 : 4
            const endIndex = needsDiagonalCheck ? 8 : 4
            
            for (let i = startIndex; i < endIndex; i++){
                // Double check means there are only king moves and no need to compute pins
                if (2 == this.checkers.length) return
                
                const offset = Piece.directionOffsets[i]
                const pinType = Piece.pins[i]

                // Valid sliding piece type
                const minorSlidingPiece = (i < 4) ? Piece.rook : Piece.bishop
                
                
                potentialBlockingSquares.length = 0
                potentialPinnedPiece = null
    
                for (let n = 0; n < data[i]; n++){
                    // Move along path
                    const target = friendlyKingSquare + offset * (n+1)
                    potentialBlockingSquares.push(target)

                    const pieceOnTargetSquare = board.square[target]
                    
                    // If the square is empty we continue
                    if (pieceOnTargetSquare == 0){
                        continue
                    }
    
                    // Enemy checker
                    else if (pieceOnTargetSquare == (Piece.queen | enemyColor) || 
                             pieceOnTargetSquare == (minorSlidingPiece | enemyColor)){
                            
                        // if there is no pinned piece our king is in danger
                        if (potentialPinnedPiece == null){
                            
                            for (const square of potentialBlockingSquares){
                                this.blockingSquares[square] = true
                            }

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

    GenerateMoves(board, ply=0){
        // Reset array pointer
        this.count = 0
        this.ply = ply

        this.ComputeKingSafety(board)
        
        // Generate king moves
        const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        this.GenerateKingMoves(board, friendlyKingSquare)

        // If there is a double check, we only consider kingmoves
        if (1 < this.checkers.length) return 

        // Generate all other moves
        const friendlyColor = (board.white_To_Move) ? Piece.white : Piece.black

        // Pawn moves
        for (const pawnSquare of board.pl.listFromPiece[Piece.pawn | friendlyColor]){
            this.GeneratePawnMoves(board, pawnSquare)
        }

        // Knight moves
        for (const knightSquare of board.pl.listFromPiece[Piece.knight | friendlyColor]){
            this.GenerateKnightMoves(board, knightSquare)
        }

        // Bishop moves
        for (const bishopSquare of board.pl.listFromPiece[Piece.bishop | friendlyColor]){
            this.GenerateSlidingMoves(board, bishopSquare, false, true)
        }

        // Rook moves
        for (const rookSquare of board.pl.listFromPiece[Piece.rook | friendlyColor]){
            this.GenerateSlidingMoves(board, rookSquare, true, false)
        }

        // Queen moves
        for (const queenSquare of board.pl.listFromPiece[Piece.queen | friendlyColor]){
            this.GenerateSlidingMoves(board, queenSquare, true, true)
        }

    }

    TacticalMoves(board, ply=0){
        
        this.GenerateMoves(board, ply)

        const start = this.GetMoveIndex(0, ply)
        const end = this.GetMoveIndex(this.count, ply)
        let count = 0

        for (let i = start; i < end; i++){
            const move = this.moves[i]

            const capture = Move.IsCapture(move)
            const promotion = Move.IsPromotion(move)

            if (capture || promotion){
                this.moves[start + count] = move
                count++
            }
        }

        this.count = count
    }

    GeneratePawnMoves(board, start){
        // Use piececloro to find direction offsets 
        const pawnIsWhite = board.white_To_Move

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
            if (board.square[target] != 0) break

            const flag = (n == 2) ? Move.flags.doublePush : Move.flags.quietMove
            
            if (promotion){
                this.Add(start, target, Move.flags.bishopPromotion)
                this.Add(start, target, Move.flags.knightPromotion)
                this.Add(start, target, Move.flags.rookPromotion  )
                this.Add(start, target, Move.flags.queenPromotion )
            }
            else {
                this.Add(start, target, flag)
            }

            if (! doublePush) break
        }
        
        // Generate Attacks
        const pawnAttacks = (pawnIsWhite) ? AttackTables.whitePawn[start] : AttackTables.blackPawn[start]
        
        // En passant target
        let epTarget = null
        if (board.enPassantSquare != null){
            epTarget = board.enPassantSquare + 8 * dir
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
                // Check if the ep capture is legal due to horizontal pins
                const move = Move.EncodeUINT16(start, target, Move.flags.epCapture)
                const illegal = AttackDetector.IsMoveIllegal(board, move)
                
                if (!illegal) this.Add(start, target, Move.flags.epCapture)
            }
            
            
            // Check if there is an enemy piece on the capture square
            const targetPiece = board.square[target]
            if (Piece.CheckPieceColor(targetPiece, !board.white_To_Move)){
                if (promotion){
                    this.Add(start, target, Move.flags.bishopPromoCapture)
                    this.Add(start, target, Move.flags.knightPromoCapture)
                    this.Add(start, target, Move.flags.rookPromoCapture)
                    this.Add(start, target, Move.flags.queenPromoCapture)
                }
                else {
                    this.Add(start, target, Move.flags.captures)
                }
            }
        }
    }

    GenerateKnightMoves(board, start){
        // if pinned it cant move
        const pin = this.pinMask[start]
        if (pin != 0) return []

        let targetSquares = AttackTables.knight[start]

        for(const targetSquare of targetSquares){
            const pieceOnTargetSquare = board.square[targetSquare]

            // Empty square is a quiet move
            if (pieceOnTargetSquare == 0){
                this.Add(start, targetSquare, Move.flags.quietMove)
            }

            // Opponent piece is a capture
            else if (Piece.CheckPieceColor(pieceOnTargetSquare, !board.white_To_Move)){
                this.Add(start, targetSquare, Move.flags.captures)
                
            }
        }
    }

    GenerateKingMoves(board, start){
        const kingAttacks = AttackTables.king[start]
        for (let target of kingAttacks){
            // King shouldnt wander into danger
            if (AttackDetector.SquareUnderAttack(board, target, !board.white_To_Move, true)) continue

            const pieceOnTargetSquare = board.square[target]
            // quietmove
            if (pieceOnTargetSquare == 0){
                this.Add(start, target, Move.flags.quietMove, true)
            }
            // capture
            else if (Piece.CheckPieceColor(pieceOnTargetSquare, !board.white_To_Move)){
                this.Add(start, target, Move.flags.captures, true)
            }
        }
        
        // castle rights
        const castleRights = (board.white_To_Move) ? board.castlingRights >> 2 : board.castlingRights
        const myKingSquare = (board.white_To_Move) ? 4 : 60

        // castle kingside
        if ((castleRights & 0b10) == 0b10){
           
            let legal = ! AttackDetector.SquareUnderAttack(board, myKingSquare, !board.white_To_Move)
            for (let i = 1; i < 3; i++){
                // If the move is illegal we dont need to investigate further
                if (! legal){
                    break
                }

                const squareToCheck = myKingSquare + i
                // Check if the square is empty
                if (board.square[squareToCheck] != 0){
                    legal = false 
                }
                // Check if the square is under attack
                else if ((i < 3) && AttackDetector.SquareUnderAttack(board, squareToCheck, !board.white_To_Move)){
                    legal = false 
                }
            }

            if (legal) this.Add(myKingSquare, myKingSquare + 2, Move.flags.kingCastle)

        }
        //castle queenside
        if ((castleRights & 0b01) == 0b01){
          
            let legal = ! AttackDetector.SquareUnderAttack(board, myKingSquare, !board.white_To_Move)

            for (let i = 1; i < 4 ; i++){
                const squareToCheck = myKingSquare - i
                if (! legal){
                    break
                }
                // Check if square is empty
                if (board.square[squareToCheck] != 0){
                    legal = false 
                }
                // Check if square is under attack
                else if ((i < 3) && AttackDetector.SquareUnderAttack(board, squareToCheck, !board.white_To_Move)){
                    legal = false 
                }
            }

            if (legal) this.Add(myKingSquare, myKingSquare - 2, Move.flags.queenCastle)
        }
    }

    GenerateSlidingMoves(board, start, horizontal, diagonal){
        // Get the piece type and position data
        let data = ChessHelper.numSquaresToEdge[start]

        // horizontal movement 0-4
        let startIndex = (horizontal) ? 0 : 4

        // diagonal movement 4-8
        let endIndex = (diagonal) ? 8 : 4

        for (let i = startIndex; i < endIndex; i++){
            
            // Piece is pinned in this direction
            const PinType = this.pinMask[start]
            const PinTypeForThisDirection = Piece.pins[i]
           
            // Force the piece to move along the pin line
            if (! (PinType == 0 || PinType == PinTypeForThisDirection)) continue

            let offset = Piece.directionOffsets[i]
            
            for (let n = 0; n < data[i]; n++){
                const target = start + offset * (n+1)
                const pieceOnTargetSquare = board.square[target]

                // Friendly piece stops scan
                if (Piece.CheckPieceColor(pieceOnTargetSquare, board.white_To_Move)){
                    break
                }
                // Adds capture move
                if (Piece.CheckPieceColor(pieceOnTargetSquare, !board.white_To_Move)){
                    this.Add(start, target, Move.flags.captures)
                    break
                }
                // Adds quiet move
                this.Add(start, target, Move.flags.quietMove)
            }
        
        }
    }
}