import { Transposition_Table } from "./Transposition_Table.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { MoveOrder } from "./MoveOrdering.js"
import { QuiesenceSearch } from "./QuiesenceSearch.js"

// constants
const checkMateScore = 100000
const drawScore = -1

export class Search {
    constructor(board, timeManager){
        this.board = board
        this.timeManager = timeManager
        this.TT = new Transposition_Table()

        this.bestMove = null
    }

    IterativeDeepening(){
        // start searchtime
        this.timeManager.Start()

        // iterative deepening
        for (let depth = 1; depth < 24; depth++){
            // search the position
            this.currentDepth = depth
            this.Negamax(depth, -Infinity, Infinity)
            
            // stop search if time limit is exceeded
            if (this.timeManager.cancelSearch){
                console.log("Search canceled")
                break
            }
        }
        return this.bestMove ?? this.board.GenerateLegalMoves()[0]
    }

    Negamax(depth, alpha, beta){
        if (this.timeManager.ExceededTimeLimit()){
            return null
        }
        //Generer lovlege trekk
        const hash = this.board.zobrist.hash
        
        //transposition table
        if (TT.IsValidTransposition(hash, depth) && depth != this.currentDepth){
            const entry = TT.table.get(hash)
            // TT position is accurate
            if (entry.flag == "EXACT"){
                return entry.score
            }
            // update upper or lower bound
            if (entry.flag == "UPPER"){
                beta = Math.min(beta, entry.score)
            }
            else if (entry.flag == "LOWER"){
                alpha = Math.max(alpha, entry.score)
            }
            // early cutoff
            if (alpha >= beta){
                return entry.score
            }
        }
    
        // generer trekk
        const UnsortedlegalMoves = this.board.GenerateLegalMoves()
        
        //Ingen lovlege trekk, sjekk etter sjakkmatt / sjakk patt
        if (UnsortedlegalMoves.length == 0){    
            //Checkmate
            if (this.board.InCheck(this.board.white_To_Move)){
                const mateScore = -(checkMateScore + depth)
                TT.AddPosition(hash, mateScore, depth, "EXACT")
                return mateScore
    
            }
            
            //Stalemate
            TT.AddPosition(hash, drawScore, depth, "EXACT")
            return drawScore
        }
    
            // check for threefold repetition
        if (ChessHelper.checkForRepetitions(this.board.repetitionTable)) {
            //console.log("found threefold repetition in search")
            return drawScore
        }
    
        
        // Start quiesence search at leaf nodes
        if (depth == 0){
            return QuiesenceSearch(this.board, this.timeManager, alpha, beta)
        } 
        
        // sorter trekk etter kor bra du GJETTAR at trekket er
        let moves = MoveOrder(this.board, UnsortedlegalMoves)
    
        //Sørger for at det beste trekket vi har funne så langt blir utforska først
        if (depth == this.currentDepth && this.bestMove != null) moves.unshift(this.bestMove)
        
            
        //Lagre beste poengsum og beste trekk
        const originalAlpha = alpha
    
        // Iterate over every legal move
        for (let move of moves){
            
            // Evaluate future position
            this.board.Make_Move(move)
            const score = - this.Negamax(depth - 1, -beta, -alpha)
            this.board.Unmake_Move(move)
            
            //exit point for iterative deepening
            if (this.timeManager.cancelSearch) return null
            
            //Om poengsummen er betre enn noko som er funne så langt så kan du lagre
            //beste trekk og poengsum
            if (alpha < score){
                alpha = score
                if (depth == this.currentDepth){
                    this.bestMove = move
                }
            }
    
            // lowerbound fail high node
            if (beta <= score){
                TT.AddPosition(hash, score, depth, "LOWER")
                return score    
            }
        }
        
        let flag = ""
        if (alpha <= originalAlpha) flag = "UPPER";
        else if (alpha >= beta) flag = "LOWER";
        else flag = "EXACT";
    
        TT.AddPosition(hash, alpha, depth, flag)
    
        return alpha
    }
}
