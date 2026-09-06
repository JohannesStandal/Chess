import { Piece } from "../../Board/piece.js"
import { ChessHelper } from "../../Utils/Chess_Helper.js"
import { PieceSquareTables } from "../Evaluation/PieceSquareTables.js"
import { AttackDetector } from "../../MoveGeneration/Attack.js"

import { PawnStructure } from "./PawnStructure.js"
import { drawScore } from "../../Constants/SearchConstants.js"

const kingValue = 0
const pawnValue = 100
const knightValue = 320
const bishopValue = 330
const rookValue = 500
const queenValue = 900

export const pieceValues = new Array(12)

pieceValues[Piece.none  ] = 0
pieceValues[Piece.king  ] = kingValue
pieceValues[Piece.pawn  ] = pawnValue
pieceValues[Piece.knight] = knightValue 
pieceValues[Piece.bishop] = bishopValue
pieceValues[Piece.rook  ] = rookValue
pieceValues[Piece.queen ] = queenValue


export class Evaluation {
    constructor(){
        this.pawnStructure = new PawnStructure()
    }

    evaluate(board){
        /**
         * Estimate who is winning the position. Positive values for white
         * and negative values for black. Before returing the value it is multiplied by
         * a sign variable so that a positive score correspond to the current player
         * making it compatible with the negamax algorithm         
         **/

        // Insufficient material
        if (ChessHelper.InsufficientMaterial(board)) return drawScore
        
        // Game phase in the range 0 to 1, where 0 = Endgame, 1 = Mid game
        const phase = this.calculateGamePhase(board)
        
        // Count material
        const whiteMaterial = this.countMaterial(board, true)
        const blackMaterial = this.countMaterial(board, false)

        const materialScore = whiteMaterial - blackMaterial

        // PST 
        const pstScore = PieceSquareTables.PieceSquareTableValue(board, phase)

        // Mop up score
        const mopUpScore = this.mopUp(board, materialScore) * (1  - phase)

        // Pawn structure
        const pawnStructureScore = this.pawnStructure.PawnStructureEval(board) 

        // Bishop pair
        const bishopPairScore = this.bishopPair(board)

        // Midgame score
         const midGameScore = this.midGameScore(board) * phase
        
        // Add it all together        
        const totalScore = 
            materialScore       + 
            pstScore            +
            pawnStructureScore  +
            bishopPairScore     +
            midGameScore        + 
            mopUpScore
        
        const sign = (board.white_To_Move) ? 1 : -1

        return sign * totalScore
    }

    midGameScore(board){
        // Evaluation terms important for the midgame
        let midGameScore = 0

        // Weights
        const mobilityWeight = 1
        const kingExposureWeight = 1
        const pawnShieldWeight = 2
        const kingTropismWeight = 1
        
        // Sliding piece mobility bonus
        midGameScore += this.slidingPieceMobility(board, true)  * mobilityWeight
        midGameScore -= this.slidingPieceMobility(board, false) * mobilityWeight

        // King Exposure
        midGameScore += this.virtualKingMobility(board, board.whiteKingSquare) * kingExposureWeight
        midGameScore -= this.virtualKingMobility(board, board.blackKingSquare) * kingExposureWeight

        // Pawn shields. 
        midGameScore += this.pawnShields(board, board.whiteKingSquare, true)  * pawnShieldWeight
        midGameScore -= this.pawnShields(board, board.blackKingSquare, false) * pawnShieldWeight

        // King tropism
        midGameScore += this.kingTropism(board, true ) * kingTropismWeight
        midGameScore -= this.kingTropism(board, false) * kingTropismWeight

        return midGameScore
    }

    calculateGamePhase(board){
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

    countMaterial(board, white){
        const color = white ? Piece.white : Piece.black
        // Count the total material on the board
        let materialScore = 0

        materialScore += board.pl.Count(Piece.pawn   | color) * pawnValue
        materialScore += board.pl.Count(Piece.knight | color) * knightValue
        materialScore += board.pl.Count(Piece.bishop | color) * bishopValue
        materialScore += board.pl.Count(Piece.rook   | color) * rookValue
        materialScore += board.pl.Count(Piece.queen  | color) * queenValue

        return materialScore
    }

    slidingPieceMobility(board, white){
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
    mopUp(board, materialScore){
        const mopUpWeigth = 50

        let score = 0

        // white advantage
        if (300 < materialScore){
            score += this.mopUpScore(board.whiteKingSquare, board.blackKingSquare)
            // console.log("white")
        }
        
        // black advantage
        if (materialScore < -300){
            score -= this.mopUpScore(board.blackKingSquare, board.whiteKingSquare)
            // console.log("black")
        }
        // console.log(score * mopUpWeigth)
        return score * mopUpWeigth
    }

    mopUpScore(chasingKing, runningKing){
        let score = 0

        const distanceToCenterWeight = 1
        const kingDistanceWeight = 2

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
        score += (runningKingDstToCenter / 7) * distanceToCenterWeight
        
        
        // Encourage closing manhattan distance between the kings
        const RankDistance = Math.abs(chasingKingRank - runningKingRank) 
        const FileDistance = Math.abs(chasingKingFile - runningKingFile) 

        const kingDistance = FileDistance + RankDistance
        score += ((14 - kingDistance) / 14) * kingDistanceWeight

        return score
    }

    // King safety
    virtualKingMobility(board, kingSquare){
        let score = 0

        // Punish having an exposed king, but incentivise an exposed enemy king
        score -= AttackDetector.Mobility(board, kingSquare, true, false) * 4
        score -= AttackDetector.Mobility(board, kingSquare, false, true) * 2

        return score
    }

    pawnShields(board, kingSquare, white) {
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

    kingTropism(board, white){
        // King tropism describes how many pieces are near the opposing king. 
        // Pieces are weighed agains their own value to help build up attacks against the king
        const tropismBonuses = [0, 50, 30, 20, 10, 5, 0, 0]
        let score = 0

        const friendlyColor = white ? Piece.white : Piece.black
        const kingSquare = white ? board.blackKingSquare : board.whiteKingSquare
        
        // knights
        for (const knight in board.pl.listFromPiece[Piece.knight | friendlyColor]){
            const dst = Math.min(ChessHelper.manhattanDistance(kingSquare, knight), 7)
            score += tropismBonuses[dst] * 2
        }

        // bishops
        for (const bishop in board.pl.listFromPiece[Piece.bishop | friendlyColor]){
            const dst = Math.min(ChessHelper.manhattanDistance(kingSquare, bishop), 7)
            score += tropismBonuses[dst] * 2
        }

        // rooks 
        for (const rook in board.pl.listFromPiece[Piece.rook | friendlyColor]){
            const dst = Math.min(ChessHelper.manhattanDistance(kingSquare, rook), 7)
            score += tropismBonuses[dst] * 3
        }

        // queens
        for (const queen in board.pl.listFromPiece[Piece.queen | friendlyColor]){
            const dst = Math.min(ChessHelper.manhattanDistance(kingSquare, queen), 7)
            score += tropismBonuses[dst] * 4
        }

        return score

        

        
        



    }

    // Bishop pair
    bishopPair(board){
        // 30 centipawns for a bishop pair
        let score = 0

        const numWP = board.pl.Count(Piece.white | Piece.bishop)
        const numBP = board.pl.Count(Piece.black | Piece.bishop)

        if (1 < numWP) score += 30
        if (1 < numBP) score -= 30

        return score
    } 
}