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


//Søkedybde i PLY
const MaxDepthLimit = 10
const thinkingTime = 1000

var orginalDepth; 
var bestMoveSoFar;

var startTime = 0
var elapsedTime = 0
var searching = false

const checkMateScore = 10000000
var posEvaled = 0
var TT = new Transposition_Table()

function CheckIfStillSearching(){
    elapsedTime = performance.now() - startTime
    searching = (thinkingTime > elapsedTime)
    //console.log(elapsedTime, searching)
}

function ChessEngine(){
    console.log("")
    console.log("New search")
    
    bestMoveSoFar = null
    startTime = performance.now() 

    let move = null
    
    //iterativ søkedybde
    for (let i = 1; i < MaxDepthLimit; i++){
        board.moves = []
        posEvaled = 0
        orginalDepth = i
        console.log("")
        console.log("Search Depth:", orginalDepth)
        //const searchStartTime = performance.now()
        bestMoveSoFar = Search(orginalDepth, -Infinity, Infinity)
        //const searchEndTime = performance.now()
        //const searchTime = searchEndTime - searchStartTime
        
        if (searching){
            move = bestMoveSoFar
        }
        else {
            console.log("Search canceled due to time limit")
            break
        }
        
        console.log(move)
    }
      
    if (move == null) move = board.GenerateLegalMoves()[0]
    console.log(Move.CoordinatesNotation(move), posEvaled, orginalDepth-1)
    Make_Move_On_Board(move)
}

function MVV_LVA_ordering(move){
    //Most valuable victim - Least valuable attacker 
    //Prioritises moves where a low value piece captures a high value piece

    let pieceTypeMoved = board.square[move.start] & 0b0111 
    let pieceTypeAttacked = board.square[move.target] & 0b0111

    return Piece.pieceValues[pieceTypeAttacked] - Piece.pieceValues[pieceTypeMoved]
}

function MoveOrder(moves){
    let moveScore = []

    moves.forEach(move => {
        moveScore.push(MVV_LVA_ordering(move))
    })
    //  Sortering gjort av chatgpt
    // Trinn 1: Kombiner begge listene som par
    let combined = moves.map((_, i) => [moves[i], moveScore[i]]);

    // Trinn 2: Sorter parene basert på første element (arr1)
    combined.sort((a, b) => (a[0] > b[0]) ? 1 : 1);

    // Trinn 3: Del opp igjen i to separate arrays
    sortedMoves = combined.map(pair => pair[0]);

    return sortedMoves
}

function QuiesenceSearch(alpha, beta){
    // Genererer bare trekk som er angrep heilt til ingen brikker kan bli kapra lenger.
    // https://www.chessprogramming.org/Quiescence_Search
    
    CheckIfStillSearching()
    if (! searching) return 0

    let bestValue = Evaluation.evaluate(board)

    if (bestValue >= beta){
        return bestValue
    }
    
    alpha = Math.max(alpha, bestValue)

    //Genererer lovlege angrep
    let captureMoves = board.GenerateCaptures()
    captureMoves = MoveOrder(captureMoves)
    
    for (let move of captureMoves){
        board.Make_Move(move)
        evaluation = - QuiesenceSearch(-beta, -alpha)
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
    if (! searching) return 0
    
    //sjekk repetisjonar
    if (ChessHelper.checkForRepetitions(board.repetitionTable)) {
        console.log("found threefold repetition in search")
        return 0
    }

    //transposition table
    if (TT.IsValidTransposition(board.zobrist.hash)){
        return TT.GetScore(board.zobrist.hash)
    }
    // utan: 1893
    // med: 2234 (nådde dybde på 5)
    

    

    // generer trekk
    const UnsortedlegalMoves = board.GenerateLegalMoves()
    
    //Ingen lovlege trekk, sjekk etter sjakkmatt / sjakk patt
    if (UnsortedlegalMoves.length == 0){    
        //Checkmate
        if (board.InCheck()){
            console.log("Checkmate Found", orginalDepth - depth, "ply")
            console.log(board.moves)
            return - (checkMateScore + depth)
        }
        
        //Stalemate
        return 0
    }

    // sorter trekk etter kor bra du GJETTAR at trekket er
    let legalMoves = MoveOrder(UnsortedlegalMoves)

    //Evaluer når du har nådd maks søkedybde
    if (depth == 0){
        //const score = Evaluation.evaluate(board)
        return QuiesenceSearch(alpha, beta)
    } 
    
    //Lagre beste poengsum og beste trekk
    let bestMove = null
    
    //Sørger for at det beste trekket vi har funne så langt blir utforska først
    if (depth == orginalDepth && bestMoveSoFar != null) legalMoves.unshift(bestMoveSoFar)

    //Loop gjennom alle lovlege trekk
    for (let move of legalMoves){
        //Gjer trekket på brettet, finn poengsum, gjer om trekket
        board.Make_Move(move)
        let evaluation = - Search(depth - 1, -beta, -alpha)
        board.Unmake_Move(move)
        
        if (beta <= evaluation){
            return beta     
        }
        
        //Om poengsummen er betre enn noko som er funne så langt så kan du lagre
        //beste trekk og poengsum
        if (alpha < evaluation){
            alpha = evaluation
            if (depth == orginalDepth){
                bestMove = move
            } 
        }
    }
    
    if (depth == orginalDepth){
        return bestMove
    }

    TT.AddPosition(board.zobrist.hash, alpha, depth)

    return alpha
}