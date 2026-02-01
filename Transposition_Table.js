export class Transposition_Table {
    constructor (){
        this.table = {}
    }

    Clear(){
        this.table = {}
    }

    AddPosition(hash, score, depth, flag, bestMove){
        return
        this.table[hash] = {
            score: score, 
            depth: depth,
            flag: flag,
            bestMove: bestMove,
        }
    }

    IsValidTransposition(hash, currentDepth){
        const inTable = (hash in this.table) 
        if (inTable){
            let depthSearched = this.table[hash].depth
            return (depthSearched >= currentDepth)
        }
        return false
    }
}