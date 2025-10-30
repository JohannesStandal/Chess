class Move {
    constructor(start, target, flag){
        this.start = start
        this.target = target
        this.flag = flag
    }
    
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
    static IndexToLetter = new Array(64)
    
    static {
        const letter = "abcdefgh"
        for (let rank = 0; rank < 8; rank++){
            for (let file = 0; file < 8; file++){
                let index = rank * 8 + file
                this.IndexToLetter[index] = letter[file] + String(rank+1)
            }
        }
    } 
    static AlgebraicNotation(board, move){
        
        let notation = ""
        const piece = board.square[move.start]
        
        const capture = move.flag >> 2 & 1 == 1
        const IsPawn = Piece.IsType(piece, Piece.pawn)
        //Capture
        if (!IsPawn){
            notation += Piece.From_Number[piece]
        }
        if (capture){
            //Pawn
            if (IsPawn){
                const files = "abcdefg"
                notation += files[move.start % 8]
            }
            
            
            notation += "x"
        } 
        
        notation += this.IndexToLetter[move.target]

        return notation
    }

    static CoordinatesNotation(move){
        const files = "abcdefgh"
        let notation = ""

        let rank = String(Math.floor(move.start / 8) + 1)
        let file = files[move.start % 8]

        notation += file + rank
        
        rank = String(Math.floor(move.target / 8) + 1)
        file = files[move.target % 8]

        notation += file + rank

        return notation

    }

}

//Klassen Piece vil fungere som eit bibliotek for sjakkbrikkene.
class Piece {
    //Definerer brikker med tal slik at binær representerer brikke + farge
    //Døme: 01101 -> 01|101 -> 8 + 5 = kvitt, tårn  
    static none    = 0 //00_000
    static king    = 1 //00_001
    static pawn    = 2 //00_010
    static knight  = 3 //00_011
    static bishop  = 4 //00_100
    static rook    = 5 //00_101
    static queen   = 6 //00_110

    static white   = 8 //01_000
    static black  = 16 //10_000

    //Brikkeverdi for evaluering
    static pieceValues = [
        0,
        1,
        100,
        300,
        300,
        500,
        900,
    ]

    //Ordliste for Forsyth Edwards Notasjon (FEN)
    static From_Symbol = {
            "k": this.king,    //001
            "q": this.queen,   //110
            "r": this.rook,    //101
            "b": this.bishop,  //100
            "n": this.knight,  //011
            "p": this.pawn,    //010
        }

    static From_Number = new Array(22)
    

    
    static updateCastleRights = [
        //Dronning side <- | -> Kongeside
        11, 15, 15, 15,  3, 15, 15,  7,   // Oppdater castle rights med å bruka and operasjon på talet
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b0111 = 7  => fjern kvit kongeside rokade
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1011 = 11 => fjern kvit dronningside rokade
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b0011 = 3  => fjern kvit rokade
        15, 15, 15, 15, 15, 15, 15, 15,   // 
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1101 = 13 => fjern svart kongeside rokade
        15, 15, 15, 15, 15, 15, 15, 15,   // 0b1110 = 14 => fjern svart dronningside rokade
        14, 15, 15, 15, 12, 15, 15, 13,   // 0b1100 = 12 => fjern svart rokade
    ]
    static numSquaresToEdge = new Array(64)
    
    //Retningar for rette og diagonale linjer
    static directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]

    //Liste for å rekne ut lovlege trekk for hest og konge
    static knightAttacks = new Array(64)
    static kingAttacks = new Array(64)
    
    //Bileter til HTML brett
    static Images = new Array(16)
    
    static Sounds = {
        quietMove: new Audio("Lydeffektar/move-self.mp3"),
        capture: new Audio("Lydeffektar/capture.mp3"),
        notification: new Audio("Lydeffektar/notify.mp3"),
    }
    
    static {
        this.Images[this.black | this.king]   = "bilder/King_Black.png"
        this.Images[this.black | this.queen]  = "bilder/Queen_Black.png"
        this.Images[this.black | this.rook]   = "bilder/Rook_Black.png"
        this.Images[this.black | this.bishop] = "bilder/Bishop_Black.png"
        this.Images[this.black | this.knight] = "bilder/Knight_Black.png"
        this.Images[this.black | this.pawn]   = "bilder/Pawn_Black.png"
        
        this.Images[this.white | this.king]   = "bilder/King_White.png"
        this.Images[this.white | this.queen]  = "bilder/Queen_White.png"
        this.Images[this.white | this.rook]   = "bilder/Rook_White.png"
        this.Images[this.white | this.bishop] = "bilder/Bishop_White.png"
        this.Images[this.white | this.knight] = "bilder/Knight_White.png"
        this.Images[this.white | this.pawn]   = "bilder/Pawn_White.png"

        //from Number
        this.From_Number[Piece.white | Piece.pawn]   = "P"
        this.From_Number[Piece.white | Piece.knight] = "N"
        this.From_Number[Piece.white | Piece.bishop] = "B"
        this.From_Number[Piece.white | Piece.rook]   = "R"
        this.From_Number[Piece.white | Piece.queen]  = "Q"
        this.From_Number[Piece.white | Piece.king]   = "K"

        this.From_Number[Piece.black | Piece.pawn]   = "p"
        this.From_Number[Piece.black | Piece.knight] = "n"
        this.From_Number[Piece.black | Piece.bishop] = "b"
        this.From_Number[Piece.black | Piece.rook]   = "r"
        this.From_Number[Piece.black | Piece.queen]  = "q"
        this.From_Number[Piece.black | Piece.king]   = "k"
        

        //Forhåndsrekner ut avstand i alle retninger på brettet
        //Nyttig å ha til å regne ut lovlege trekk
        for (let file = 0; file < 8; file++){
            for (let rank = 0; rank < 8; rank++){
                
                const squareIndex = rank * 8 + file

                const numNorth = 7 - rank
                const numEast = 7 - file
                const numSouth = rank
                const numWest = file 

                this.numSquaresToEdge[squareIndex] = [
                    numWest,
                    numEast,
                    numNorth,
                    numSouth,
                    Math.min(numNorth, numEast),
                    Math.min(numSouth, numWest),
                    Math.min(numWest, numNorth),
                    Math.min(numEast, numSouth),
                ]
            }
        }
        //Forhåndsreknar alle lovlege Hest trekk for alle rutene på brettet
        //Dette vil spare tid når ein genererer trekk
        for (let file = 0; file < 8; file++){
            for (let rank = 0; rank < 8; rank++){
                const squareIndex = rank * 8 + file
                const data = this.numSquaresToEdge[squareIndex] 
                let moves = []
                
                //offsets = 15, 17, 6, 10, -10, -6, -17, -15
                
                //Offset: + 15
                if (data[2] >= 2 && data[0] >= 1){
                    moves.push(new Move(squareIndex, squareIndex + 15))
                }
                //Offset: + 17
                if (data[2] >= 2 && data[1] >= 1){
                    moves.push(new Move(squareIndex, squareIndex + 17))
                }
                //Offset: + 6
                if (data[0] >= 2 && data[2] >= 1){
                    moves.push(new Move(squareIndex, squareIndex + 6))
                }
                //Offset: + 10
                if (data[1] >= 2 && data[2] >= 1){
                    moves.push(new Move(squareIndex, squareIndex + 10))
                }
                //Offset: - 10
                if (data[0] >= 2 && data[3] >= 1){
                    moves.push(new Move(squareIndex, squareIndex - 10))
                }
                //Offset: - 6
                if (data[1] >= 2 && data[3] >= 1){
                    moves.push(new Move(squareIndex, squareIndex - 6))
                }
                //Offset: -17
                if (data[3] >= 2 && data[0] >= 1){
                    moves.push(new Move(squareIndex, squareIndex - 17))
                }
                //Offset: -15
                if (data[3] >= 2 && data[1] >= 1){
                    moves.push(new Move(squareIndex, squareIndex - 15))
                }
                

                this.knightAttacks[squareIndex] = moves


            }
        }

        
        for (let start = 0; start < 64; start++){
            let moves = []

            const west  = (0 < this.numSquaresToEdge[start][0]) 
            const east  = (0 < this.numSquaresToEdge[start][1]) 
            const north = (0 < this.numSquaresToEdge[start][2])
            const south = (0 < this.numSquaresToEdge[start][3]) 

            let dir = [west, north, east, south, west]
            let offset = [-1, 8, 1, -8, 7, 9, -7, -9]
            
            for (let i = 0; i < 4; i++){
                if (dir[i]){
                    const targetSquare = start + offset[i]
                    moves.push(new Move(start, targetSquare))
                }
                if (dir[i] && dir[i+1]){
                    const targetSquare = start + offset[i+4]
                    moves.push(new Move(start, targetSquare))
                }
               
            }
            
            this.kingAttacks[start] = moves

        }
    }

    static CheckPieceColor(piece, isWhite){
        //funksjonen sjekkar om ei brikke er av ein bestemt farge
        //Sjølv om den ikkje er kvit betyr ikkje det at den er svart!
        //Den gjer dette ved å sjekke dei to første bitsa i brikketalet (10, 01)
        let val = piece >> 3
        
        if (isWhite){
            return val == 1
        }
        else {
            return val == 2
        }
    }

    static IsType(piece, type){
        return ((piece & 0b0111) == type)
    }
    static IsSlidingPiece(piece){
        //henter siste 3 siffera i brikkenummeret (i binær)
        // 4 = biskop; 5 = Tårn; 6 = Dronning;
        let pieceType = piece & 0b111 
        return 3 < pieceType && pieceType < 7
    }

}

