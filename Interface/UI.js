import { Piece, Move } from "../Core/Board/piece.js"


import {GameLoop, gameData, board, sounds } from "./index.js"

// main element containing the chessboard
var main = document.getElementById("main")

var boardElements;
var selecetedSquareIndex;
var previousMove;

function RenderBoard(board, legalMoves=[]){
    //Byttar om på rekkene dersom du spelar frå svart perspektiv
    const rankStart = gameData.fromWhitePerspective ? 7 : 0
    const rankStop =  gameData.fromWhitePerspective ? 0 : 7
    const increment = gameData.fromWhitePerspective ? -1 : 1

    let rank = rankStart

    //Fjernar eksisterande brett
    boardElements = new Array(64)

    while (main.childElementCount != 0){
        main.removeChild(main.firstChild)
    }

    // potential move squares
    const moveTargets = legalMoves.map(move => {return move.target})

    //Genererer nytt brett i HTML kode
    while (true){
        for (let file = 0; file < 8; file++){
            // Create square element
            let e = document.createElement("div")
            e.classList.add("square")
            
            // Calculate color
            let color = ( (rank + file) % 2 == 0) ? "brown" : "white"
            
            // Calculate squareIndex
            let index = rank*8+file
            
            if (gameData.fromWhitePerspective){
                index = 63 - index
            }

            if (index == selecetedSquareIndex){
                color = "yellow"
            }
            else if ( moveTargets.includes(index)){
                color = "blue"
            }
            
            // color square
            e.classList.add(color)
            //e.innerHTML = String(index)

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

        if (rank == rankStop){
            break
        }
        rank += increment
    }
    
    // add eventlisteners
    for (let i = 0; i < 64; i++){
        // square and potential moves
        const square = boardElements[i] 
        const movesToThisSquare = legalMoves.filter(move => move.target == i)
        
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

    board.GenerateLegalMoves().forEach(move =>{
        gameData.moveLookUpTable[move.start].push(move)
    })
}

function AnimateMove(move){
    //Animasjon for flytting av brikker
    const startCoords = boardElements[move.start].getBoundingClientRect()
    const targetCoords = boardElements[move.target].getBoundingClientRect()
    
    const dx = targetCoords.x - startCoords.x
    const dy = targetCoords.y - startCoords.y
    
    let piece_IMG = boardElements[move.start].childNodes[0]
    piece_IMG.style = "top: " + String(dy) + "px; left: " + String(dx) + "px; z-index: 200;"
}

function Make_Move_On_Board(move){ 
    // update global scope variables
    previousMove = move
    selecetedSquareIndex = null

    // make move on viritual board 
    board.Make_Move(move)

    // animate default move
    AnimateMove(move)

    // animate rook move for castling
    if (move.flag == Move.flags.kingCastle){
        const rookMove = new Move (move.start + 3, move.start + 1, 0b0000)
        AnimateMove(rookMove)
    } 
    else if (move.flag == Move.flags.queenCastle){
        const rookMove = new Move (move.start - 4, move.start - 1, 0b0000)
        AnimateMove(rookMove)
    } 

    // update map for next move
    UpdateLegalMovesLookUp()

    // play sounds
    if ((move.flag >> 2  & 1) == 1){
        sounds.capture.play()
    }
    else {
        sounds.quietMove.play()
    }

    // wait for animation to finish
    setTimeout(()=>{
        // render new position
        RenderBoard(board)
        // call back to game loop
        GameLoop()
    },180)
    
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
    move.flag = (move.flags & 0b1100) | flags[index]

    // make the move on the board
    Make_Move_On_Board(move)
}

function SelectPiece(squareIndex){
    // disable if it is not a players turn
    if (!gameData.playerTurn) return
    
    // finds the legal moves from this square
    const legalMoves = gameData.moveLookUpTable[squareIndex]
    
    // if there are no legal moves, the selected square is invalid 
    selecetedSquareIndex = (legalMoves.length == 0) ? null : squareIndex
    RenderBoard(board, legalMoves)
}

export { board, gameData, RenderBoard, UpdateLegalMovesLookUp, AnimateMove, Make_Move_On_Board}