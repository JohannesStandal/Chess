import { Engine } from "../Core/Engine/Engine.js";

console.log("Initializing Engine")
const engine = new Engine(1000)

self.onmessage = (e) => {
    const {type, fen, repetitionTable} = e.data
    console.log("lets go")
    
    if (type === "SEARCH"){
        engine.SetPosition(fen)
        engine.ImportGameHistory(repetitionTable)
        const move = engine.Bestmove()
        self.postMessage({move})
    }
    if (type === "STOP"){
        engine.Stop()
    }

    if (type === "RESET"){
        engine.Reset()
    }
}