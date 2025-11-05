//Hovudklasse for sjakkbrettet
//Denne klassen simulerer reglar for sjakkbrettet og er 
//Hjernen bak programmet

class Board {
    constructor(){
        //blir fiksa når du lastar inn ein FEN
        this.square = new Array(64).fill(0)
        this.white_To_Move = true
        this.castlingRights = 0b1111
        this.halfMoveClock = 0
        this.enPassantSquare = null
        
        //lagrar rutene som motstandar angriper
        //Nyttig for å leite etter lovlege kongetrekk, sjakk og sjakkmatt
        this.opponentAttacks = []
        this.moves = []

        //lagrer spillhistorikk
        this.stack = []
        this.repetitionTable = []
        this.zobrist = new zobrist_hashing()
    }

    //Denne funksjonen kan laste inn sjakkposisjonar frå standart sjakknotasjon (FEN)
    Load_Fen(fen){
        //Tømmer brett
        this.square = new Array(64).fill(0)
        this.stack = []
        this.repetitionTable = []

        //Deler opp FEN i dei ulike infodelane
        // 0 = Posisjon, 1 = Spelar sin tur, 2 = Rokade, 3 = en pessant, 4/5 half move clock
        const data = fen.split(" ")
        const piece_positions = data[0].split("")

        //Setter opp posisjon
        let file = 0
        let rank = 7

        piece_positions.forEach(char => {
            if (char == "/"){
                file = 0
                rank --
            }
            else {
                if (!isNaN(char)){
                    file += parseInt(char)
                }
                else {
                    let color = (char == char.toLowerCase()) ? Piece.black : Piece.white
                    this.square[rank*8+file] = color | Piece.From_Symbol[char.toLowerCase()]
                    file ++
                }
            }
        });

        //Kven sin tur det er
        this.white_To_Move = (data[1] == "w") 
        
        //Rokade
        this.castlingRights = 0b0000
        const castlingRights = data[2].split("")
        castlingRights.forEach(char => {
            if (char == "-") this.castlingRights = 0b0000
            else if (char == "K") this.castlingRights += 0b1000
            else if (char == "Q") this.castlingRights += 0b0100
            else if (char == "k") this.castlingRights += 0b0010
            else if (char == "q") this.castlingRights += 0b0001
        })

        this.UpdateEnemyAttacks()
        this.zobrist.createHash(this.square, this.white_To_Move)
        this.repetitionTable.push(this.zobrist.hash)
    }

    
    Make_Move(move){
        this.stack.push({
            square: [...this.square],
            white_To_Move: this.white_To_Move,
            castlingRights: this.castlingRights,
            halfMoveClock: this.halfMoveClock,
            enPassantSquare: this.enPassantSquare,
            opponentAttacks: this.opponentAttacks,
            moves: [...this.moves],
            repetitionTable: [...this.repetitionTable],
        })
        
        this.castlingRights &= Piece.updateCastleRights[move.start] 
        this.castlingRights &= Piece.updateCastleRights[move.target]



        //en passant
        if (move.flag == Move.flags.epCapture){
            board.square[board.enPassantSquare] = 0
        }
        //sjekker etter flag
        if (move.flag == Move.flags.doublePush){
            this.enPassantSquare = move.target
        }
        else {
            this.enPassantSquare = null
        }

        //Finne brikketype
        let piece = this.square[move.start]

        //Forfremmelse
        if (move.flag >> 3 == 1){
            const color = (this.white_To_Move) ? Piece.white : Piece.black
            const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen]
            const index = move.flag & 0b0011
            piece = color | pieceTypes[index]
        } 

        //Sjølve flyttet
        this.square[move.target] = piece
        this.square[move.start] = 0

        //Flytte tårn i tilfellet av rokade
        if (move.flag == Move.flags.kingCastle){
            const rookSquare = move.start + 3
            const targetSquare = move.start + 1

            this.square[targetSquare] = this.square[rookSquare]
            this.square[rookSquare] = 0
        }
        else if (move.flag == Move.flags.queenCastle){
            const rookSquare = move.start - 4
            const targetSquare = move.start - 1

            this.square[targetSquare] = this.square[rookSquare]
            this.square[rookSquare] = 0
        }

        this.moves.push(Move.CoordinatesNotation(move))

        //Oppdaterer variablar
        this.white_To_Move = !this.white_To_Move
        this.UpdateEnemyAttacks()

        this.zobrist.createHash(this.square, this.white_To_Move)
        this.repetitionTable.push(this.zobrist.hash)
    }

    Unmake_Move(move){
        //sjekkar om det eksisterer ein spelhistorikk
        //Dersom det ikkje er det avbryter den operasjonen
        if (this.stack.length == 0) return

        //overfører data frå forrige posisjon
        const previousPosition = this.stack.pop()

        this.square = previousPosition.square
        this.white_To_Move = previousPosition.white_To_Move
        this.castlingRights = previousPosition.castlingRights
        this.halfMoveClock = previousPosition.halfMoveClock
        this.opponentAttacks = previousPosition.opponentAttacks,
        this.enPassantSquare = previousPosition.enPassantSquare

        this.moves = previousPosition.moves
        this.repetitionTable = previousPosition.repetitionTable
       
    }

    GenerateSlidingMoves(piece, start){
        let moves = []

        //Definerer nokre variablar
        let pieceType = piece & 0b111
        let data = Piece.numSquaresToEdge[start]

        
        //directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7]

        //Om brikka skal bevegast i rette linjer, tar den med desse retningane
        let startIndex = (pieceType == Piece.bishop) ? 4 : 0
        //Om brikka skal bevegast i diagonale linjer, tar den med desse retningane
        let endIndex = (pieceType == Piece.rook) ? 4 : 8

        for (let i = startIndex; i < endIndex; i++){
            let offset = Piece.directionOffsets[i]
            
            for (let n = 0; n < data[i]; n++){
                const target = start + offset * (n+1)
                const pieceOnTargetSquare = this.square[target]

                //Om brikka er vennleg kan vi ikkje gå lenger, og gjeldande trekk er ulovleg
                if (Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)){
                    break
                }
                //Dersom brikka er fientleg er det eit angrep
                if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)){
                    moves.push(new Move(start, target, Move.flags.captures))    
                    break
                }
                //Legger til quiet move
                 moves.push(new Move(start, target, Move.flags.quietMove))
            }
        
        }

        return moves
    }

    GenerateKnightMoves(start){
        let arr = Piece.knightAttacks[start]
        let moves = []

        arr.forEach(move =>{
            const pieceOnTargetSquare = this.square[move.target]
            //Dersom ruta er tom er trekket eit quiet move
            if (pieceOnTargetSquare == 0){
                move.flag = Move.flags.quietMove
                moves.push(move)
            }
            //Om brikka vi landar på er fientleg kan vi lagre som anrep
            else if (! Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)){
                move.flag = Move.flags.captures
                moves.push(move)
            }
            //Om brikka vi landar på er vennleg er gjeldande trekk er ulovleg
            //Vi tren derfor ikkje å gjere noko

        })
        return moves

    }

    GeneratePawnMoves(start, GenerateAttackSquares = false){
        let moves = []
        //finner retning avhengig av farge 
        const pawnIsWhite = this.white_To_Move

        const dir = (pawnIsWhite) ? 1 : -1
        const doublePush = (pawnIsWhite) ? (start < 16) : (47 < start)
        
       
        for (let n = 0; n<2; n++){
            //Treng ikkje å generer flytt framover dersom vi bare generer angrep
            if (GenerateAttackSquares) break
            
            //vanleg rett fram + dobbel push på start
            const targetSquare = start + 8 * (n+1) * dir
            if (this.square[targetSquare] != 0){
                break
            }
            const flag = (n == 1) ? Move.flags.doublePush : Move.flags.quietMove
            //console.log(new Move(start, targetSquare, flag))
            moves.push(new Move(start, targetSquare, flag))
            if (! doublePush) break
        }
        
        //Generer angrep inkludert en passant
        const offset = pawnIsWhite ? 0 : 1
        
        for (let i = 0; i<2; i++){
            if (Piece.numSquaresToEdge[start][Math.abs(offset - i)] >= 1){
                
                const targetSquare = start + (7 + 2*i) * dir
                const targetedPiece = this.square[targetSquare]
                
                //Sjekker om den angriper ei fiendtleg brikke (gitt at vi filtrer ulovlige angrep)
                //blir overstyrt dersom vi angriper angrep => or GenerateAttackSquares
                const enemyUnderAttack = Piece.CheckPieceColor(targetedPiece, !pawnIsWhite) | GenerateAttackSquares

                //Sjekker etter en passant trekk
                if (this.enPassantSquare != null){
                    const epTarget = this.enPassantSquare + 8 * dir
                    
                    if (targetSquare == epTarget){
                        moves.push(new Move(start, targetSquare, Move.flags.epCapture))
                    }
                    
                }
                if (enemyUnderAttack){
                    moves.push(new Move(start, targetSquare, Move.flags.captures))
                }
            }
        }

        //Forfremming
        let filteredMoves = []
        moves.forEach(move=>{
            //Bonde har nådd siste rekke
            const promotion = (pawnIsWhite) ? (55 < move.target) : (move.target < 8)
            if (promotion){
                const capture = (move.flag >> 2 & 1 == 1) 
                const captureFlag = capture ? 0b100 : 0b000
                //1|0|00: 3 siffer refererer til capture
                filteredMoves.push(new Move(move.start, move.target, Move.flags.bishopPromotion + captureFlag))
                filteredMoves.push(new Move(move.start, move.target, Move.flags.knightPromotion + captureFlag))
                filteredMoves.push(new Move(move.start, move.target, Move.flags.rookPromotion   + captureFlag))
                filteredMoves.push(new Move(move.start, move.target, Move.flags.queenPromotion  + captureFlag))
            }
            else{
                filteredMoves.push(move)
            }
        })
        return filteredMoves
    }

    GenerateKingMoves(start){
        let moves = []
        //Vanlege trekk
        Piece.kingAttacks[start].forEach(move => {
            const targetPiece = this.square[move.target]
            //Om ruta er tom er trekket eit quiet move
            if (targetPiece == 0){
                move.flag = Move.flags.quietMove
                moves.push(move)
            } 
            //Om ruta har ei fientleg brikke er trekket ulovleg
            if (Piece.CheckPieceColor(targetPiece, !this.white_To_Move)){
                move.flag = Move.flags.captures
                moves.push(move)
            }
            //Ellers er det ei vennleg brikke på ruta og vi treng ikkje å gjere noko
        })
        
        //Todo Rokade
        const castleRights = (this.white_To_Move) ? this.castlingRights >> 2 : this.castlingRights
        const myKingSquare = (this.white_To_Move) ? 4 : 60

        //castle kingside
        if ((castleRights & 0b10) == 0b10){
           
            let legal = !this.opponentAttacks.includes(myKingSquare)
            for (let i = 1; i < 3; i++){
                const squareToCheck = myKingSquare + i
                //Er ruta tom
                if (board.square[squareToCheck] != 0){
                   
                    legal = false 
                    break
                }
                //Er ruta under angrep
                if (board.opponentAttacks.includes(squareToCheck)){
                    legal = false 
                   
                    break
                }
            }
            if (legal) moves.push(new Move(myKingSquare, myKingSquare + 2, Move.flags.kingCastle))

        }
        //castle queenside
        if ((castleRights & 0b01) == 0b01){
          
            let legal = !this.opponentAttacks.includes(myKingSquare)

            for (let i = 1; i < 4 ; i++){
                const squareToCheck = myKingSquare - i
                
                //Er ruta tom
                if (board.square[squareToCheck] != 0){
                    legal = false 
                    break
                }

                //Er ruta under angrep
                if (board.opponentAttacks.includes(squareToCheck) && i <= 2){
                    legal = false 
                    break
                }
            }
            if (legal) moves.push(new Move(myKingSquare, myKingSquare - 2, Move.flags.queenCastle))

        }
        
        return moves
    }

    GenerateMoves(GenerateAttackSquares = false){
        //Lager moves for posisjonen på brettet
        let moves = []
        for (let i = 0; i<64; i++){
            let piece = this.square[i]

            if (piece == 0) continue

            //Sjekker om brikka er ei vennleg brikke
            if (Piece.CheckPieceColor(piece, this.white_To_Move)){
                if (Piece.IsSlidingPiece(piece)){
                    //console.log("Sliding piece", i)
                    moves.push(...this.GenerateSlidingMoves(piece, i))
                }
               
                if ((piece & 0b111) == Piece.knight){
                    //console.log("knight", i)
                    moves.push(...this.GenerateKnightMoves(i))
                }

                if ((piece & 0b111) == Piece.pawn){
                    //console.log("pawn", i)
                    moves.push(...this.GeneratePawnMoves(i, GenerateAttackSquares))
                }

                if ((piece & 0b111) == Piece.king){
                    //console.log("pawn", i)
                    moves.push(...this.GenerateKingMoves(i))
                }
            }

        }

        return moves
    }

    UpdateEnemyAttacks(){
        //generer pseudo-lovlige motstandartrekk
        this.white_To_Move = !this.white_To_Move
        const opponentResponses = this.GenerateMoves(true) //true = tillat ulovlige bondeangrep
        this.white_To_Move = !this.white_To_Move
        
        //Nullstiller opponentAttacks og filtrerer motstandartrekk
        this.opponentAttacks = []
        opponentResponses.forEach(response => {
            //itererer gjennom alle trekk og sjekker om vi veit at det er under angrep
            const pieceToMove = this.square[response.start]
            
            if ( ! this.opponentAttacks.includes(response.target)){
                this.opponentAttacks.push(response.target)
            }
        })

    }

    InCheck(color = this.white_To_Move){
        const colorNumber = (color) ? Piece.white : Piece.black
        let myKingSquare = undefined

        for (let i = 0; i<64; i++){
            if (this.square[i] == (colorNumber | Piece.king)){
                myKingSquare = i
                break
            }
        }
        if (color != this.white_To_Move){
            this.white_To_Move = !this.white_To_Move
            this.UpdateEnemyAttacks()
            this.white_To_Move = !this.white_To_Move
        }
        else {
            this.UpdateEnemyAttacks()
        }

        return this.opponentAttacks.includes(myKingSquare)
    }

    GenerateLegalMoves(){
        let legalMoves = []

        //brikkenummer til vennleg konge
        
        
        //genererer og itererer gjennom alle pseudolovlige trekk
        const pseudoLegalMoves = this.GenerateMoves()
        //return pseudoLegalMoves
        
        pseudoLegalMoves.forEach(moveToCheck => {
            this.Make_Move(moveToCheck)
            //todo lagre alle brikkene i individuelle lister / variablar
            

            //In check
            if (! this.InCheck(! this.white_To_Move)){
                legalMoves.push(moveToCheck)
            }

            //returner til opprinnelig posisjon
            this.Unmake_Move(moveToCheck)
            
        })
        
        return legalMoves
    } 

    GenerateCaptures(){
        let captureMoves = []
        const legalMoves = this.GenerateLegalMoves()
        legalMoves.forEach(move =>{
            const isCapture = (move.flag & 0b0100) == 0b0100
            if (isCapture) captureMoves.push(move)
        })
        
        return captureMoves
    }

    IsTerminal(){
        
        //Ingen lovlege trekk, sjekk etter sjakkmatt / sjakk patt
        if (board.GenerateLegalMoves().length == 0){    
            //Checkmate
            if (board.InCheck()){
                return true, -checkMateScore
            }
            
            //Stalemate
            return true, 0
        }
        return false, 0
    }
}

