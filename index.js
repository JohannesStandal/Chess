import { RenderScene, EndGame, Rematch} from "./App.js"
import { gameData, board, RenderBoard, UpdateLegalMovesLookUp, Make_Move_On_Board } from "./UI.js"
import { ChessHelper } from "./Chess_Helper.js"

import { ChessEngine } from "./Chess_Engine.js"
import { Piece } from "./piece.js"
import { Tests } from "./Tests.js"

function StartGame(startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"){
    RenderScene(1)
    
    //fjern gamle trekk
    gameData.playedMoves = []
    //lastar inn posisjon
    board.Load_Fen(startFen)
    UpdateLegalMovesLookUp()
    //Genererer eit nytt brett fra eit perspektiv
    /*
    | w | b | p |
    |---|---|---|
    | 0 | 0 | 1 |
    | 0 | 1 | 0 |
    | 1 | 0 | 1 |
    | 1 | 1 | ? |
    |---|---|---|
    
    Generer fra ! svart perspektiv
    */
   gameData.fromWhitePerspective = gameData.playAsWhite 
   RenderBoard(board)
   GameLoop()
}

window.StartGame = StartGame
window.EndGame = EndGame
window.Rematch = Rematch
window.RenderScene = RenderScene
//startpos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//test = "5b2/1k1n4/2pp4/1p3R2/3n4/8/5Q2/2K5 w - - 0 1"
//Sliding moves test = "kqr5/4b3/2b5/8/6B1/2B5/8/5RQK b - - 0 1"

var promo;
const tests = new Tests(board)
window.tests = tests

export function GameLoop(){
    promo = false
    const gameOver = (board.GenerateLegalMoves().length == 0)
    const threefoldRepetition = ChessHelper.checkForRepetitions(board.repetitionTable)
    const check = board.InCheck(board.white_To_Move)
    if (check){
        console.log("Check")
    }

    if (gameOver){
        let message = ""
        Piece.Sounds.notification.play()
        if (check){
            const winner = (board.white_To_Move) ? "Svart" : "Kvit"
            message = winner + " vant ved sjakkmatt!"
        }
        else {
            message = "Uavgjort ved sjakk patt"
        }

        EndGame(message)
        return
    }
    else if (threefoldRepetition){
        let message = "Uavgjort ved repetisjon"
        EndGame(message)
        return
    }
    
    
    gameData.playerTurn = (gameData.playAsWhite && board.white_To_Move) || (gameData.playAsBlack && ! board.white_To_Move) 
   
    if (gameData.playerTurn){
        
    }
    else {
        setTimeout(()=>{
            let engine_move = ChessEngine()
            Make_Move_On_Board(engine_move)
        },300)
    }
}


//StartGame("8/2B2kbp/6p1/5p2/8/1pP4P/1P3PP1/6K1 b - - 0 1")

/**
 * Endgames
 *  - knight underpromotion: "8/8/8/7k/6p1/5pQ1/3R1p1K/6N1 b - - 0 1"
 *  - sacrifice bishop for promotion: "8/2B2kbp/6p1/5p2/8/1pP4P/1P3PP1/6K1 b - - 0 1"
 *  - Stop pawn promotion with queen: "8/3KP3/8/8/8/2q5/4k3/8 b - - 0 1"
 */
//StartGame("8/3KP3/8/8/8/2q5/4k3/8 b - - 0 1")



// fork test = "8/4q1p1/3k4/2p5/R2N3P/P4B2/3K3p/8 w - - 0 1"
// mate test 

//StartGame()

//performanceTest(0,5)
/**

 - Med lovleg trekk filter
 0 1 '0.10ms'
Tests.js:21 1 48 '2.60ms'
Tests.js:21 2 2039 '38.70ms'
Tests.js:21 3 97862 '1209.40ms'
Tests.js:21 4 4085603 '47810.10ms'

. Pseudolovlege trekk
0 1 '0.20ms'
Tests.js:21 1 48 '0.70ms'
Tests.js:21 2 2044 '15.90ms'
Tests.js:21 3 98515 '467.10ms'
Tests.js:21 4 4174973 '16596.10ms'
 */

/*
Projektliste / ting om må fikast

Flytting av brikker
//- Fikse flag for quiet og capture moves for alle brikker
- Fikse meny og logikk for at spelar forfremmer ein bonde
//- Rokade

Spel logikk

// - Fikse sjekk for sjakkmatt
- Fikse uavgjort ved 
//    - Stalemate
    - 50 move clock
    - threefold repetition
    - når det ikkje er nok brikker

UI 
- Meny
    - Valg av farge
    - Motstandarvalg (menneske vs ai, ai vs ai... etc)
    - Importere Fen
    - Start spel

- Avsluttningsmeny
    - Display for kven om vant etc
    - Ny runde / Avslutt
    - Animasjon kanskje ?


AI
 - Sjå ai liste
*/