import { Engine } from "../Core/Engine/Engine.js";

const engine = new Engine(1000)

self.onmessage = (e) => {
    const {type, fen, playedMoves} = e.data
    console.log(playedMoves)
    console.log("lets go")
    
    if (type === "SEARCH"){
        engine.SetPosition(fen)
        engine.ImportMoveHistory(playedMoves)
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