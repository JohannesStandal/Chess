var main = document.getElementById("main")
var boardElements = new Array(64)

const board = new Board
var gameData = {
    playAsWhite: true, //false betyr at AI speler
    playAsBlack: false, // ^ --||--
    playerTurn: false,
    playedMoves: [],    //for å lagre alle trekk som har blitt spelt
    fromWhitePerspective: true,
    moveLookUpTable: null,
}

function RenderBoard(board){
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

    //Genererer nytt brett i HTML kode
    while (true){
        for (let file = 0; file < 8; file++){
            //lagar element for rute
            let e = document.createElement("div")
            
            //regne ut farge
            let color = ( (rank + file) % 2 == 0) ? "white" : "brown"
            let index = rank*8+file

            //legger til css for ruteform, farge, og klikkefunksjon
            e.classList.add("square")
            e.classList.add(color)
            e.addEventListener("click", () => Click(index))

            //Finn brikkenummeret for den ruta. 0 = inga brikke
            pieceType = board.square[index]
            if (pieceType != 0){
                //Teikn brikka in, med bruk av brikkenummer
                img = document.createElement("img")
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
    piece_IMG.style = "top: " + String(dy) + "px; left: " + String(dx) + "px; z-inex: 200;"

}

var promo = false
function Make_Move_On_Board(move){
    if (promo) return
    //console.log(Move.AlgebraicNotation(board, move))
    
    board.Make_Move(move)
    AnimateMove(move)
    if (move.flag == Move.flags.kingCastle){
        let extraMove = new Move (move.start + 3, move.start + 1, 0b0000)
        AnimateMove(extraMove)
    } 
    else if (move.flag == Move.flags.queenCastle){
        let extraMove = new Move (move.start - 4, move.start - 1, 0b0000)
        AnimateMove(extraMove)
    } 
    //promotion
    else if ((move.flag >> 3) == 1 && gameData.playerTurn){
        let choice = parseInt(prompt("1: knight, 2: bishop, 3: rook, 4: queen", 0))
        promo = true

        const color = (! board.white_To_Move) ? Piece.white : Piece.black
        const type = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen][choice-1]
        board.square[move.target] = color | type
        
    }

    UpdateLegalMovesLookUp()
    if ((move.flag >> 2  & 1) == 1){
        Piece.Sounds.capture.play()
    }
    else {
        Piece.Sounds.quietMove.play()
    }

    setTimeout(()=>{
        RenderBoard(board)
        //console.log(board.repetitionTable)
        GameLoop()
    },180)
    
}

function Click(squareIndex){
    if (!gameData.playerTurn) return
    RenderBoard(board)
    boardElements[squareIndex].classList.add("yellow")
    const legalMoves = gameData.moveLookUpTable[squareIndex]
    //Sjekker om denne ruta har ei vennleg brikke
    if (legalMoves.length == 0) return
    
    
    legalMoves.forEach(move =>{
        const squareElement = boardElements[move.target]
        squareElement.classList.add("blue")
        squareElement.addEventListener("click", () => Make_Move_On_Board(move))
    })
}

