import { Piece } from "../Board/piece.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { Move } from "../Board/move.js"
import { PieceSquareTables } from "./PieceSquareTables.js"
import { AttackDetector } from "../MoveGeneration/Attack.js"

const kingValue = 0
const pawnValue = 100
const knightValue = 320
const bishopValue = 330
const rookValue = 500
const queenValue = 900


export class Evaluation {
    static pieceValues = new Array(12)
    static {
        this.pieceValues[Piece.none  ] = 0
        this.pieceValues[Piece.king  ] = kingValue
        this.pieceValues[Piece.pawn  ] = pawnValue
        this.pieceValues[Piece.knight] = knightValue 
        this.pieceValues[Piece.bishop] = bishopValue
        this.pieceValues[Piece.rook  ] = rookValue
        this.pieceValues[Piece.queen ] = queenValue
    }

    static evaluate(board){
        /**
         * Estimate who is winning the position. Positive values for white
         * and negative values for black. Before returing the value it is multiplied by
         * a sign variable so that a positive score correspond to the current player
         * making it compatible with the negamax algorithm         
         **/
        
        /**
         * Todo. 
         * flip all calculation to the white is winning, black is losing scheme.
         * 
         * - pawn shields
         * - PST
         * - Castle rights 
         * - king exposure
         */
        
        // Game phase in the range 0 to 1, where 0 = Endgame, 1 = Mid game
        const phase = this.calculateGamePhase(board)
        
        // Count material
        const whiteMaterial = this.countMaterial(board, true)
        const blackMaterial = this.countMaterial(board, false)

        const materialScore = whiteMaterial - blackMaterial

        // Accumulate the scores
        const generalScore = this.generalScore(board)
        const midGameScore = this.midGameScore(board) * phase
        const endGameScore = this.endGameScore(board) * (1 - phase)

        // Mop up score
        const mopUpScore = this.mopUp(board, materialScore) * (1  - phase)
        
        // Add it all together        
        const totalScore = 
            materialScore + 
            generalScore  + 
            midGameScore  + 
            endGameScore  + 
            mopUpScore
        
        const sign = (board.white_To_Move) ? 1 : -1

        return sign * totalScore
    }

    static generalScore(board){
        // Evaluation terms that apply for the entire game
        let score = 0
        
        const pawnStructureWeight = 1
        
        const whitePawns = board.pl.listFromPiece[Piece.white | Piece.pawn]
        const blackPawns = board.pl.listFromPiece[Piece.black | Piece.pawn]
        
        score += this.pawnStructure(whitePawns, blackPawns) 
        
        return score
    }

    static midGameScore(board){
        // Evaluation terms important for the midgame
        let midGameScore = 0

        // Weights
        const PSTweight = 1 
        const mobilityWeight = 1
        const kingExposureWeight = 1
        const pawnShieldWeight = 1
        const castleRightWeight = 1

        // Piece Square tables
        midGameScore += this.PSTmidgame(board) * PSTweight
        
        // Sliding piece mobility bonus
        midGameScore += this.mobilityBonus(board, true)  * mobilityWeight
        midGameScore -= this.mobilityBonus(board, false) * mobilityWeight

        // King Exposure
        midGameScore += this.kingExposure(board, board.whiteKingSquare) * kingExposureWeight
        midGameScore -= this.kingExposure(board, board.blackKingSquare) * kingExposureWeight

        // Pawn shields. 
        midGameScore += this.pawnShields(board, board.whiteKingSquare, true)  * pawnShieldWeight
        midGameScore -= this.pawnShields(board, board.blackKingSquare, false) * pawnShieldWeight

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
        
        // PST and mopup eval
        endGameScore += this.PSTendgame(board) * PSTweight
        

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

    static countMaterial(board, white){
        const color = white ? Piece.white : Piece.black
        // Count the total material on the board
        let materialScore = 0

        materialScore += board.pl.Count(Piece.pawn | color) * pawnValue
        materialScore += board.pl.Count(Piece.knight | color) * knightValue
        materialScore += board.pl.Count(Piece.bishop | color) * bishopValue
        materialScore += board.pl.Count(Piece.rook | color) * rookValue
        materialScore += board.pl.Count(Piece.queen | color) * queenValue

        return materialScore
    }

    // Positioning of individual pieces
    static PSTmidgame(board){
        const pieces = [
            Piece.king,
            Piece.pawn,
            Piece.knight,
            Piece.bishop,
            Piece.rook,
            Piece.queen
        ]
        const colors = [
            Piece.white,
            Piece.black,
        ]

        let pstBonus = 0

        for (const pieceType of pieces){
            for (const color of colors){

                const piece = pieceType | color
                const pieceList = board.pl.listFromPiece[piece]

                for (const squareIndex of pieceList){
                    pstBonus += PieceSquareTables.MidgameValue(piece, squareIndex)
                }
            }
        }

        return pstBonus
    }

    static PSTendgame(board){
        const pieces = [
            Piece.king,
            Piece.pawn,
            Piece.knight,
            Piece.bishop,
            Piece.rook,
            Piece.queen
        ]
        const colors = [
            Piece.white,
            Piece.black,
        ]

        let pstBonus = 0

        for (const pieceType of pieces){
            for (const color of colors){

                const piece = pieceType | color
                const pieceList = board.pl.listFromPiece[piece]

                for (const squareIndex of pieceList){
                    pstBonus += PieceSquareTables.EndgameValue(piece, squareIndex)
                }
            }
        }

        return pstBonus
    }

    static mobilityBonus(board, white){
        // Reward mobility for sliding pieces
        let mobilityScore = 0

        const color = white ? Piece.white : Piece.black

        const bishops = board.pl.listFromPiece[color | Piece.bishop]
        const rooks   = board.pl.listFromPiece[color | Piece.rook  ]
        const queens  = board.pl.listFromPiece[color | Piece.queen ]

        for (const bishop of bishops){
            const mobility = AttackDetector.Mobility(board, bishop, false, true)
            // Piece is trapped
            if (mobility == 0){
                mobilityScore -= 50
            }

            // Mobility bonus
            else {
                mobilityScore += 4 * mobility
            }
        }

        for (const rook of rooks){
            const mobility = AttackDetector.Mobility(board, rook, true, false)
            // Piece is trapped
            if (mobility == 0){
                mobilityScore -= 100
            }
            
            // Mobility bonus
            else {
                mobilityScore += 2 * mobility
            }
        }

        for (const queen of queens){
            const mobility = AttackDetector.Mobility(board, queen, true, true)
            // Piece is trapped
            if (mobility == 0){
                mobilityScore -= 500
            }
            
            // Mobility bonus
            else {
                mobilityScore += 1 * mobility
            }
        }

        return mobilityScore
    }
    
    // Mop up for endgame
    static mopUp(board, materialScore){
        const mopUpWeigth = 30

        let score = 0

        // white advantage
        if (300 < materialScore){
            score += this.mopUpScore(board.whiteKingSquare, board.blackKingSquare)
        }
        
        // black advantage
        if (materialScore < -300){
            score -= this.mopUpScore(board.blackKingSquare, board.whiteKingSquare)
        }

        return score * mopUpWeigth
    }

    static mopUpScore(chasingKing, runningKing){
        let score = 0

        // The king doing the chasing
        const chasingKingRank = ChessHelper.RankIndex(chasingKing)
        const chasingKingFile = ChessHelper.FileIndex(chasingKing)
       
        // The king being chased
        const runningKingRank = ChessHelper.RankIndex(runningKing)
        const runningKingFile = ChessHelper.FileIndex(runningKing)

        // Make the running king stay away from the center
        const runningKingDstToCenterRank = Math.abs(runningKingRank - 3.5)
        const runningKingDstToCenterFile = Math.abs(runningKingFile - 3.5)

        // Give an advantage for manhattan distance to center
        const runningKingDstToCenter = (runningKingDstToCenterRank + runningKingDstToCenterFile)
        score += runningKingDstToCenter / 7
        
        
        // Encourage closing manhattan distance between the kings
        const RankDistance = Math.abs(chasingKingRank - runningKingRank) 
        const FileDistance = Math.abs(chasingKingFile - runningKingFile) 

        const kingDistance = FileDistance + RankDistance
        score += (14 - kingDistance) / 14

        return score
    }

    // King safety
    static kingExposure(board, kingSquare){
        let score = 0

        // Punish having an exposed king, but incentivise an exposed enemy king
        score -= AttackDetector.Mobility(board, kingSquare, true, false) * 4
        score -= AttackDetector.Mobility(board, kingSquare, false, true) * 2

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

            const castleRigths = (board.castlingRights >> 2) & 0b11
            if (castleRigths == 0) return penalty
        }

        else {
            const kingSquare = board.blackKingSquare
            // You have castled, no need for a penalty
            if (kingSquare == 58 || kingSquare == 62) return 0

            const castleRigths = (board.castlingRights) & 0b11
            if (castleRigths == 0) return penalty

        }
        
        return 0
    }

    // Pawn structure
    static isolatedPawns(numPawnsOnFile){
        // penalty for an isolated pawn
        const penalty = -20
        let totalPenalty = 0
        
        for (let file = 0; file < 8; file++){
            // Check if there is a pawn on this file
            if (numPawnsOnFile[file] == 0) continue

            let totalPawns = 0

            const fileLeft = Math.max(0, file - 1)
            const fileRight = Math.min(7, file + 1)            

            if (fileLeft  != file) totalPawns += numPawnsOnFile[fileLeft ]
            if (fileRight != file) totalPawns += numPawnsOnFile[fileRight]

            if (totalPawns == 0){
                // console.log("Isolated pawn on file: ", file)
                totalPenalty += penalty
            }
                
        }

        return totalPenalty
    }

    static stackedPawns(numPawnsOnFile){
        // penalties for number of pawns on the same file
        const penalties = [0, 0, -8, -15, -25, -40, 0, 0]
        let totalPenalty = 0
        

        for (let file = 0; file < 8; file++){
            // sum up the penalty for number of pawns on this file
            const numPawns = numPawnsOnFile[file]
            totalPenalty += penalties[numPawns]

            // if (1 < numPawns) console.log(numPawns, "Stacked pawns on file: ", file)
        }

        return totalPenalty
    }

    static passedPawns(whitePawnRankOnFile, blackPawnRankOnFile, white){
        const passedPawnBonus = [0, 10, 10, 20, 40, 80, 120, 0]
        let score = 0

        // Loop over every file and check for passed pawns 
        for (let file = 0; file < 8; file++){
            // Files to the left and right
            const fileLeft = Math.max(0, file - 1)
            const fileRight = Math.min(7, file + 1)
            
            if (white){
                const highestWhitePawnRank =  whitePawnRankOnFile[file]
                if (highestWhitePawnRank < 1) continue
                
                const highestBlackPawnRankLeft = blackPawnRankOnFile[fileLeft]
                const highestBlackPawnRankForward = blackPawnRankOnFile[file]
                const highestBlackPawnRankRight =  blackPawnRankOnFile[fileRight]

                const passedPawn = (
                    highestBlackPawnRankLeft    <= highestWhitePawnRank &&
                    highestBlackPawnRankForward <= highestWhitePawnRank &&
                    highestBlackPawnRankRight   <= highestWhitePawnRank
                )

                
                if (passedPawn){
                    // console.log("White passed pawn on square: ", ChessHelper.SquareIndex(highestWhitePawnRank, file))
                    score += passedPawnBonus[highestWhitePawnRank]
                }
            }
            else {
                const lowestBlackPawnRank =  blackPawnRankOnFile[file]
                if (6 < lowestBlackPawnRank) continue

                const lowestWhitePawnRankLeft = whitePawnRankOnFile[fileLeft]
                const lowestWhitePawnRankForward = whitePawnRankOnFile[file]
                const lowestWhitePawnRankRight =  whitePawnRankOnFile[fileRight]

                const passedPawn = (
                    lowestBlackPawnRank <= lowestWhitePawnRankLeft    &&
                    lowestBlackPawnRank <= lowestWhitePawnRankForward &&
                    lowestBlackPawnRank <= lowestWhitePawnRankRight  
                )

                if (passedPawn){
                    // console.log("Black passed pawn on square: ", ChessHelper.SquareIndex(lowestBlackPawnRank, file))
                    score += passedPawnBonus[8 - lowestBlackPawnRank]
                }
            }
        }

        return score
    }

    static pawnStructure(whitePawns, blackPawns){
        // Evaluates the pawnstructure for isolated, passed, and stacked pawns
        // The heuristic gives a positive score for white and negative for black

        const isolatedWeight = 1
        const passedPawnWeight = 1
        const stackedPawnWeight = 1


        
        // Precompute data for pawn structure
        const highestRankWP = new Array(8).fill(0)
        const highestRankBP = new Array(8).fill(0)
        
        const lowestRankWP  = new Array(8).fill(7)
        const lowestRankBP  = new Array(8).fill(7)

        const numBlackPawnsOnFile = new Array(8).fill(0)
        const numWhitePawnsOnFile = new Array(8).fill(0)

        for (const whitePawnIndex of whitePawns){
            const file = ChessHelper.FileIndex(whitePawnIndex)
            const rank = ChessHelper.RankIndex(whitePawnIndex)

            highestRankWP[file] = Math.max(rank, highestRankWP[file])
            lowestRankWP[file]  = Math.min(rank, lowestRankWP[file])
            
            numWhitePawnsOnFile[file] ++
        }

        for (const blackPawnIndex of blackPawns){
            const file = ChessHelper.FileIndex(blackPawnIndex)
            const rank = ChessHelper.RankIndex(blackPawnIndex)

            highestRankBP[file] = Math.max(rank, highestRankBP[file])
            lowestRankBP[file]  = Math.min(rank, lowestRankBP[file])
            
            numBlackPawnsOnFile[file] ++
        }

        // Count total score for pawn structure
        let score = 0

        // Isolated pawns
        score += this.isolatedPawns(numWhitePawnsOnFile) * isolatedWeight
        score -= this.isolatedPawns(numBlackPawnsOnFile) * isolatedWeight

        // Multiple pawns on file
        score += this.stackedPawns(numWhitePawnsOnFile) * stackedPawnWeight
        score -= this.stackedPawns(numBlackPawnsOnFile) * stackedPawnWeight

        // Passed pawns
        score += this.passedPawns(highestRankWP, highestRankBP, true) * passedPawnWeight
        score -= this.passedPawns(lowestRankWP, lowestRankBP, false ) * passedPawnWeight

        return score
    }
}