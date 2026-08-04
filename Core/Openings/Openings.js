// Import data
import { Board } from "../Board/chessboard.js";
import { Move } from "../Board/move.js";

import rawOpeningLines from "../Openings/rawLines.json" with { type: "json" };
import fs from "fs";


const openingBook = {}

const board = new Board()

for (const line of rawOpeningLines){
    board.Load_Fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    for (const UCImove of line){
        const hash = board.zobrist.hash
        const move = Move.UCItoUINT16(UCImove, board)
        addMoveToBook(hash, move)
        board.Make_Move(move)
    }
}
// write to JSON
fs.writeFileSync(
    "openingBook.json",
    JSON.stringify(openingBook, null, 2)
)

function addMoveToBook(hash, move){
    // Check if the entry already exists 
    const entry = openingBook[hash]
    
    // First time this position is seen
    if (entry == null){
        openingBook[hash] = []
        openingBook[hash].push([move, 1])
        return
    }

    // We have seen this positon before
    for (const variations of entry){
        // If we have seen this move before increment the counter
        if (variations[0] == move){
            variations[1] ++
            return
        }
    }
    // Add the move to the positon
    entry.push([move, 1])
}

