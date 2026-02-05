export class Transposition_Table {
    constructor (){
        this.table = new Map()
    }

    Clear(){
        this.table = new Map()
    }

    AddPosition(hash, score, depth, flag){
        if (this.table.has(hash)){
            // if the entry alreadt exists for deeper depth, we dont want to overwrite it
            const entry = this.table.get(hash)
            if (depth < entry.depth){
                return
            }
        }
        // add position to the table
        this.table.set(hash, {
            score: score, 
            depth: depth,
            flag: flag,
        })
    }

    IsValidTransposition(hash, currentDepth){
        const inTable = this.table.has(hash) 
        if (inTable){
            let depthSearched = this.table.get(hash).depth
            return (depthSearched >= currentDepth)
        }
        return false
    }
}