// Import data
import { Board } from "../Board/chessboard.js";
import { Move } from "../Board/move.js";

import rawOpeningLines from "../Openings/rawLines.json" with { type: "json" };
import fs from "fs";

// Opening book dictionary
const openingBook = {}

// Loop through all raw openinglines
const board = new Board()
for (const line of rawOpeningLines){
    // Load startpos
    board.Load_Fen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    
    // Loop through opening line
    for (const UCImove of line){
        const hash = board.zobrist.hash
        const move = Move.UCItoUINT16(UCImove, board)
        addMoveToBook(hash, move)
        board.Make_Move(move)
    }
}

// Filter all entries 
for (const key of Object.keys(openingBook)){
    let entry = openingBook[key]
    filter(entry)    
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

function filter(entry){
    const maxVariations = 8  // Only store N most common variations
    const minFrequency = 0   // A move must have occured more than X times to be valid

    // console.log("sort", entry)
    const numVariations = entry.length

    // Sort the variaton from highest to lowest frequency
    for (let i = 0; i < numVariations; i++){
        for (let j = i + 1; j < numVariations; j++){
            const v1 = entry[i]
            const v2 = entry[j]

            const f1 = v1[1]
            const f2 = v2[1]

            // swap f1 and f2 in list so that the bigger one comes first
            if (f1 < f2){
                entry[i] = v2
                entry[j] = v1
            }
        }
    }

    // Remove all opening lines under the threshold
    while (entry[entry.length - 1][1] < minFrequency){
        entry.pop()
        if (entry.length == 0) break
    }

    // Only keep the first 8 moves
    while (maxVariations < entry.length){
        entry.pop()
    }
    

}

