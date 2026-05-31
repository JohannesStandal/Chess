import { Piece } from "../Board/piece.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { Move } from "../Board/move.js"
import { PieceSquareTables } from "./PieceSquareTables.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

export class Evaluation {
    static pieceValues = new Array(12)
    static {
        this.pieceValues[Piece.none] = 0
        this.pieceValues[Piece.king] = 0
        this.pieceValues[Piece.pawn] = 100
        this.pieceValues[Piece.knight] = 320
        this.pieceValues[Piece.bishop] = 330
        this.pieceValues[Piece.rook] = 500
        this.pieceValues[Piece.queen] = 900 
    }

    static evaluate(board){
        /**
         * Estimate how good the position is for the given player. Positiv -> Winning
         * while negative -> losing.
         */

        // Game phase in the range 0 to 1, where 0 = Endgame, 1 = Mid game
        const phase = this.calculateGamePhase(board)
        
        // Count material
        const materialScore = this.countMaterial(board)
        const materialAdvantage = (200 < materialScore)

        // Accumulate the scores
        const generalScore = this.generalScore(board)
        const midGameScore = this.midGameScore(board, materialAdvantage) * phase
        const endGameScore = this.endGameScore(board, materialAdvantage) * (1 - phase)
    
        return materialScore + generalScore + midGameScore + endGameScore
    }

    static generalScore(board){
        // Evaluation terms that apply for the entire game
        let score = 0

        const pawnStructureWeight = 1
        
        score += this.pawnStructure(board,  board.white_To_Move) * pawnStructureWeight
        score -= this.pawnStructure(board, !board.white_To_Move) * pawnStructureWeight
        
        return score
    }

    static midGameScore(board, materialAdvantage){
        // Evaluation terms important for the midgame
        let midGameScore = 0

        // Weights
        const PSTweight = 1 
        const mobilityWeight = 1
        const kingExposureWeight = 1
        const pawnShieldWeight = 1
        const castleRightWeight = 1

        // find kings
        const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        const enemyKingSquare = board.white_To_Move ? board.blackKingSquare : board.whiteKingSquare

        // Piece Square tables
        midGameScore += this.PSTmidgame(board) * PSTweight
        
        // Sliding piece mobility bonus
        midGameScore += this.mobilityBonus(board) * mobilityWeight

        // King Exposure
        midGameScore += this.kingExposure(board, friendlyKingSquare, enemyKingSquare) * kingExposureWeight

        // Pawn shields. 
        midGameScore += this.pawnShields(board, friendlyKingSquare, board.white_To_Move) * pawnShieldWeight
        midGameScore -= this.pawnShields(board, enemyKingSquare, !board.white_To_Move)   * pawnShieldWeight

        // castle penalty
        midGameScore += this.lostCastleRightsPenalty(board,  board.white_To_Move) * castleRightWeight
        midGameScore -= this.lostCastleRightsPenalty(board, !board.white_To_Move) * castleRightWeight

        return midGameScore
    }

    static endGameScore(board, materialAdvantage){
        // Evaluation terms important for the endgame
        let endGameScore = 0

        // Weights for endgame score
        const PSTweight = 1
        const mopUpWeigth = 30

        // find kings
        const friendlyKingSquare = board.white_To_Move ? board.whiteKingSquare : board.blackKingSquare
        const enemyKingSquare = board.white_To_Move ? board.blackKingSquare : board.whiteKingSquare

        // PST and mopup eval
        endGameScore += this.PSTendgame(board) * PSTweight

        if (materialAdvantage){
            endGameScore += this.mopUpScore(board, friendlyKingSquare, enemyKingSquare) * mopUpWeigth
        }

        return endGameScore
    }

    static calculateGamePhase(board){
        // Count up non pawn material
        let total = 0
        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            const pieceType = Piece.Type(piece)

            switch (pieceType){
                case(Piece.knight):
                    total += 1
                    break

                case(Piece.bishop):
                    total += 1
                    break

                case(Piece.rook):
                    total += 2
                    break

                case(Piece.queen):
                    total += 4
                    break
            }
        }
        return total / 24
    }

    static countMaterial(board){
        // Count the total material on the board
        let materialScore = 0

        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue
            
            const pieceType = Piece.Type(piece)
            const value = this.pieceValues[pieceType]
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            materialScore += sign * value
        }

        return materialScore
    }

    // Positioning of individual pieces
    static PSTmidgame(board){
        let score = 0
        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue


            const bonus = PieceSquareTables.MidgameValue(piece, i)
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            
            score += sign * bonus
        }

        return score
    }

    static PSTendgame(board){
        let score = 0
        for (let i = 0; i < 64; i++){
            const piece = board.square[i]
            if (piece == 0) continue


            const bonus = PieceSquareTables.EndgameValue(piece, i)
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            
            
            score += sign * bonus
        }

        return score
    }

    static mobilityBonus(board){
        // Count up non pawn material
        let mobilityScore = 0

        for (let i = 0; i<64; i++){
            const piece = board.square[i]
            const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1
            const pieceType = Piece.Type(piece)

            let mobility;
            switch (pieceType){
                case(Piece.bishop):
                    mobility = AttackDetector.Mobility(board, i, false, true)
                    mobilityScore += sign * mobility * 4
                    break

                case(Piece.rook):
                    mobility = AttackDetector.Mobility(board, i, true, false)
                    mobilityScore += sign * mobility * 2 
                    break

                case(Piece.queen):
                    mobility = AttackDetector.Mobility(board, i, true, true)
                    mobilityScore += sign * mobility * 1
                    break
            }
        }
        return mobilityScore
    }

    static mopUpScore(board, friendlyKingSquare, enemyKingSquare){
        let score = 0

        // friendly king
        const friendlyKingRank = ChessHelper.RankIndex(friendlyKingSquare)
        const friendlyKingFile = ChessHelper.FileIndex(friendlyKingSquare)
       
        // rekn ut avstand til midthen for fiendtleg konge
        const enemyKingRank = ChessHelper.RankIndex(enemyKingSquare)
        const enemyKingFile = ChessHelper.FileIndex(enemyKingSquare)

        // oppfordre til å få fiendtlig konge til hjørne av brettet
        const enemyKingDstToCenterRank = Math.abs(enemyKingRank - 3.5)
        const enemyKingDstToCenterFile = Math.abs(enemyKingFile - 3.5)

        // total distance to center
        const enemyKingDstToCenter = (enemyKingDstToCenterRank + enemyKingDstToCenterFile)
        score += enemyKingDstToCenter / 7
        
        // encourage kings to be close to each other
        const RankDistance = Math.abs(friendlyKingRank - enemyKingRank) 
        const FileDistance = Math.abs(friendlyKingFile - enemyKingFile) 
        const kingDistance = FileDistance + RankDistance

        
        score += (14 - kingDistance) / 14

        return score
    }

    // King safety
    static kingExposure(board, friendlyKingSquare, enemyKingSquare){
        let score = 0
        // Punish having an exposed king, but incentivise an exposed enemy king
        score -= AttackDetector.Mobility(board, friendlyKingSquare, true, false) * 4
        score -= AttackDetector.Mobility(board, friendlyKingSquare, false, true) * 2

        score += AttackDetector.Mobility(board, enemyKingSquare, true, false) * 4
        score += AttackDetector.Mobility(board, enemyKingSquare, false, true) * 2

        return score
    }

    static pawnShields(board, kingSquare, white) {
        let pawnShieldScore = 0

        const isKingside = kingSquare == (white ? 6 : 62)
        const isQueenside = kingSquare == (white ? 2 : 58)

        if (!isKingside && !isQueenside) return 0

        let shieldSquares;

        if (isKingside){
            shieldSquares = (white)
                ? [13, 14, 15, 21, 22, 23] // White shield squares
                : [53, 54, 55, 45, 46, 47] // Black shield squares
        }
        else if (isQueenside){
            shieldSquares = (white)
                ? [ 8,  9, 10, 16, 17, 18] // White shield squares
                : [48, 49, 50, 40, 41, 42] // Black shield squares
        }

        // Bonuses for a pawn on the different squares
        const weights = [10, 15, 10, 5, 8, 5]
        const color = (white) ? Piece.white : Piece.black

        for (let i = 0; i < 6; i++) {
            const targetSquare = shieldSquares[i]
            const piece = board.square[targetSquare]

            if (piece == (Piece.pawn | color)) {
                pawnShieldScore += weights[i]
            } 
            else {
                pawnShieldScore -= weights[i] // missing pawn is dangerous
            }
        }

        return pawnShieldScore;
    }

    static lostCastleRightsPenalty(board, white){
        // Gives a penalty if you have lost your ability to castle
        // if you havent already done so
        const penalty = -10

        if (white){
            const kingSquare = board.whiteKingSquare
            // You have castled, no need for a penalty
            if (kingSquare == 2 || kingSquare == 6) return 0

            const castleRigths = (board.castleRigths >> 2) & 0b11
            if (castleRigths == 0) return penalty
        }

        else {
            const kingSquare = board.blackKingSquare
            // You have castled, no need for a penalty
            if (kingSquare == 58 || kingSquare == 62) return 0

            const castleRigths = (board.castleRigths) & 0b11
            if (castleRigths == 0) return penalty

        }
        
        return 0
    }

    // Pawn structure
    static pawnStructure(board, white){
        let pawnStructureScore = 0

        // Weights
        const passedPawnWeight = 1
        const isolatedPawnWeight = 1
        const doubleStackedPawnWeight = 1

        
        const friendlyPawn = Piece.pawn | ( (white) ? Piece.white : Piece.black )
        const opponentPawn = Piece.pawn | ( (white) ? Piece.black : Piece.white )
        
        // Count up number of friendly pawns for every file
        const numFriendlyPawnsOnFile = new Array(8)

        // Find the highes pawn rank (closest to promotion) on every file
        const whitePawnRankOnFile = new Array(8)
        const blackPawnRankOnFile = new Array(8)

        for (let file = 0; file < 8; file++){
            numFriendlyPawnsOnFile[file] = this.numPawnsOnFile(board, file, friendlyPawn)

            whitePawnRankOnFile[file] = this.RankOnFile(board, file, (Piece.pawn | Piece.white), white)
            blackPawnRankOnFile[file] = this.RankOnFile(board, file, (Piece.pawn | Piece.black), white)
        }
        // console.log(whitePawnRankOnFile, blackPawnRankOnFile)

        // Provide penalty for poor structure regarding isolated and doubled pawns
        pawnStructureScore += this.doubleStackedPawns(numFriendlyPawnsOnFile)
        pawnStructureScore += this.isolatedPawns(numFriendlyPawnsOnFile)
        pawnStructureScore += this.passedPawns(whitePawnRankOnFile, blackPawnRankOnFile, white)
        
        return pawnStructureScore
    }

    static isolatedPawns(numFriendlyPawnsOnFile){
        // penalty for an isolated pawn
        const penalty = -20
        let totalPenalty = 0
        
        for (let file = 0; file < 8; file++){
            const fileLeft = Math.max(0, file - 1)
            const fileRight = Math.min(7, file + 1)
            
            let totalPawns = 0
            if (fileLeft  != file) totalPawns += numFriendlyPawnsOnFile[fileLeft ]
            if (fileRight != file) totalPawns += numFriendlyPawnsOnFile[fileRight]

            if (totalPawns == 0) totalPenalty += penalty
        }

        return totalPenalty
    }

    static doubleStackedPawns(numFriendlyPawnsOnFile){
        // penalties for number of pawns on the same file
        const penalties = [0, 0, -8, -15, -25, -40, 0, 0]
        let totalPenalty = 0
        

        for (let file = 0; file < 8; file++){
            // sum up the penalty for number of pawns on this file
            const numPawns = numFriendlyPawnsOnFile[file]
            totalPenalty += penalties[numPawns]
        }

        return totalPenalty
    }

    static passedPawns(whitePawnRankOnFile, blackPawnRankOnFile, white){
        const passedPawnBonus = [0, 10, 10, 45, 70, 100, 220, 0]
        let score = 0

        // Loop over every file and check for passed pawns 
        for (let file = 0; file < 8; file++){
            // Files to the left and right
            const fileLeft = Math.max(0, file - 1)
            const fileRight = Math.min(7, file + 1)
            
            if (white){
                const highestWhitePawnRank =  whitePawnRankOnFile[file]
                if (highestWhitePawnRank < 0) continue
                
                const highestBlackPawnRankLeft = blackPawnRankOnFile[fileLeft]
                const highestBlackPawnRankForward = blackPawnRankOnFile[file]
                const highestBlackPawnRankRight =  blackPawnRankOnFile[fileRight]

                const passedPawn = (
                    highestBlackPawnRankLeft    <= highestWhitePawnRank &&
                    highestBlackPawnRankForward <= highestWhitePawnRank &&
                    highestBlackPawnRankRight   <= highestWhitePawnRank
                )

                
                if (passedPawn){
                    //console.log("White passed pawn on square: ", ChessHelper.SquareIndex(highestWhitePawnRank, file))
                    score += passedPawnBonus[highestWhitePawnRank]
                }
            }
            else {
                const lowestBlackPawnRank =  blackPawnRankOnFile[file]
                if (7 < lowestBlackPawnRank) continue

                const lowestWhitePawnRankLeft = whitePawnRankOnFile[fileLeft]
                const lowestWhitePawnRankForward = whitePawnRankOnFile[file]
                const lowestWhitePawnRankRight =  whitePawnRankOnFile[fileRight]

                const passedPawn = (
                    lowestWhitePawnRankLeft    >= lowestBlackPawnRank &&
                    lowestWhitePawnRankForward >= lowestBlackPawnRank &&
                    lowestWhitePawnRankRight   >= lowestBlackPawnRank
                )

                if (passedPawn){
                    //console.log("White passed pawn on square: ", ChessHelper.SquareIndex(lowestBlackPawnRank, file))
                    score += passedPawnBonus[8 - lowestBlackPawnRank]
                }
            }
        }

        return score
    }

    static numPawnsOnFile(board, file, pawn){
        let numPawnsOnFile = 0

        for (let i = file; i < 64; i += 8){
            const pieceOnSquare = board.square[i]
            if (pieceOnSquare == pawn) numPawnsOnFile ++
        }

        return numPawnsOnFile
    }

    static RankOnFile(board, file, pawn, highest){
        // Find the pawn with the highest rankIndex on this file
        if (highest){
            // Start on the top of the board and loop down
            const startSquare = 56 + file
            for (let i = startSquare; 0 < i; i -= 8){
                const pieceOnSquare = board.square[i]

                // If the piece is a pawn we have found the highest rank
                if (pieceOnSquare == pawn) return ChessHelper.RankIndex(i)
            }
            return -1
        }
        // Find the pawn with the lowest rankIndex on this file
        else {
            const startSquare = file
            for (let i = startSquare; i < 64; i += 8){
                const pieceOnSquare = board.square[i]

                // If the piece is a pawn we have found the lowest rank
                if (pieceOnSquare == pawn) return ChessHelper.RankIndex(i)
            }
            return 8
        }
        
    }
}