class Evaluation {
    
    static mirroredBoard = new Array(64)
    static mapFromPieceType = Array(12)

    static kingMap = [
        20, 20, 20, 10, 10, 10, 20, 20,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
        10, 10, 10, 10, 10, 10, 10, 10,
    ]

    static pawnMap = [
        0,  0,  0,  0,  0,  0,  0,  0,
        40, 40, 20, 10, 10, 20, 40, 40,
        20, 20, 25, 30, 30, 25, 20, 20,
        25, 25, 30, 35, 35, 30, 25, 25,
        30, 30, 35, 40, 40, 35, 30, 30,
        35, 35, 40, 45, 45, 40, 35, 35,
        40, 40, 45, 50, 50, 45, 40, 40,
        0,  0,  0,  0,  0,  0,  0,  0
    ]

    static knightMap = [
        10, 20, 30, 30, 30, 30, 20, 10,
        20, 40, 45, 45, 45, 45, 40, 20,
        30, 45, 55, 60, 60, 55, 45, 30,
        30, 45, 60, 70, 70, 60, 45, 30,
        30, 45, 60, 70, 70, 60, 45, 30,
        30, 45, 55, 60, 60, 55, 45, 30,
        20, 40, 45, 45, 45, 45, 40, 20,
        10, 20, 30, 30, 30, 30, 20, 10
    ]

    static bishopMap = [
        20, 25, 30, 35, 35, 30, 25, 20,
        25, 30, 35, 40, 40, 35, 30, 25,
        30, 35, 45, 50, 50, 45, 35, 30,
        35, 40, 50, 55, 55, 50, 40, 35,
        35, 40, 50, 55, 55, 50, 40, 35,
        30, 35, 45, 50, 50, 45, 35, 30,
        25, 30, 35, 40, 40, 35, 30, 25,
        20, 25, 30, 35, 35, 30, 25, 20
    ]

    static rookMap = [
        20, 20, 25, 30, 30, 25, 20, 20,
        25, 25, 30, 35, 35, 30, 25, 25,
        30, 30, 35, 40, 40, 35, 30, 30,
        35, 35, 40, 45, 45, 40, 35, 35,
        40, 40, 45, 50, 50, 45, 40, 40,
        45, 45, 50, 55, 55, 50, 45, 45,
        50, 50, 55, 60, 60, 55, 50, 50,
        55, 55, 60, 65, 65, 60, 55, 55
    ]

    static queenMap = [
        20, 25, 30, 35, 35, 30, 25, 20,
        25, 30, 35, 40, 40, 35, 30, 25,
        30, 35, 40, 45, 45, 40, 35, 30,
        35, 40, 45, 50, 50, 45, 40, 35,
        35, 40, 45, 50, 50, 45, 40, 35,
        30, 35, 40, 45, 45, 40, 35, 30,
        25, 30, 35, 40, 40, 35, 30, 25,
        20, 25, 30, 35, 35, 30, 25, 20
    ]


    static {
        //Generer spegla brett
        let i = 0
        for (let rank = 7; rank >= 0; rank--){
            for (let file = 0; file < 8; file++){
                const squareIndex =  rank * 8 + file
                this.mirroredBoard[squareIndex] = i
                i++
            }
        }
        
        //Setter opp kart for brikketyper
        this.mapFromPieceType[Piece.king] = this.kingMap
        this.mapFromPieceType[Piece.pawn] = this.pawnMap
        this.mapFromPieceType[Piece.knight] = this.knightMap
        this.mapFromPieceType[Piece.bishop] = this.bishopMap
        this.mapFromPieceType[Piece.rook] = this.rookMap
        this.mapFromPieceType[Piece.queen] = this.queenMap
    }

    static evaluate(board){
        /**
         * Rekner ein skalar verdi som representerer kor gunstig posisjonen er for
         * spelaren sin tur det er. Dette er viktig for å få riktig resultat frå negamax funksjonen
         */
        const endgameWeight = ChessHelper.CalculateEndgameWeight(board)

        posEvaled ++
        let score = 0

        const materialWeight = 1
        const positionBonusWeight = 1

        score += this.countMaterial(board) * materialWeight
        score += this.positionBonus(board) * positionBonusWeight

        score += this.forceKingToCorner(board, endgameWeight)

        return score
        
    }

    static countMaterial(board){
        // tell materiale
        let materialScore = 0
        for (let i = 0; i < 64; i++){
            // Finner brikke type (inga brikke får vidare)
            const piece = board.square[i]
            if (piece == 0) continue
            
            // forteikn 
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            materialScore += sign * Piece.getPieceValue(piece)
        }

        return materialScore
    }

    static positionBonus(board){
        let score = 0

        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue

            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            const pieceType = piece & 0b00111
            const mapIndex = (Piece.CheckPieceColor(piece, true)) ? i : Evaluation.mirroredBoard[i]

            score += sign * (Evaluation.mapFromPieceType[pieceType][mapIndex])
        }
        
        return score
    }

    static forceKingToCorner(board, endgameWeight){
        
        let score = 0

        // find kings
        let friendlyKingSquare = 0
        let enemyKingSquare = 0

        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            if (!Piece.IsType(piece, Piece.king)) continue

            const isFriendly = Piece.CheckPieceColor(piece, board.white_To_Move)

            if (isFriendly) friendlyKingSquare = i
            else enemyKingSquare = i
        }
        // rekn ut avstand til midthen for vennleg konge
        const friendlyKingRank = ChessHelper.Rank(friendlyKingSquare)
        const friendlyKingFile = ChessHelper.File(friendlyKingSquare)
       
        // rekn ut avstand til midthen for fiendtleg konge
        const enemyKingRank = ChessHelper.Rank(enemyKingSquare)
        const enemyKingFile = ChessHelper.File(enemyKingSquare)

        // oppfordre til å få fiendtlig konge til hjørne av brettet
        const enemyKingDstToCenterRank = Math.abs(enemyKingRank - 3.5)
        const enemyKingDstToCenterFile = Math.abs(enemyKingFile - 3.5)

        const enemyKingDstToCenter = enemyKingDstToCenterRank + enemyKingDstToCenterFile
        score += enemyKingDstToCenter * 3
        
        
        const RankDistance = Math.abs(friendlyKingRank - enemyKingRank)
        const FileDistance = Math.abs(friendlyKingFile - enemyKingFile)
        const kingDistance = FileDistance + RankDistance

        
        score += (14 - kingDistance)

        return score * endgameWeight
    }
}
