export class KillerMoves {
    constructor(){
        this.killer1 = new Uint16Array(256).fill(null)
        this.killer2 = new Uint16Array(256).fill(null)
    }

    clear(){
        this.killer1.fill(null)
        this.killer2.fill(null)
    }

    store(move, ply){
        // We dont want killer 1 and killer 2 to be the same move
        if (this.killer1[ply] == move) return

        // Store the move. Previous killer 1 becomes killer 2
        this.killer2[ply] = this.killer1[ply]
        this.killer1[ply] = move
    }
}