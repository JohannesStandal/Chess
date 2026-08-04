import { Piece } from "../Core/Board/piece.js"
import { Move } from "../Core/Board/move.js";
import {GameLoop, gameData, chess, sounds } from "./index.js"

// main element containing the chessboard
var main = document.getElementById("main")

var boardElements;
var selecetedSquareIndex;
var previousMove;

export function Reset(){
    selecetedSquareIndex = null
    previousMove = null
}

export function FlipBoard(){
    gameData.fromWhitePerspective = !gameData.fromWhitePerspective
    RenderBoard(chess.board)
}

function RenderBoard(board, legalMoves=[]){
    //Byttar om på rekkene dersom du spelar frå svart perspektiv
    

    //Fjernar eksisterande brett
    boardElements = new Array(64)

    while (main.childElementCount != 0){
        main.removeChild(main.firstChild)
    }

    // potential move squares
    const moveTargets = legalMoves.map(move => {return Move.Target(move)})

    //Genererer nytt brett i HTML kode
    for (let rank = 7; 0 <= rank; rank--){
        for (let file = 0; file < 8; file++){
            // Create square element
            let e = document.createElement("div")
            e.classList.add("square")
            
            // Calculate color
            const defaultColor = ( (rank + file) % 2 == 0) ? "brown" : "white"
            e.classList.add(defaultColor)
            
            // Calculate squareIndex
            let index = rank*8+file
            
            if (! gameData.fromWhitePerspective){
                index = 63 - index
            }

            if (index == selecetedSquareIndex
            ){
                e.classList.add("yellow")
            }
            if (previousMove != null){
                if (index == previousMove.start ||
                    index == previousMove.target){
                        e.classList.add("yellow")
                }
            }
            if ( moveTargets.includes(index)){
                e.classList.add("blue")
            }
            
          
            e.innerHTML = String(index)

            // Render piece images
            let pieceType = board.square[index]
            if (pieceType != 0){
                //Teikn brikka in, med bruk av brikkenummer
                let img = document.createElement("img")
                img.src = Piece.Images[pieceType]
                e.appendChild(img)
            }
                

            //legger til elementet til brettet og lagrar elementet i eit array
            main.appendChild(e)
            boardElements[index] = e
        }
    }
    
    // add eventlisteners
    for (let i = 0; i < 64; i++){
        // square and potential moves
        const square = boardElements[i] 
        const movesToThisSquare = legalMoves.filter(move => Move.Target(move) == i)
        
        // add related event
        if (movesToThisSquare.length == 0){
            square.addEventListener("click", () => SelectPiece(i))
        }
        else if (movesToThisSquare.length == 1){
            square.addEventListener("click", () => Make_Move_On_Board(movesToThisSquare[0]))
        }
        else {
            square.addEventListener("click", () => Promotion(movesToThisSquare[0]))
        }
 
    }
}

function UpdateLegalMovesLookUp(){
    gameData.moveLookUpTable = new Array(64)
    for (let i = 0; i < 64; i++){
        gameData.moveLookUpTable[i] = []
    }

    chess.GenerateMoves().forEach(move =>{
        gameData.moveLookUpTable[Move.Start(move)].push(move)
    })
}

function AnimateMove(move){
    const start = Move.Start(move)
    const target = Move.Target(move)
    

    //Animasjon for flytting av brikker
    const startCoords = boardElements[start].getBoundingClientRect()
    const targetCoords = boardElements[target].getBoundingClientRect()
    
    const dx = targetCoords.x - startCoords.x
    const dy = targetCoords.y - startCoords.y
    
    let piece_IMG = boardElements[start].childNodes[0]
    piece_IMG.style = "top: " + String(dy) + "px; left: " + String(dx) + "px; z-index: 200;"
}

function Make_Move_On_Board(move){
    const start = Move.Start(move)
    const target = Move.Target(move)
    const flag = Move.Flag(move)

    const message = chess.board.white_To_Move ? "Move played by white: " : "Move played by black: "
    console.log("\n", message, Move.ToUCI(move), "\n")

    boardElements[start].classList.add("yellow")
    // update global scope variables
    previousMove = move
    selecetedSquareIndex = null

    // make move on viritual board 
    chess.makeMove(move)

    // animate default move
    AnimateMove(move)

    // animate rook move for castling
    if (flag == Move.flags.kingCastle){
        const rookMove = Move.EncodeUINT16(start + 3, start + 1, 0b0000)
        AnimateMove(rookMove)
    } 
    else if (flag == Move.flags.queenCastle){
        const rookMove = Move.EncodeUINT16(start - 4, start - 1, 0b0000)
        AnimateMove(rookMove)
    } 

    // update map for next move
    UpdateLegalMovesLookUp()

    // play sounds
    if (Move.IsCapture(move)){
        sounds.capture.play()
    }
    else {
        sounds.quietMove.play()
    }

    // wait for animation to finish
    setTimeout(()=>{
        // render new position
        RenderBoard(chess.board)
        // call back to game loop
        GameLoop()
    },180)
    
}

function UndoLastMove(){
    const previousMove = chess.board.playedMoves[chess.board.ply - 1]
    console.log(Move.ToUCI(previousMove))
    chess.unmakeMove(previousMove)

    UpdateLegalMovesLookUp()
    RenderBoard(chess.board)
}

function Promotion(move){
    // get promotion index
    const index = prompt("0: Queen 1: Rook 2: Knight 3: Bishop")

    const flags = [
        Move.flags.queenPromotion,
        Move.flags.rookPromotion,
        Move.flags.knightPromotion,
        Move.flags.bishopPromotion,
    ]
    // create correct promotion flag
    
    const start = Move.Start(move)
    const target = Move.Target(move)
    const oldFlag = Move.Flag(move)
    const flag = (oldFlag & 0b1100) | flags[index]

    // make the move on the board
    const promotionMove = Move.EncodeUINT16(start, target, flag)
    Make_Move_On_Board(promotionMove)
}

function SelectPiece(squareIndex){
    // disable if it is not a players turn
    if (!gameData.playerTurn) return
    
    // finds the legal moves from this square
    const legalMoves = gameData.moveLookUpTable[squareIndex]
    
    // if there are no legal moves, the selected square is invalid 
    selecetedSquareIndex = (legalMoves.length == 0) ? null : squareIndex
    RenderBoard(chess.board, legalMoves)
}

export { chess as board, gameData, RenderBoard, UpdateLegalMovesLookUp, AnimateMove, Make_Move_On_Board, UndoLastMove}