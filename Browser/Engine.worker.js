import { Engine } from "../Core/Engine/Engine.js";

console.log("Initializing Engine")
const engine = new Engine(1000)

self.onmessage = (e) => {
    const {type, fen, moves} = e.data
    
    if (type === "SEARCH"){
        // Reconstruct position
        engine.SetPosition(fen)
        engine.PlayedMoves(moves)

        // Calculate best move
        const move = engine.Bestmove()
        self.postMessage({move})
    }

    if (type === "PVS"){
        // Reconstruct position
        engine.SetPosition(fen)
        engine.PlayedMoves(moves)

        // Log the PVS
        engine.PVS()
    }

    if (type === "STOP"){
        engine.Stop()
    }

    if (type === "RESET"){
        engine.Reset()
    }

    
}