import { mateTreshold } from "../Constants/SearchConstants.js"

export class Transposition_Table {
    constructor (mb = 1000){
        this.SetSizeMB(mb)
    }

    SetSizeMB(mb){
        const bytes = mb * 1024 * 1024
        const numEntries = Math.floor(bytes / 31)

        // find power of two that makes the table big enough
        this.numEntries = 1
        while (this.numEntries < numEntries){
           this.numEntries = this.numEntries << 1
        }
        this.numEntries = this.numEntries >> 1
        // this.numEntries = 1 << 20
        this.mask = this.numEntries - 1

        // Initialize arrays
        this.hashHigh = new Array(this.numEntries) // 4 bytes
        this.hashLow  = new Array(this.numEntries) // 4 bytes

        this.bestMove = new Array(this.numEntries) // 2 bytes
        this.depth = new Array(this.numEntries).fill(0)     // 1 bytes
        this.score = new Array(this.numEntries)    // 4 bytes 
        this.flag = new Array(this.numEntries)           // 16 byte

        this.collisions = 0

    }

    Read(high, low, ply, currentDepth){
        high >>>= 0
        low >>>= 0
        const index = high & this.mask

        // Relevant to see if entry is useful
        const ttHigh = this.hashHigh[index]
        const ttLow = this.hashLow[index]
        const depth = this.depth[index]

        // Values that describe the position
        const score = this.score[index]
        const flag = this.flag[index]
        const bestMove = this.bestMove[index]

        // TT hit
        if (ttHigh == high && ttLow  == low){
            // Is the current search shallower than the one we stored
            // We can still use the previous bestmove for move ordering
            if (depth <= currentDepth) return {"hit": false, "move": bestMove} 

            // Checkmate scaling
            let mateScaledScore = score
            
            if (mateTreshold < score){    
                mateScaledScore = score - ply
            }
            else if (score < -mateTreshold){
                mateScaledScore = score + ply 
            }

            // console.log("Succsessfull TT read", ply, index)
            return {
                "hit": true,
                "move": bestMove,
                "score": mateScaledScore,
                "flag": flag
            }
        }
        if (ttHigh != undefined) this.collisions ++

        return {
            "hit": false, "move": null
        }
    }

    Store(high, low, ply, currentDepth, score, flag, bestMove){
        high >>>= 0
        low >>>= 0
        
        // We dont want to store draws because threefold repetition is history dependent
        if (score == 0) return

        const index = (high >>> 0) & this.mask

        // Relevant to see if entry is useful
        const ttHigh = this.hashHigh[index]
        const ttLow = this.hashLow[index]
        const depth = this.depth[index]

        // Entry should not be overwritten
        if (ttHigh == high && ttLow == low && currentDepth <= depth) return

        // Checkmate scaling
        let mateScaledScore = score

        if (mateTreshold < mateScaledScore)
            mateScaledScore += ply
        else if (mateScaledScore < -mateTreshold)
            mateScaledScore -= ply

        // Store entry
        this.hashHigh[index] = high
        this.hashLow[index] = low
        this.depth[index] = currentDepth

        this.score[index] = mateScaledScore
        this.flag[index] = flag
        this.bestMove[index] = bestMove
        
        // console.log("Succsesfull TT store", ply, index)
    }
}