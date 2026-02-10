import { Engine } from "../Core/Engine/Engine.js";
import { Move } from "../Core/Board/piece.js";

const engine = new Engine(3000)

self.onmessage = (e) => {
    const {type, fen, moves} = e.data
    
    if (type === "SEARCH"){
        const moveObjects = moves.map(move => new Move(
            move.start,
            move.target,
            move.flag
        ))
        const move = engine.Bestmove(fen, moveObjects)
        self.postMessage({move})
    }
    if (type === "STOP"){
        engine.Stop()
    }
}