export class SearchManager {
    constructor(timeLimitMS){
        this.timeLimitMS = timeLimitMS
        
        this.nodeCount = 0
        this.plyMin = 0
        this.plyMax = 0

        this.cancelSearch = false
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
        const elapsedMS = performance.now() - this.start

        // has the time elapsed overexceeded the timelimit
        this.cancelSearch = (this.timeLimitMS < elapsedMS)
        return this.cancelSearch
    }

    SetPlyMax(ply){
        this.plyMax = Math.max(this.plyMax, ply)
    }

    SetPlyMin(ply){
        this.plyMin = Math.max(this.plyMin, ply)
    }
}