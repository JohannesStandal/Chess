import { AttackTables } from "../Constants/AttackTables.js"

const maxNumLegalMoves = 218

class MoveGenerator {
    constructor(board){
        this.board = board

        this.moves = new Uint16Array(maxNumLegalMoves)
        this.count = 0

        this.uncertain = true
    }

    Add(move){
        this.moves[this.count] = move
        this.count++
    }

    GenerateMoves(pinmask, blockers, checkers){
        // Reset array pointer
        this.count = 0
        this.uncertain = false

        // If there is a double check, we only consider kingmoves
        this.GenerateKingMoves()
        if (1 < checkers.length) return

        // GenerateOtherMoves
        if (this.board.white_To_move){
            this.GenerateWhitePawnMoves()
        }
        else {
            this.GenerateBlackPawnMoves()
        }

        //
        this.GenerateKnightMoves()
        
        return this.moves.slice(0, this.count)
    }

    GenerateWhitePawnMoves(){

    }

    GenerateBlackPawnMoves(){

    }

    GenerateKingMoves(){

    }

    GenerateSlidingMoves(){

    }
}