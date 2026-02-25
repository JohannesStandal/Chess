import { Transposition_Table } from "./Transposition_Table.js"
import { ChessHelper } from "../Utils/Chess_Helper.js"
import { MoveOrder } from "./MoveOrdering.js"
import { QuiesenceSearch } from "./QuiesenceSearch.js"
import { Move } from "../Board/move.js"

// constants
const maxSearchDepth = 24
const checkMateScore = 100000
const mateTreshold = checkMateScore - maxSearchDepth
const drawScore = -1
var nodesSearched;


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
        this.bestMove = null

        // iterative deepening
        for (let depth = 1; depth < maxSearchDepth; depth++){
            // tracking nodes too see improvement
            nodesSearched = 0
            
            // search the position
            this.currentDepth = depth
            const score = this.Negamax(depth, 0, -Infinity, Infinity)
            console.log("depth: ", depth, "Bestmove: ", Move.ToUCI(this.bestMove), " Nodes: ", nodesSearched)
            if (mateTreshold <= score){
                console.log("Found forced checkmate at M" + Math.ceil(this.currentDepth / 2))
                this.timeManager.Stop()
            }
            // stop search if time limit is exceeded
            if (this.timeManager.cancelSearch){
                console.log("Search canceled", this.currentDepth)
                break
            }
        }
        return this.bestMove ?? this.board.GenerateLegalMoves()[0]
    }

    Negamax(depth, ply, alpha, beta){
        if (this.timeManager.ExceededTimeLimit()){
            return null
        }
        nodesSearched ++
        //Generer lovlege trekk
        const hash = this.board.zobrist.hash
    
        // generer trekk
        const UnsortedlegalMoves = this.board.GenerateLegalMoves()
        
        //Ingen lovlege trekk, sjekk etter sjakkmatt / sjakk patt
        if (UnsortedlegalMoves.length == 0){    
            //Checkmate
            if (this.board.InCheck(this.board.white_To_Move)){
                const mateScore = -(checkMateScore - ply)
                this.TT.AddPosition(hash, mateScore, depth, "EXACT")
                return mateScore
    
            }
            
            //Stalemate
            this.TT.AddPosition(hash, drawScore, depth, "EXACT")
            return drawScore
        }
    
        // check for threefold repetition
        if (ChessHelper.checkForRepetitions(this.board.repetitionTable)) {
            //console.log("found threefold repetition in search")
            return drawScore
        }

        //transposition table
        if (this.TT.IsValidTransposition(hash, depth) && 
            depth != this.currentDepth){

            const entry = this.TT.table.get(hash)
            // TT position is accurate
            if (entry.flag == "EXACT"){
                // Scale checmates to match depth
                // a M2 found at 3ply -> M3
                if (mateTreshold < entry.score){
                    return entry.score + ply
                }
                // same but when losing
                else if (-mateTreshold > entry.score){
                    return entry.score - ply
                }
                // default
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
            const score = - this.Negamax(depth - 1, ply + 1, -beta, -alpha)
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
                this.TT.AddPosition(hash, score, depth, "LOWER")
                return score    
            }
        }
        
        let flag = ""
        if (alpha <= originalAlpha) flag = "UPPER";
        else if (alpha >= beta) flag = "LOWER";
        else flag = "EXACT";
    
        this.TT.AddPosition(hash, alpha, depth, flag)
    
        return alpha
    }
}
