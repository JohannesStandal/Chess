export class Transposition_Table {
    constructor (){
        this.table = new Map()
    }

    Clear(){
        this.table = new Map()
    }

    AddPosition(hash, score, depth, flag, bestMove){
        return
        // Avoid storing draws as it threefold repetition is history dependent
        // and TT table is state dependant, so it can cause false positives
        if (score == 0) return

        const entry = this.table.get(hash) 
        if (entry == undefined){
            // add position to the table
            this.table.set(hash, {
                score: score, 
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
                score: score, 
                depth: depth,
                flag: flag,
                bestMove: bestMove,
        })
        
    }

    IsValidTransposition(hash, currentDepth){
        const entry = this.table.get(hash) 
        if (entry == undefined){
            return false
        }
        let depthSearched = entry.depth
        return (depthSearched >= currentDepth)
    }
}