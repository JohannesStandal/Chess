class Transposition_Table {
    constructor (){
        this.table = {}
    }

    Clear(){
        this.table = {}
    }

    AddPosition(hash, score, depth){
        this.table[hash] = {score: score, depth: depth}
    }

    IsValidTransposition(hash, currentDepth){
        const inTable = (hash in this.table) 
        if (inTable){
            let depthSearched = this.table[hash].depth
            return (depthSearched >= currentDepth)
        }
        return false
    }

    GetScore(hash){
        return this.table[hash].score
    }

}