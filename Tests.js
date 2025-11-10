import { board } from "./UI"

function MoveGenerationCount(depth){
    if (depth == 0) return 1
    
    let sum = 0

    const moves = board.GenerateMoves()
    moves.forEach(move=>{
        board.Make_Move(move)
        sum += MoveGenerationCount(depth-1)
        board.Unmake_Move(move)
    })
    return sum
}

function CaptureGenerationCount(){
    
    let sum = 0
    
    const moves = board.GenerateCaptures()
    if (moves.length == 0) return 1
    moves.forEach(move=>{
        board.Make_Move(move)
        sum += CaptureGenerationCount()
        board.Unmake_Move(move)
    })

    return sum - 1
}

function performanceTest(nodeStart, nodeDepth){
    for (let i = nodeStart; i < nodeDepth; i++){
        let startTime = performance.now()
        let n = MoveGenerationTest(i)
        let endTime = performance.now()
        console.log(i, n, (endTime-startTime).toFixed(2) + "ms")
    }
}

function testMoveGenerationTime(){
    const t1 = performance.now()
    board.GenerateMoves()
    const t2 = performance.now()
    console.log((t2-t1).toFixed(5) + "ms")
}

function testFunctionTime(f){
    const t1 = performance.now()
    
    f()
    const t2 = performance.now()
    console.log((t2-t1).toFixed(5) + "ms")
}
//performanceTest(0,6)

// const testTable = [BigInt(2954), BigInt(135), BigInt(145), BigInt(1), BigInt(1)]//, BigInt(1)]
// console.log(ChessHelper.checkForRepetitions(testTable))`
