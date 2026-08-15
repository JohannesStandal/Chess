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
    if (cmd === "") return

    const parts = cmd.split(" ")
    const firstWord = parts[0]

    // handshake communication
    if (firstWord === "uci") {
      this.send("id name PrebenV5")
      this.send("id author Johannes Husevåg Standal")
      this.send("uciok")
      return;
    }

    if (firstWord === "isready") {
      this.send("readyok")
      return
    }

    if (firstWord === "ucinewgame") {
      this.engine.Reset()
      return
    }

    // set up position
    if (firstWord === "position") {
      this.handlePosition(parts)
      return
    }

    // Display the position
    if (firstWord === "d"){
      this.display()
      return
    }

    // run the engine
    if (firstWord === "go") {
      this.handleGo(parts)
      return
    }
    
    if (firstWord === "stop"){
      this.engine.Stop()
    }
    // quit
    if (firstWord === "quit") {
      process.exit(0)
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
        const move = Move.UCItoUINT16(UCImove, this.engine.board)
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

  display(){ 
      const characterBoard = new Array(64)
      for (let i = 0; i < 64; i++){
        const pieceOnSquare = this.engine.board.square[i]
        const character = Piece.From_Number[pieceOnSquare]
        characterBoard[i] = character
      }
      
      this.send("")
      
      for (let rank = 7; 0 <= rank; rank --){
  
        const p1 = characterBoard[rank * 8 + 0]
        const p2 = characterBoard[rank * 8 + 1]
        const p3 = characterBoard[rank * 8 + 2]
        const p4 = characterBoard[rank * 8 + 3]
        const p5 = characterBoard[rank * 8 + 4]
        const p6 = characterBoard[rank * 8 + 5]
        const p7 = characterBoard[rank * 8 + 6]
        const p8 = characterBoard[rank * 8 + 7]
  
        this.send('+---+---+---+---+---+---+---+---+')
        this.send(`| ${p1} | ${p2} | ${p3} | ${p4} | ${p5} | ${p6} | ${p7} | ${p8} |  ${rank+1} `)
        
      }
      this.send('+---+---+---+---+---+---+---+---+')
      this.send("  a   b   c   d   e   f   g   h  ")
      this.send("")

    }

  send(msg) {
    process.stdout.write(msg + "\n");
  }
}

new UCI()
