import { ChessHelper } from "../Utils/Chess_Helper.js"

export class AttackTables {
    // Attacktables is a precomputet lookup array of the legal moves
    // a piece would be able to make on an empty board.
    //  
    // AttackTable.pieceType[startindex] -> list of legal target squares
    //
    // The program no longer needs to compute move offsets at runtime, and erases edge case 
    // issues such as board warping. Of courese there must a check for what pieces inhabits 
    // the targetsquare.

    static king = new Array(64)
    static knight = new Array(64)
    static whitePawn = new Array(64).fill([])
    static blackPawn = new Array(64).fill([])


    // Precompute King Moves
    static {
        for (let startIndex = 0; startIndex < 64; startIndex++){
            const moves = []

            const west  = (0 < ChessHelper.numSquaresToEdge[startIndex][0]) 
            const east  = (0 < ChessHelper.numSquaresToEdge[startIndex][1]) 
            const north = (0 < ChessHelper.numSquaresToEdge[startIndex][2])
            const south = (0 < ChessHelper.numSquaresToEdge[startIndex][3]) 

            const dir = [west, north, east, south, west]
            const offset = [-1, 8, 1, -8, 7, 9, -7, -9]
            
            for (let i = 0; i < 4; i++){
                if (dir[i]){
                    const targetSquare = startIndex + offset[i]
                    moves.push(targetSquare)
                }
                if (dir[i] && dir[i+1]){
                    const targetSquare = startIndex + offset[i+4]
                    moves.push(targetSquare)
                }
               
            }
            
            this.king[startIndex] = moves
        }
    }

    // Precompute Knight Moves
    static {
        for (let startIndex = 0; startIndex < 64; startIndex++){
                const moves = []
                const data = ChessHelper.numSquaresToEdge[startIndex] 

                //Offset: + 15
                if (data[2] >= 2 && data[0] >= 1){
                    moves.push(startIndex + 15)
                }
                //Offset: + 17
                if (data[2] >= 2 && data[1] >= 1){
                    moves.push(startIndex + 17)
                }
                //Offset: + 6
                if (data[0] >= 2 && data[2] >= 1){
                    moves.push(startIndex + 6)
                }
                //Offset: + 10
                if (data[1] >= 2 && data[2] >= 1){
                    moves.push(startIndex + 10)
                }
                //Offset: - 10
                if (data[0] >= 2 && data[3] >= 1){
                    moves.push(startIndex - 10)
                }
                //Offset: - 6
                if (data[1] >= 2 && data[3] >= 1){
                    moves.push(startIndex - 6)
                }
                //Offset: -17
                if (data[3] >= 2 && data[0] >= 1){
                    moves.push(startIndex - 17)
                }
                //Offset: -15
                if (data[3] >= 2 && data[1] >= 1){
                    moves.push(startIndex - 15)
                }
                

                this.knight[startIndex] = moves
        }
    }

    // Precompute Pawn Moves
    static {
        for (let startIndex = 0; startIndex < 64; startIndex++){
            const whiteMoves = []
            const blackMoves = []

            const west = (ChessHelper.numSquaresToEdge[startIndex][0] > 0)
            const east = (ChessHelper.numSquaresToEdge[startIndex][1] > 0)

            if (west){
                whiteMoves.push(startIndex + 7) 
                blackMoves.push(startIndex - 9)  

            }
            if (east){
                whiteMoves.push(startIndex + 9)
                blackMoves.push(startIndex - 7)
            }
            // There can be no moves on the promotion ranks
            if (startIndex < 56) this.whitePawn[startIndex] = whiteMoves
            if (7 < startIndex) this.blackPawn[startIndex] = blackMoves
        }
    }
}

