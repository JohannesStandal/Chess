import { mateTreshold, checkMateScore } from "../Constants/SearchConstants.js"

/**
 * 
 * TT.read()
 * 
 * - hit
 *   - Stored position has been searched deeper
 *       mate scaling
 *       return {all data}
 *      
 *   - Needs a deeper search
 *       return {no hit, bestmove}
 * 
 * - no hit
 * 
 * return {no hit, no bestmove}
 * 
 * 
 * 
 * TT.Store() 
 * 
 * - hit
 * 
 * - no hit
 * Store all data
 * 
 */



export class Transposition_Table {
    constructor (mb = 64){
        this.disabled = false
        this.SetSizeMB(64)
    }

    SetSizeMB(mb){
        const bytes = mb * 1024 * 1024
        this.numEntries = Math.floor(bytes / 31)
        

        // // find power of two that makes the table big enough
        // this.numEntries = 1
        // while (this.numEntries < numEntries){
        //    this.numEntries = this.numEntries << 1
        // }
        // this.numEntries = this.numEntries >> 1
        // // this.numEntries = 1 << 20
        // this.mask = this.numEntries - 1
        

        // Initialize arrays
        this.hashHigh = new Array(this.numEntries) // 4 bytes
        this.hashLow  = new Array(this.numEntries) // 4 bytes

        this.bestMove = new Array(this.numEntries) // 2 bytes
        this.depth = new Array(this.numEntries).fill(-1)     // 1 bytes
        this.score = new Array(this.numEntries)    // 4 bytes 
        this.flag = new Array(this.numEntries)           // 16 byte

        this.collisions = 0

    }

    Read(high, low, ply, currentDepth){
        if (this.disabled) return {"hit": false, "move": null}

        const index = (high % this.numEntries)
        // console.log(index)

        // Relevant to see if entry is useful
        const ttHigh = this.hashHigh[index]
        const ttLow = this.hashLow[index]
        const storedDepth = this.depth[index]

        // Values that describe the position
        const score = this.score[index]
        const flag = this.flag[index]
        const bestMove = this.bestMove[index]

        // TT hit
        if (ttHigh == high && ttLow  == low){
            return {
                "hit": true,
                "move": bestMove,
                "score": this.ScoreFromTT(score, ply),
                "flag": flag,
                "depth": storedDepth
            }
        }
        
        return {
            "hit": false, "move": null
        }
    }

    Store(high, low, ply, currentDepth, score, flag, bestMove){
        if (this.disabled) return

        // We dont want to store draws because threefold repetition is history dependent
        if (score == 0) return

        const index = (high % this.numEntries)
       
        // this part is temporarily disabled for debugging

        // Relevant to see if entry is useful
        const ttHigh = this.hashHigh[index]
        const ttLow = this.hashLow[index]
        const storedDepth = this.depth[index]
        const storedScore = this.score[index]
        
        // // Entry already exists. Should it be overwritten
        if (ttHigh == high && ttLow == low){

            // Current search is shallower than the one we stored
            if (currentDepth <= storedDepth) return
            
        }
        
        // Store entry
        this.hashHigh[index] = high
        this.hashLow[index] = low
        this.depth[index] = currentDepth

        this.score[index] = this.ScoreToTT(score, ply)
        this.flag[index] = flag
        this.bestMove[index] = bestMove
    }

    ScoreToTT(score, ply){
        // Checkmate scaling
        if (mateTreshold < score)
            return score + ply
        else if (score < -mateTreshold)
            return score - ply

        return score

    }

    ScoreFromTT(score, ply){
        // Checkmate scaling
        if (mateTreshold < score)
            return score - ply
        else if (score < -mateTreshold)
            return score + ply

        return score
    }
}