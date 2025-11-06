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

    static isInsufficientMaterial(board) {
    let whitePieces = []
    let blackPieces = []

    for (let i = 0; i < 64; i++) {
        const piece = board.square[i]
        if (piece == 0) continue
        if (Piece.CheckPieceColor(piece, true)) whitePieces.push(piece)
        else blackPieces.push(piece)
    }

    // Fjern konger
    whitePieces = whitePieces.filter(p => !Piece.IsType(p, Piece.king))
    blackPieces = blackPieces.filter(p => !Piece.IsType(p, Piece.king))

    // Begge bare konge
    if (whitePieces.length === 0 && blackPieces.length === 0) return true

    // Konge + løper eller konge + springer mot bare konge
    const simpleMinor = (pieces) =>
        pieces.length === 1 && (Piece.IsType(pieces[0], Piece.bishop) || Piece.IsType(pieces[0], Piece.knight))

    if ((simpleMinor(whitePieces) && blackPieces.length === 0) ||
        (simpleMinor(blackPieces) && whitePieces.length === 0)) {
        return true
    }

    // Løper mot løper, samme farge (mer avansert sjekk kan legges til senere)
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

        return (16 - numOpponentPieces) * 10
    }
    
}