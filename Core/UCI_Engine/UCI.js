import readline from "readline";
import {Engine} from "../../Core/Engine/Engine.js"
import { Move } from "../Board/piece.js";

export class UCI {
  constructor() {
    this.engine = new Engine(1000);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.rl.on("line", (line) => {
      this.handleCommand(line.trim());
    });
  }

  handleCommand(cmd) {
    if (cmd === "") return;
    const parts = cmd.split(" ")

    if (parts[0] === "uci") {
      this.send("id name PrebenV1");
      this.send("id author Johanens Husevåg Standal");
      this.send("uciok");
      return;
    }

    if (parts[0] === "isready") {
      this.send("readyok");
      return;
    }

    if (parts[0] === "ucinewgame") {
      this.engine.Reset();
      return;
    }

    if (parts[0].startsWith("position")) {
      this.handlePosition(parts);
      return;
    }

    if (parts[0].startsWith("go")) {
      const bestMove = this.engine.Bestmove().CoordinatesNotation();
      
      this.send(`bestmove ${bestMove}`);
      return;
    }

    if (parts[0] === "quit") {
      process.exit(0);
    }
  }

  handlePosition(parts){
    if (parts[1] == "startpos"){
      this.engine.SetPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    }
    else if (parts[1] == "fen"){
      let fen = ""
      // construct fenstring
      parts.slice(2, 8).forEach(part => {
        fen += part + " "
      });
      console.log(fen)
      this.engine.SetPosition(fen)
    }
    // moves
    if (parts[8] == "moves"){
      const UCIMoves = parts.slice(9, parts.length)
      const moves = UCIMoves.map(UCImove => { return decodeMoves(UCImove, this.engine.board)})
      console.log(moves)
      this.engine.MakeMoves(moves)
    }
  }

  send(msg) {
    process.stdout.write(msg + "\n");
  }
}

function decodeMoves(UCIMove, board){
  const parts = UCIMove.split("")

  const letterToNumber = {
    "a": 0,
    "b": 1,
    "c": 2,
    "d": 3,
    "e": 4,
    "f": 5,
    "g": 6,
    "h": 7,
  }

  const start = letterToNumber[parts[0]] + (parseInt(parts[1]) - 1)* 8
  const target = letterToNumber[parts[2]] + (parseInt(parts[3]) - 1) * 8 

  let flag = 0b0000
  if (board.square[target] != 0){
    flag += 0b0100
  }
  
  if (parts.length == 5){
    const letterToFlag = {
      "n": Move.flags.knightPromotion,
      "b": Move.flags.bishopPromotion,
      "r": Move.flags.rookPromotion,
      "q": Move.flags.queenPromotion,
    }

    flag += letterToFlag[parts[5]]
  }

  return new Move(start, target, flag)
}

new UCI()