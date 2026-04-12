import { ChessHelper } from "../Utils/Chess_Helper.js"

export class Move {
    static flags = {
        quietMove:          0b0000,
        doublePush:         0b0001,
        kingCastle:         0b0010,
        queenCastle:        0b0011,
        captures:           0b0100,
        epCapture:          0b0101,


        knightPromotion:    0b1000,
        bishopPromotion:    0b1001,
        rookPromotion:      0b1010,
        queenPromotion:     0b1011,
        knightPromoCapture: 0b1100,
        bishopPromoCapture: 0b1101,
        rookPromoCapture:   0b1110,  
        queenPromoCapture:  0b1111,
    }
    
    static EncodeUINT16(startIndex, targetIndex, moveFlag){
        // binary:   1111  101010  100101
        // Meaning:  flag  target  start
        const start = startIndex
        const target = targetIndex << 6 
        const flag = moveFlag << 12
        
        return (start | target | flag)
    }

    static Start(move){
        return move & 0b111111 
    }

    static Target(move){
        return (move >> 6) & 0b111111
    }

    static Flag(move){
        return (move >> 12) & 0b1111
    }

    static IsPromotion(move){
        const flag = this.Flag(move)
        return (flag & 0b1000) != 0
    }

    static IsCapture(move){
        const flag = this.Flag(move)
        return (flag & 0b0100) != 0  
    }

    static ToUCI(move){
        const start = Move.Start(move)
        const target = Move.Target(move)
        
        const startCoord = ChessHelper.indexToLetter[start]
        const targetCoord = ChessHelper.indexToLetter[target]

        if (Move.IsPromotion(move)){
            const type = Move.Flag(move) & 0b11
            const letters = "nbrq"
            const promotion = letters[type]

            return startCoord + targetCoord + promotion
        }

        return startCoord + targetCoord
    }

    static toUINT16(UCI, board){

    }

    
}

