import { Board } from "../Board/chessboard.js";
import openigns from "../Openings/openingBook.json" with { type: "json" };

export class openingBook {
    static bookMove(hash){
        const key = String(hash)
        const entry = openigns[key]

        if (entry == null) return 0 // a1a1 = null move

        const move = this.chooseMove(entry)
        return move
    }

    static chooseMove(entry){
        // Input an entry in 2d array form in the format ( [move, frequency] -> [move, frequency])
        // The function shall return a move weighed by the distribution of the frequencies
        let sum = 0
        let lookUp = []

        // Frequency   |         110             |   20   |      100       |
        //             |                         |        |                |  
        // lookUp      |         110             |  130   |      230       |  
        //             |                   ^     |        |                |  
        // Threshold---|-------------------/     |        |                |  
        // gives       |                         |        |                |  
        // move 1      |       move1             | move2  |      move3     |  
        
        
        // Accumulate all frequencies in a table
        for (const variation of entry){
            sum += variation[1]
            const accumulatedFrequency = sum
            lookUp.push(accumulatedFrequency)
        }


        
        // Select a move along the line
        const threshold = Math.round( Math.random() * sum )
        
        // Iterate over eve
        for (let i = 0; i < lookUp.length; i++){
            const value = lookUp[i]
            if (threshold <= value){
                const move = entry[i][0]
                return move
            }
        }
    }
}