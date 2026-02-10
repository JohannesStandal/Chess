export class TimeManager {
    constructor(timeLimitMS){
        this.timeLimitMS = timeLimitMS
        
        this.cancelSearch = false
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
}