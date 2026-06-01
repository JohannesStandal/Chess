const readline = require('readline');
const { Engine } = require('../../Core/Engine/Engine.js');
const { Move } = require('../../Core/Board/move.js');
const { Piece } = require('../../Core/Board/piece.js');

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
      this.handleGo(parts)
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

  handleGo(parts){
    const moveTimeIndex = parts.indexOf("movetime")
    const whiteTimeIndex = parts.indexOf("wtime")
    const blackTimeIndex = parts.indexOf("btime")
    
    
    if (0 <= moveTimeIndex){
      const thinkingTime = parseInt(parts[moveTimeIndex + 1])
      this.engine.ThinkingTime(thinkingTime)
    }
    else {
      // find white and black time remaining
      let wTime = 10000
      let bTime = 10000
  
      if (0 <= whiteTimeIndex){
        wTime = parseInt(parts[whiteTimeIndex + 1])
      }
      if (0 <= blackTimeIndex){
        bTime = parseInt(parts[blackTimeIndex + 1])
      }
      
      const myTimeLeft = (this.engine.board.white_To_Move) ? wTime : bTime

      const minTime = 100
      const maxTime = 2000

      const desiredTime = myTimeLeft / 30
      const thinkingTime = Math.min( Math.max(minTime, desiredTime), maxTime)

      this.engine.ThinkingTime(thinkingTime)
    }

    const bestMove = Move.ToUCI(this.engine.Bestmove())
      
    this.send(`bestmove ${bestMove}`);
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
  
  const movedPiece = board.square[start]
  const capturedPiece = board.square[target]

  let flag = 0b0000
  if (capturedPiece != 0){
    flag |= Move.flags.captures
  }

  const isPawn = Piece.IsType(movedPiece, Piece.pawn)
  const doublePush = (Math.abs(start - target) == 16)
  if (isPawn && doublePush){
    flag = Move.doublePush
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
  if (target == board.enPassantSquare) flag = Move.flags.enPassant

  return Move.EncodeUINT16(start, target, flag)
}

new UCI()