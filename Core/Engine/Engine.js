import { Board } from "../Board/chessboard.js"
import { Search } from "./Search.js"
import { TimeManager } from "./TimeManager.js"


export class Engine {
    constructor(thinkingTime=1000){
        this.board = new Board()
        this.timeManager = new TimeManager(thinkingTime)

        this.search = new Search(this.board, this.timeManager)
    }

    Bestmove(fen, moves){
        // load fen
        this.board.Load_Fen(fen)
        // make all moves on the board
        for (let move of moves){
            this.board.Make_Move(move)
        }
        // search
        return this.search.IterativeDeepening()
    }

    Stop(){
        this.timeManager.Stop()
    }
}