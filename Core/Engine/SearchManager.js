export class SearchManager {
    constructor(timeLimitMS){
        this.timeLimitMS = timeLimitMS
        
        this.nodeCount = 0
        this.plyMin = 0
        this.plyMax = 0

        this.cancelSearch = false
        this.start = 0
        
        this.elapsedMS = 0
    }

    SetTimeLimit(time){
        this.timeLimitMS = time
    }

    Reset(){
        this.nodeCount = 0
        this.plyMin = 0
        this.plyMax = 0
    }

    Start(){
        this.cancelSearch = false
        this.start = performance.now()
    }

    Stop(){
        this.cancelSearch = true
    }

    ExceededTimeLimit(){
        // how much time has elapsed
        this.elapsedMS = performance.now() - this.start

        // has the time elapsed overexceeded the timelimit
        this.cancelSearch = (this.timeLimitMS < this.elapsedMS)
        return this.cancelSearch
    }

    SetPlyMax(ply){
        this.plyMax = Math.max(this.plyMax, ply)
    }

    SetPlyMin(ply){
        this.plyMin = Math.max(this.plyMin, ply)
    }
}