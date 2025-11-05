class ChessHelper {


    static checkForRepetitions(repetetionTable){
        var dict = {}
        for (let value of repetetionTable){
            if (value in dict){
                dict[value] += 1
                if (dict[value] == 3) return true
            }
            else {
                dict[value] = 1
            }
        }
        return false
        
    }

    static Rank(squareIndex){
        return Math.floor(squareIndex / 8)
    }

    static File(squareIndex){
        return (squareIndex % 8) - 1
    }

    static CalculateEndgameWeight(board){
        let numOpponentPieces = 0

        for (let piece of board.square){
            if (Piece.CheckPieceColor(piece, !board.white_To_Move)){
                numOpponentPieces += 1
            }
        }

        return (16 - numOpponentPieces)
    }
    
}