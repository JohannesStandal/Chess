import { Engine } from "../Core/Engine/Engine.js";
import { Move } from "../Core/Board/piece.js";

const engine = new Engine(1000)

self.onmessage = (e) => {
    const {type, fen} = e.data
    
    if (type === "SEARCH"){
        engine.SetPosition(fen)
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