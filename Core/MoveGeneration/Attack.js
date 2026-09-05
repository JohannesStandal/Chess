import { Piece } from "../Board/piece.js"
import { AttackTables } from "./AttackTables.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"

// AttackTables.init()

export class AttackDetector {
    static SquareUnderAttack(board, squareIndex, byWhite, ignoreKing = false){
        // Checks if a squareIndex is under attack by the enemy
        const attackerColor = (byWhite) ? Piece.white : Piece.black 
        const friendlyColor = (byWhite) ? Piece.black : Piece.white 

        // check for potential attacking king
        const kingAttacks = AttackTables.king[squareIndex]
        for (let i = 0; i < kingAttacks.length; i++){
            const attackIndex = kingAttacks[i]
            const piece = board.square[attackIndex]
            
            // Check for king
            if (piece == (Piece.king | attackerColor)) return true
        }

        // Check for potential attacking knights
        const numKnights = board.pl.Count(Piece.knight | attackerColor)
        if (0 < numKnights){
            const knightAttacks = AttackTables.knight[squareIndex]
            for (let i = 0; i < knightAttacks.length; i++){
                // Find every possible knight attacker
                const attackIndex = knightAttacks[i]
                const piece = board.square[attackIndex]
    
                // check for knight
                if (piece == (Piece.knight | attackerColor)) return true
            }
        }

        // Check for potential attacking pawns
        const numPawns = board.pl.Count(Piece.pawn | attackerColor)
        if (0 < numPawns){
            const pawnAttacks = (byWhite) ? 
                AttackTables.blackPawn[squareIndex] : // Pawn moves might look backwards because a pawn 
                AttackTables.whitePawn[squareIndex]   // attacking a pawn will always be mirrored
            
            for (let i = 0; i < pawnAttacks.length; i++){
                const attackIndex = pawnAttacks[i]
                const piece = board.square[attackIndex]
                
                // check for pawn
                if (piece == (Piece.pawn | attackerColor)) return true
            }
        }

        // Sliding pieces
        const bishops = board.pl.listFromPiece[ Piece.bishop | attackerColor ]
        const rooks   = board.pl.listFromPiece[ Piece.rook   | attackerColor ]
        const queens  = board.pl.listFromPiece[ Piece.queen  | attackerColor ]
        
        const attackedSquareRank = ChessHelper.RankIndex(squareIndex)
        const attackedSquareFile = ChessHelper.FileIndex(squareIndex) 
        
        // Bishop
        for (const bishopSquare of bishops){
            const bishopRank = ChessHelper.RankIndex(bishopSquare)
            const bishopFile = ChessHelper.FileIndex(bishopSquare)

            const rankDst = bishopRank - attackedSquareRank
            const fileDst = bishopFile - attackedSquareFile

            // Bishop is not on the same diagonal as the attacked square
            if (Math.abs(rankDst) != Math.abs(fileDst)) continue

            let offsetIndex;

            // directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]

            // Up
            if (0 < rankDst){
                // right (+9) or left (+7)
                offsetIndex = (0 < fileDst) ? 4 : 6 
            }

            // Down
            else {
                // right (-7) or left (-9)
                offsetIndex = (0 < fileDst) ? 7 : 5 
            }

            const foundPiece = this.ScanForPiece(board, squareIndex, offsetIndex, Piece.bishop | attackerColor, ignoreKing)
            if (foundPiece) return true
        }

        // Rook
        for (const rookSquare of rooks){
            const rookRank = ChessHelper.RankIndex(rookSquare)
            const rookFile = ChessHelper.FileIndex(rookSquare)

            const horizontal = (rookRank == attackedSquareRank)
            const vertical   = (rookFile == attackedSquareFile)

            // Rook is not in line with the attacked square
            if (!horizontal && !vertical) continue

            let offsetIndex;
            
            // File distance
            if (horizontal){
                offsetIndex = (attackedSquareFile < rookFile) ? 1 : 0 
            }
            // Rank distance
            else if (vertical){
                offsetIndex = (attackedSquareRank < rookRank) ? 2 : 3
            }

            const foundPiece = this.ScanForPiece(board, squareIndex, offsetIndex, Piece.rook | attackerColor, ignoreKing)
            if (foundPiece) return true
        }
        
        // Queen
        for (const queenSquare of queens){
            const queenRank = ChessHelper.RankIndex(queenSquare)
            const queenFile = ChessHelper.FileIndex(queenSquare)

            const horizontal = (queenRank == attackedSquareRank)
            const vertical   = (queenFile == attackedSquareFile)

            const rankDst = queenRank - attackedSquareRank
            const fileDst = queenFile - attackedSquareFile


            let offsetIndex;
            // Queen is in a straight line with the attacked square

            // On same rank
            if (horizontal){
                offsetIndex = (attackedSquareFile < queenFile) ? 1 : 0 
                const foundPiece = this.ScanForPiece(board, squareIndex, offsetIndex, Piece.queen | attackerColor, ignoreKing)
                if (foundPiece) return true
            }

            // On same file
            else if (vertical){
                offsetIndex = (attackedSquareRank < queenRank) ? 2 : 3
                const foundPiece = this.ScanForPiece(board, squareIndex, offsetIndex, Piece.queen | attackerColor, ignoreKing)
                if (foundPiece) return true
            }
            
            // On the same diagonal
            else if (Math.abs(rankDst) == Math.abs(fileDst)){
                
                // Up
                if (0 < rankDst){
                    // right (+9) or left (+7)
                    offsetIndex = (0 < fileDst) ? 4 : 6 
                }

                // Down
                else {
                    // right (-7) or left (-9)
                    offsetIndex = (0 < fileDst) ? 7 : 5 
                }

                const foundPiece = this.ScanForPiece(board, squareIndex, offsetIndex, Piece.queen | attackerColor, ignoreKing)
                if (foundPiece) return true
            }
        }

        // Square is safe if all conditions are met
        return false   
    }

    static ScanForPiece(board, start, offsetIndex, piece, ignoreKing){
        const numSquaresToEdge = ChessHelper.numSquaresToEdge[start][offsetIndex]
        const offset = Piece.directionOffsets[offsetIndex]

        for (let i = 0; i < numSquaresToEdge; i++){
            const squareIndex = start + offset * (i + 1)
            const pieceOnSquare = board.square[squareIndex]
            
            if (pieceOnSquare == Piece.none) continue

            if ((pieceOnSquare & Piece.typeMask) == Piece.king && ignoreKing) continue

            if (pieceOnSquare == piece){
                return true
            }

            return false
        }

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