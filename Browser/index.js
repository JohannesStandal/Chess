// UI and Website interactions
import { RenderScene, EndGame, Rematch} from "./App.js"
import { RenderBoard, UpdateLegalMovesLookUp, Make_Move_On_Board, FlipBoard, Reset, UndoLastMove} from "./UI.js"
import { ChessHelper } from "../Core/Utils/Chess_Helper.js"
import { Move } from "../Core/Board/move.js"
import { Evaluation } from "../Core/Engine/evaluation.js"
// Core logic for playing chess
import { Board } from "../Core/Board/chessboard.js"
import { Chess } from "../Browser/Chess.js"


// Testsuite availability
import { Tests } from "../Tests/Tests.js"
import { AttackDetector } from "../Core/MoveGeneration/Attack.js"

export const chess = new Chess()

export var gameData = {
    playAsWhite: true, //false betyr at AI speler
    playAsBlack: !false, // ^ --||--
    showSquareIndexes: false,
    playerTurn: false,
    active: false, 
    fromWhitePerspective: false,
    moveLookUpTable: null,
}


export const sounds = {
        quietMove: new Audio("Sounds/move-self.mp3"),
        capture: new Audio("Sounds/capture.mp3"),
        notification: new Audio("Sounds/notify.mp3"),
}

window.evaluate = Evaluation
const startPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
var rootPos = ""


function StartGame(fen = startPos){
    gameData.active = true

    RenderScene(1)
    Reset()
    
    //fjern gamle trekk
    gameData.playedMoves = []
    engine.postMessage({
        type: "RESET"
    })

    //lastar inn posisjon
    chess.loadFen(fen)
    UpdateLegalMovesLookUp()

    gameData.fromWhitePerspective = gameData.playAsWhite 
    RenderBoard(chess.board)
    GameLoop()
}

const tests = new Tests()

window.StartGame = StartGame
window.EndGame = EndGame
window.Rematch = Rematch
window.RenderScene = RenderScene
window.RenderBoard = RenderBoard
window.FlipBoard = FlipBoard
window.UndoLastMove = UndoLastMove
window.tests = tests
window.gameData = gameData

window.chess = chess

const engine = new Worker("./Engine.worker.js", {type: "module"})
engine.onmessage = (e) =>{
        if (! gameData.active) return
        const move = e.data.move
        console.log("Engine wants to play the move:", Move.ToUCI(move))
        Make_Move_On_Board(move)
    }
window.engine = engine
tests.board = chess.board




export function GameLoop(){

    const gameOver = (chess.GenerateMoves().length == 0)
    const check = chess.InCheck()

    console.log(chess.board.hash)

    if (gameOver){
        let message = ""
        sounds.notification.play()
        if (check){
            const winner = (chess.white_To_Move) ? "Svart" : "Kvit"
            message = winner + " vant ved sjakkmatt!"
        }
        else {
            message = "Uavgjort ved sjakk patt"
        }

        EndGame(message)
        gameData.active = false
        return
    }
    else if (chess.Threefold()){
        let message = "Uavgjort ved repetisjon"
        EndGame(message)
        return
    }
    
    
    gameData.playerTurn = (gameData.playAsWhite && chess.board.white_To_Move) || (gameData.playAsBlack && ! chess.board.white_To_Move) 
   
    if (gameData.playerTurn){
        
    }
    else {
        setTimeout(()=>{
            engine.postMessage({
                type: "SEARCH",
                fen: chess.startFen,
                moves: chess.playedMoves,
            })
        },300)
    }
}

StartGame()
//StartGame("6q1/3k1P2/8/8/7p/8/1p4P1/R3K2R w KQ - 0 1")
//StartGame("r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1")
//StartGame("8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1")



/**
 * Positions:
 * startpos: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 * test: "5b2/1k1n4/2pp4/1p3R2/3n4/8/5Q2/2K5 w - - 0 1"
 * Sliding moves test: "kqr5/4b3/2b5/8/6B1/2B5/8/5RQK b - - 0 1"
 * Pawn structure test: "2k5/p7/2pPpp2/4p3/PP6/1P3PpP/8/5K2 w - - 0 1"
 *
 * Basic Endgames:
 *  - queen vs king: "8/6q2/6k1/8/2K5/8/8/8 b - - 0 1"
 *  - 2 rook vs king: "8/3K4/8/8/8/3k4/3r4/3r4 b - - 0 1"
 *  - 1 rook vs king: "8/3K4/8/8/8/3k4/8/3r4 b - - 0 1"
 *  - two knights vs king: "8/3K4/8/8/8/3k4/3n4/3n4 b - - 0 1"
 *  - two bishops vs king: "8/3K4/8/8/8/3k4/3b4/3b4 b - - 0 1"
 *  - knigth + bishop vs king: "8/3K4/8/8/8/3k4/3b4/3n4 b - - 0 1"
 *  - simple pawn promote: "8/8/8/8/8/3pk3/8/3K4 b - - 0 1"
 * 
 * Endgames:
 *  - knight underpromotion: "8/8/8/7k/6p1/5pQ1/3R1p1K/6N1 b - - 0 1"
 *  - sacrifice bishop for promotion: "8/2B2kbp/6p1/5p2/8/1pP4P/1P3PP1/6K1 b - - 0 1"
 *  - Stop pawn promotion with queen: "8/3KP3/8/8/8/2q5/4k3/8 b - - 0 1"
 *  - Pawn lock: "8/k7/3p4/p2P1p2/P2P1P2/8/8/K7 w - - 0 1"
 *
 */
//StartGame("8/k7/3p4/p2P1p2/P2P1P2/8/8/K7 w - - 0 1")



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