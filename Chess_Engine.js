/*
Features

Search
- Negamax
- Quiescence search
- Alpha Beta
- Move order optimisation
- Iterativ Deepening
- Transposision table

Evaluation
- Material count
- bonuses for certain squares for each piecetype
- avoids threefold repetition
*/

import { Transposition_Table } from "./Transposition_Table.js";
import { Evaluation } from "./evaluation.js";
import { ChessHelper } from "./Chess_Helper.js";
import { board } from "./UI.js";

//Søkedybde i PLY
const MaxDepthLimit = 10
const thinkingTime = 1000

var originalDepth; 
var bestMoveSoFar;

var startTime = 0
var elapsedTime = 0
var searching = false

const checkMateScore = 10000000
const drawScore = 0

var nodesExplored = 0
var TT = new Transposition_Table()
window.TT = TT

function CheckIfStillSearching(){
    elapsedTime = performance.now() - startTime
    searching = (thinkingTime > elapsedTime)
    //console.log(elapsedTime, searching)
}

export function ChessEngine(){
    console.log("New search\n")
    
    bestMoveSoFar = board.GenerateLegalMoves()[0]
    startTime = performance.now() 
    
    //iterativ søkedybde
    for (let i = 1; i < MaxDepthLimit; i++){
        board.moves = []
        nodesExplored = 0
        originalDepth = i

        console.log("\nSearch Depth:", originalDepth)
        //const searchStartTime = performance.now()
        Search(originalDepth, -Infinity, Infinity)

        //const searchEndTime = performance.now()
        //const searchTime = searchEndTime - searchStartTime
        
        if (! searching){
            console.log("\nSearch canceled due to time limit")
            console.log("move:", bestMoveSoFar)
            console.log("numNodes:", nodesExplored)
            break
        }
        
        console.log("move:", bestMoveSoFar)
        console.log("numNodes:", nodesExplored)
    }
      
    console.log("\nSearch finished")
    console.log("Move:", bestMoveSoFar.CoordinatesNotation())
    console.log("depth:", originalDepth - 1)
    console.log("numNodes:", nodesExplored)

    //console.log(TT)
    return bestMoveSoFar
}

window.ChessEngine = ChessEngine

function MoveOrder(moves){
    const sortedMoves = moves.sort((a, b) => {
        const valueA = Evaluation.Move(a, board)
        const valueB = Evaluation.Move(b, board)

        return valueB - valueA 
    }
    )

    //sortedMoves.forEach(move =>{console.log(move.CoordinatesNotation())})
    return sortedMoves
}

function QuiesenceSearch(alpha, beta){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    
    CheckIfStillSearching()
    if (! searching) return null
    // Transposition tables for quick repetition / checkmate detection 
    const hash = board.zobrist.hash
    if (TT.IsValidTransposition(hash, MaxDepthLimit)){
        const entry = TT.table[hash]
        if (entry.flag == "EXACT"){
            return entry.score
        }
    }

    let bestValue = Evaluation.evaluate(board)
    nodesExplored ++

    if (bestValue >= beta){
        return bestValue
    }
    
    alpha = Math.max(alpha, bestValue)

    //Genererer lovlege angrep
    let captureMoves = board.GenerateCaptures()
    captureMoves = MoveOrder(captureMoves)
    
    for (let move of captureMoves){
        board.Make_Move(move)
        let evaluation = - QuiesenceSearch(-beta, -alpha)
        board.Unmake_Move(move)

        if (evaluation >= beta){
            return beta
        }
        if (evaluation > bestValue){
            bestValue = evaluation
        }

        alpha = Math.max(alpha, evaluation)
    }

    return bestValue
}

function Search(depth, alpha, beta){
    
    //Generer lovlege trekk
    CheckIfStillSearching()
    if (! searching) return null
    nodesExplored ++

    const hash = board.zobrist.hash
   
    //transposition table
    if (TT.IsValidTransposition(hash, depth) && depth != originalDepth){
        const entry = TT.table[hash]
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
    const UnsortedlegalMoves = board.GenerateLegalMoves()
    
    //Ingen lovlege trekk, sjekk etter sjakkmatt / sjakk patt
    if (UnsortedlegalMoves.length == 0){    
        //Checkmate
        if (board.InCheck()){
            TT.AddPosition(hash, -checkMateScore, MaxDepthLimit, "EXACT")
            return - (checkMateScore + depth)

        }
        
        //Stalemate
        TT.AddPosition(hash, drawScore, MaxDepthLimit, "EXACT")
        return drawScore
    }

     // check for threefold repetition
    if (ChessHelper.checkForRepetitions(board.repetitionTable)) {
        //console.log("found threefold repetition in search")
        TT.AddPosition(hash, drawScore, MaxDepthLimit, "EXACT")
        return drawScore
    }

    
    //Evaluer når du har nådd maks søkedybde
    if (depth == 0){
        //const score = Evaluation.evaluate(board)
        return QuiesenceSearch(alpha, beta)
    } 
    
    // sorter trekk etter kor bra du GJETTAR at trekket er
    let legalMoves = MoveOrder(UnsortedlegalMoves)

    //Sørger for at det beste trekket vi har funne så langt blir utforska først
    if (depth == originalDepth && bestMoveSoFar != null) legalMoves.unshift(bestMoveSoFar)
    
        
    //Lagre beste poengsum og beste trekk
    const originalAlpha = alpha

    //Loop gjennom alle lovlege trekk
    for (let move of legalMoves){
        //Gjer trekket på brettet, finn poengsum, gjer om trekket
        board.Make_Move(move)
        const score = - Search(depth - 1, -beta, -alpha)
        board.Unmake_Move(move)
        
        //exit point
        if (! searching) return null
        
        //Om poengsummen er betre enn noko som er funne så langt så kan du lagre
        //beste trekk og poengsum
        if (alpha < score){
            alpha = score
            if (depth == originalDepth){
                bestMoveSoFar = move
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