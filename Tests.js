export class Tests {
    constructor(board) {
        this.board = board
    }

    MoveGenerationCount(depth, log_moves = false){
        // Counting reachable positions after n moves
        if (depth == 0) return 1
        
        let sum = 0
    
        const moves = this.board.GenerateLegalMoves()

        moves.forEach(move=>{
            this.board.Make_Move(move)
            sum += this.MoveGenerationCount(depth-1, log_moves)
            this.board.Unmake_Move(move)
        })

        if (log_moves && this.board.moves.length == 1){
            console.log(this.board.moves[0], sum)
        }

        return sum
    }

    perft(depth){
        // a debugger tool for locating the bugs in movegeneration
        // results can be compared with stockfish to find out wich moves lead to the wrong results
        let startTime = performance.now()
        let nodes = this.MoveGenerationCount(depth, true)
        let endTime = performance.now()
        console.log(`Total nodes: ${nodes}. Finished in ${endTime-startTime}ms`)
    }

    moveGeneration_full_suite(depth = 4){
        // A test for catching bugs in the movegeneration 

        depth = Math.min(4, depth)
        let startTime = performance.now()
        // positions and results fetched from: https://www.chessprogramming.org/Perft_Results
        const test_positions = [
            { // start position
                fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 
                num_pos: [20, 400, 8902, 197281]
            },
            { // position 2
                fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -", 
                num_pos: [48, 2039, 97862, 4085603]
            },
            { // position 3
                fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1 ", 
                num_pos: [14, 191, 2812, 43238]
            },
            { // position 4
                fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 
                num_pos: [6, 264, 9467, 422333]
            },
            { // position 5
                fen: "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8  ", 
                num_pos: [44, 1486, 62379, 2103487]
            },
            { // position 6
                fen: "r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10   ", 
                num_pos: [46, 2079, 89890, 3894594]
            },
        ]

        for (let test_position of test_positions){
            // load the fen from the test suite
            
            console.log("\nNew test position:")
            console.log(test_position.fen)
            this.board.Load_Fen(test_position.fen)
            
            for (let i = 0; i < depth; i++){
                // compare nodecount with expected results
                let nodes = this.MoveGenerationCount(i+1)
                let results = (nodes == test_position.num_pos[i]) ? " ✅ " : " ❌ "

                console.log(`Depth: ${i+1}, Expected: ${test_position.num_pos[i]}, Result: ${nodes}, ${results} `)
            }
        }
        let endTime = performance.now()

        console.log(`\nTests finished in ${Math.round(endTime - startTime)}ms\n`)
    }
    
    testMoveGenerationTime(){
        const t1 = performance.now()
        this.board.GenerateMoves()
        const t2 = performance.now()
        console.log((t2-t1).toFixed(5) + "ms")
    }
}
