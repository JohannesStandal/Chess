import { ChessHelper } from "../Utils/Chess_Helper.js"
import { Piece } from "./piece.js"

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

    static UCItoUINT16(UCIMove, board){
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
        
        // pawn rules
        const pawnMove = Piece.IsType(movedPiece, Piece.pawn)

        if (pawnMove){

            // double push
            const doublePush = (Math.abs(start - target) == 16)
            if (doublePush){
                flag = Move.flags.doublePush
            }

            // en passant
            let offset = (board.white_To_Move) ? -8 : 8
            const epCapture = (target + offset == board.enPassantSquare)
    
            if (epCapture){
                flag = Move.flags.epCapture
            }

            // promotion
            if (parts.length == 5){
                const letterToFlag = {
                "n": Move.flags.knightPromotion,
                "b": Move.flags.bishopPromotion,
                "r": Move.flags.rookPromotion,
                "q": Move.flags.queenPromotion,
                }
    
                flag = letterToFlag[parts[4]]
            }
        }

        // castling if the moved piece was a king
        if (Piece.IsType(movedPiece, Piece.king)){
            if (UCIMove == "e1g1" || UCIMove == "e8g8") flag = Move.flags.kingCastle
            if (UCIMove == "e1c1" || UCIMove == "e8c8") flag = Move.flags.queenCastle
        }

        if (capturedPiece != Piece.none){
            flag |= Move.flags.captures
        }
        
        return Move.EncodeUINT16(start, target, flag)
    }
}

        
