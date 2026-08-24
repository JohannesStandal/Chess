import { mateTreshold, checkMateScore } from "../Constants/SearchConstants.js"


export class Transposition_Table {
    constructor (){
        this.table = new Map()
    }

    Clear(){
        this.table = new Map()
    }

    Store(hash, ply, depth, score, flag, bestMove){
        return
        // Avoid storing draws as it threefold repetition is history dependent
        // and TT table is state dependant, so it can cause false positives
        if (score == 0) return

        const entry = this.table.get(hash) 

        if (entry == undefined){
            // add position to the table
            this.table.set(hash, {
                score: this.ScoreToTT(score, ply), 
                depth: depth,
                flag: flag,
                bestMove: bestMove,
            })
            return
        }

        // if the entry alreadt exists for deeper depth, we dont want to overwrite it
        if (depth <= entry.depth){
            return
        }

        this.table.set(hash, {
                score: this.ScoreToTT(score, ply), 
                depth: depth,
                flag: flag,
                bestMove: bestMove,
        })
    }

    Read(hash, ply, currentDepth){
        const entry = this.table.get(hash) 
        if (entry == undefined){
            return {"hit": false, "move": null}
        }

        if (entry.depth < currentDepth) return {"hit": false, "move": entry.bestMove}

        return {
            "hit": true,
            "move": entry.bestMove,
            "score": this.ScoreFromTT(entry.score, ply),
            "flag": entry.flag
        }
        
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