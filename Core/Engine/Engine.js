/*
Features

Search
- Negamax
- Quiescence search
- Alpha Beta pruning
- Move order optimisation
- Transposision table
- Iterativ Deepening

Evaluation
- Material count
- bonuses for certain squares for each piecetype
- avoids threefold repetition

TODO:

10 - fix UI for promotion (currently breaks the entire program)

50 - refactor the code to contain a chess engine folder
50 - create match manager taking two folders for testing engines


30 - Move encoder / decoder: (move represented by a 16 bit value)
20 - Store bestmove in TT table
80 - Opening book
30 - Zobrist hashing should account for castling rights and en passant square
15 - Track king squares incrementally
30 - mobility bonus in evaluation
*/

import { Board } from "../Board/chessboard.js"
import { Search } from "./Search.js"
import { TimeManager } from "./TimeManager.js"
// import { openingBook } from "../Openings/openingBook.js"

export class Engine {
    constructor(thinkingTime=1000){
        this.board = new Board()
        this.book = false
        this.timeManager = new TimeManager(thinkingTime)

        this.search = new Search(this.board, this.timeManager)
    }

    Reset(){
        this.board.Reset()
    }

    SetPosition(fen){
        this.board.Load_Fen(fen)
    }

    PlayedMoves(moves){
        for (const move of moves){
            this.board.Make_Move(move)
        }
    }

    ThinkingTime(thinkingTime){
        this.timeManager.SetTimeLimit(thinkingTime)
    }

    Bestmove(depth = 0){

        if (this.book){
            const hash = this.board.zobrist.hash
            const openingBookMove = openingBook.bookMove(hash)
    
            if (openingBookMove != 0){
                console.log("Found move in opening book")
                return openingBookMove
            }
        }

        if (depth == 0){
            return this.search.IterativeDeepening()
        }

        
        return this.search.fixedDepthSearch(depth)
    }

    Stop(){
        this.timeManager.Stop()
    }

    PVS(){
        this.search.GetPrincipalVariations(10)
    }
}