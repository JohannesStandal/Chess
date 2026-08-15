//Klassen Piece vil fungere som eit bibliotek for sjakkbrikkene.
export class Piece {
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
   
    //Retningar for rette og diagonale linjer
    static directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]

    static pin_W_E  =  0b1001   // +1 -1
    static pin_N_S  =  0b1010   // +8 -8
    static pin_NE_SW = 0b0101 // +9 -9
    static pin_NW_SE = 0b0110 // +7 -7

    static pins = [
        this.pin_W_E,
        this.pin_W_E,
        this.pin_N_S,
        this.pin_N_S,
        this.pin_NE_SW,
        this.pin_NE_SW,
        this.pin_NW_SE,
        this.pin_NW_SE
    ]
    
    // Images
    static Images = new Array(16)
    
    static {
        this.Images[this.black | this.king]   = "Images/King_Black.png"
        this.Images[this.black | this.queen]  = "Images/Queen_Black.png"
        this.Images[this.black | this.rook]   = "Images/Rook_Black.png"
        this.Images[this.black | this.bishop] = "Images/Bishop_Black.png"
        this.Images[this.black | this.knight] = "Images/Knight_Black.png"
        this.Images[this.black | this.pawn]   = "Images/Pawn_Black.png"
        
        this.Images[this.white | this.king]   = "Images/King_White.png"
        this.Images[this.white | this.queen]  = "Images/Queen_White.png"
        this.Images[this.white | this.rook]   = "Images/Rook_White.png"
        this.Images[this.white | this.bishop] = "Images/Bishop_White.png"
        this.Images[this.white | this.knight] = "Images/Knight_White.png"
        this.Images[this.white | this.pawn]   = "Images/Pawn_White.png"

        //from Number
        this.From_Number[Piece.none] = " "

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

    static Type(piece){
        return piece & 0b111
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

