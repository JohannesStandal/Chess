import { Board } from "../Core/Board/chessboard.js"
import { AttackDetector } from "../Core/MoveGeneration/Attack.js"
import { MoveGenerator } from "../Core/MoveGeneration/MoveGenerator.js"
import { chess } from "./index.js"

export class Chess {
    constructor(){
        this.board = new Board()
        this.MoveGenerator = new MoveGenerator()
        
        this.startFen = ""
        this.playedMoves = []
    }

    loadFen(fen){
        this.startFen = fen
        this.playedMoves = []

        this.board.Load_Fen(fen)
    }

    exportFen(){
        return this.board.Export_Fen()
    }
    
    makeMove(move){
        this.playedMoves.push(move)
        this.board.Make_Move(move)
    }

    unmakeMove(move){
        this.playedMoves.pop()
        this.board.Unmake_Move(move)
    }

    GenerateMoves(){
        this.MoveGenerator.GenerateMoves(this.board)
        const moves = this.MoveGenerator.moves.slice(0, this.MoveGenerator.count)
        return moves
    }

    TacticalMoves(){
        this.MoveGenerator.TacticalMoves(this.board)
        const moves = this.MoveGenerator.moves.slice(0, this.MoveGenerator.count)
        return moves
    }

    InCheck(){
        return AttackDetector.InCheck(chess.board, chess.board.white_To_Move)
    }
}