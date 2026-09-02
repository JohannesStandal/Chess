import { Piece } from "../../Board/piece.js"
import { ChessHelper } from "../../Utils/Chess_Helper.js"

const isolatedPawnWeight = 1
const passedPawnWeight   = 1
const stackedPawnWeight  = 1

const isolatedPawnPenalty = -20
const stackedPawnPenalties = [0, 0, -8, -15, -25, -40, 0, 0]
const passedPawnBonuses = [0, 10, 10, 20, 40, 80, 120, 0]

class PawnHashTable {
    constructor(){
        this.numEntries = 1 << 16
        this.mask = this.numEntries - 1

        // store a key for validatin hash and score
        this.key = new Array(this.numEntries).fill(0)
        this.score = new Array(this.numEntries).fill(0)

        // logging values
        this.hits = 0
        this.miss = 0
        this.writes = 0
        this.overWrites = 0

    }

    Clear(){
        this.key.fill(0)
        this.score.fill(0)

        this.miss = 0
        this.hits = 0
        this.writes = 0
        this.overWrites = 0
    }

    log(){
        console.log("miss: ", this.miss)
        console.log("hits: ", this.hits)
        console.log("Writes: ", this.writes)
        console.log("overWrites: ", this.overWrites)
    }

    Read(high, low){
        // Use hash high for indexing
        const index = high & this.mask
        
        // Read values
        const key = this.key[index]
        const score = this.score[index]

        // Use the low hash for key to match results
        if (key == low){
            this.hits ++
            return {"hit": true, "score": score}
        }
        this.miss ++
        // We have never seen this pawn structure
        return {"hit": false, "score": 0}
    }

    Store(high, low, score){
        const index = high & this.mask
        if (this.key[index] == 0){
            this.writes ++
        }
        else {
            this.overWrites ++
        }

        this.key[index] = low
        this.score[index] = score
    }
}

export class PawnStructure {
    constructor(){
        this.PawnHashTable = new PawnHashTable()
    }

    Reset(){
        this.PawnHashTable.Clear()
    }

    Eval(board){
        // Evaluates the pawnstructure for isolated, passed, and stacked pawns
        // The heuristic gives a positive score for white and negative for black


        // Check pawn hash table
        const high = board.pawnHash.high >>> 0
        const low  = board.pawnHash.low  >>> 0

        const hashEntry = this.PawnHashTable.Read(high, low)
        // We have calculated this pawn structure before
        if (hashEntry.hit){
            return hashEntry.score
        }

        
        // Precompute data for pawn structure
        const whitePawns = board.pl.listFromPiece[Piece.pawn | Piece.white]
        const blackPawns = board.pl.listFromPiece[Piece.pawn | Piece.black]

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
        score += this.isolatedPawns(numWhitePawnsOnFile) * isolatedPawnWeight
        score -= this.isolatedPawns(numBlackPawnsOnFile) * isolatedPawnWeight

        // Multiple pawns on file
        score += this.stackedPawns(numWhitePawnsOnFile) * stackedPawnWeight
        score -= this.stackedPawns(numBlackPawnsOnFile) * stackedPawnWeight

        // Passed pawns
        score += this.passedPawns(highestRankWP, highestRankBP, true) * passedPawnWeight
        score -= this.passedPawns(lowestRankWP, lowestRankBP, false ) * passedPawnWeight


        // Store result in hash table
        this.PawnHashTable.Store(high, low, score)
        
        return score
    }

    isolatedPawns(numPawnsOnFile){
        // penalty for an isolated pawn
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
                totalPenalty += isolatedPawnPenalty
            }
                
        }

        return totalPenalty
    }

    stackedPawns(numPawnsOnFile){
        // penalties for number of pawns on the same file
        let totalPenalty = 0
        

        for (let file = 0; file < 8; file++){
            // sum up the penalty for number of pawns on this file
            const numPawns = numPawnsOnFile[file]
            totalPenalty += stackedPawnPenalties[numPawns]

            // if (1 < numPawns) console.log(numPawns, "Stacked pawns on file: ", file)
        }

        return totalPenalty
    }

    passedPawns(whitePawnRankOnFile, blackPawnRankOnFile, white){
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
                    score += passedPawnBonuses[highestWhitePawnRank]
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
                    score += passedPawnBonuses[8 - lowestBlackPawnRank]
                }
            }
        }

        return score
    }

}