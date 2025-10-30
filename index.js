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

//startpos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
//test = "5b2/1k1n4/2pp4/1p3R2/3n4/8/5Q2/2K5 w - - 0 1"
//Sliding moves test = "kqr5/4b3/2b5/8/6B1/2B5/8/5RQK b - - 0 1"


function GameLoop(){
    promo = false
    const gameOver = (board.GenerateLegalMoves().length == 0)
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
    
    
    gameData.playerTurn = (gameData.playAsWhite && board.white_To_Move) || (gameData.playAsBlack && ! board.white_To_Move) 
   
    if (gameData.playerTurn){
        
    }
    else {
        setTimeout(()=>{
            ChessEngine()
        },300)
    }
}


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