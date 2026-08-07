import { Piece } from "../Board/piece.js"
import { AttackTables } from "./AttackTables.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"

// AttackTables.init()

export class AttackDetector {
    static SquareUnderAttack(board, squareIndex, byWhite, ignoreKing = false){
        // Checks if a squareIndex is under attack by the enemy
        const attackerColor = (byWhite) ? Piece.white : Piece.black 
        const friendlyColor = (byWhite) ? Piece.black : Piece.white 
        
        // Check for potential attacking knights
        const knightAttacks = AttackTables.knight[squareIndex]
        for (let i = 0; i < knightAttacks.length; i++){
            // Find every possible knight attacker
            const attackIndex = knightAttacks[i]
            const piece = board.square[attackIndex]

            // check for knight
            if (piece == (Piece.knight | attackerColor)) return true
        }

        // check for potential attacking king
        const kingAttacks = AttackTables.king[squareIndex]
        for (let i = 0; i < kingAttacks.length; i++){
            const attackIndex = kingAttacks[i]
            const piece = board.square[attackIndex]
            
            // Check for king
            if (piece == (Piece.king | attackerColor)) return true
        }

        // Check for potential attacking pawns
        const pawnAttacks = (byWhite) ? 
            AttackTables.blackPawn[squareIndex] : // Pawn moves might look backwards because a pawn 
            AttackTables.whitePawn[squareIndex]   // attacking a pawn will always be mirrored
        
        for (let i = 0; i < pawnAttacks.length; i++){
            const attackIndex = pawnAttacks[i]
            const piece = board.square[attackIndex]
            
            // check for pawn
            if (piece == (Piece.pawn | attackerColor)) return true
        }
        
        // generate attacking sliding moves
        for (let i = 0; i < 8; i++){
            const offset = Piece.directionOffsets[i]
            const numSquaresToEdge = ChessHelper.numSquaresToEdge[squareIndex][i]
            const slidingPiece = (i < 4) ? (Piece.rook | attackerColor) : (Piece.bishop | attackerColor)

            for (let n = 0; n < numSquaresToEdge; n++){
                
                const target = squareIndex + offset * (n+1)
                const pieceOnTargetSquare = board.square[target]

                // Continue if square is empty
                if (pieceOnTargetSquare == 0){
                    continue
                }
                
                // Check for an enemy piece that can move in the given direction
                else if (
                    pieceOnTargetSquare == (Piece.queen | attackerColor) ||
                    pieceOnTargetSquare == slidingPiece
                    ){
                    return true
                }
                
                // Ignore friendly king for king move detection
                else if (pieceOnTargetSquare == (Piece.king | friendlyColor) && ignoreKing){
                    continue
                } 

                // Friendly piece means this direction is safe
                else {
                    break
                }
            }
        }
        // Square is safe if all conditions are met
        return false   
    }

    static InCheck(board, white){
        // Locate the kingsquare for the defending king
        const defendingKingSquare = white ? board.whiteKingSquare : board.blackKingSquare

        // returns true if the player in the parameter is in check 
        return (this.SquareUnderAttack(board, defendingKingSquare, !white))
    }

    static IsMoveIllegal(board, move){
        // A computationally inefficient but guaranteed method to filter illegal moves.
        const attackerIsWhite = board.white_To_Move 
        board.Make_Move(move)
        
        // if the players king is in check after making a move, the move was illegal  
        const check = this.InCheck(board, attackerIsWhite)
        
        // Unmake move
        board.Unmake_Move(move)
        
        return check
    }

    static Mobility(board, start, orthogonal, diagonal){
        let numReachableSquares = 0

        // Get map data
        let data = ChessHelper.numSquaresToEdge[start]

        let startIndex = (orthogonal) ? 0 : 4 // diagonal movement
        let endIndex = (diagonal) ? 8 : 4 // horizontal movement

        // Iterate in every direction for all directions
        for (let i = startIndex; i < endIndex; i++){
            const offset = Piece.directionOffsets[i]
            const numSquaresThisDirection = data[i]

            for (let n = 0; n < numSquaresThisDirection; n++){
                const target = start + offset * (n+1)

                // If the square is occupied we start searching the next direction
                if(board.square[target] != 0) break
                numReachableSquares ++
            }
        }

        return numReachableSquares
    }
}