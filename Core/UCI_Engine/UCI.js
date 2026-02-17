const readline = require('readline');
const { Engine } = require('../../Core/Engine/Engine.js');
const { Move } = require('../Board/piece.js');

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
    const firstWord = parts[0]

    // handshake communication
    if (firstWord === "uci") {
      this.send("id name PrebenV1");
      this.send("id author Johanens Husevåg Standal");
      this.send("uciok");
      return;
    }

    if (firstWord === "isready") {
      this.send("readyok");
      return;
    }

    if (firstWord === "ucinewgame") {
      this.engine.Reset();
      return;
    }

    // set up position
    if (firstWord === "position") {
      this.handlePosition(parts);
      return;
    }

    // run the engine
    if (firstWord === "go") {
      const bestMove = this.engine.Bestmove().CoordinatesNotation();
      
      this.send(`bestmove ${bestMove}`);
      return;
    }
    
    if (firstWord === "stop"){
      this.engine.Stop()
    }
    // quit
    if (firstWord === "quit") {
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
      this.engine.SetPosition(fen)
    }
    // moves
    const movesIndex = parts.indexOf("moves")
    if (0 <= movesIndex){
      // fetch the list of UCI moves and make them on the board
      const UCIMoves = parts.slice(movesIndex + 1, parts.length)
      for (const UCImove of UCIMoves){
        const move = decodeMove(UCImove, this.engine.board)
        this.engine.board.Make_Move(move)
      }
    }
  }

  send(msg) {
    process.stdout.write(msg + "\n");
  }
}

function decodeMove(UCIMove, board){
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

    flag += letterToFlag[parts[4]]
  }

  if (UCIMove == "e1g1" || UCIMove == "e8g8") flag = Move.flags.kingCastle
  if (UCIMove == "e1c1" || UCIMove == "e8c8") flag = Move.flags.queenCastle

  return new Move(start, target, flag)
}

new UCI()