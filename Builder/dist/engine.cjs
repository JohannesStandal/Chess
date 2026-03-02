var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Core/Board/piece.js
var piece_exports = {};
__export(piece_exports, {
  Piece: () => Piece
});
var Piece;
var init_piece = __esm({
  "Core/Board/piece.js"() {
    Piece = class _Piece {
      //Definerer brikker med tal slik at binær representerer brikke + farge
      //Døme: 01101 -> 01|101 -> 8 + 5 = kvitt, tårn  
      static none = 0;
      //00_000
      static king = 1;
      //00_001
      static pawn = 2;
      //00_010
      static knight = 3;
      //00_011
      static bishop = 4;
      //00_100
      static rook = 5;
      //00_101
      static queen = 6;
      //00_110
      static white = 8;
      //01_000
      static black = 16;
      //10_000
      //Brikkeverdi for evaluering
      static pieceValues = [
        0,
        2e4,
        100,
        320,
        330,
        500,
        900
      ];
      //Ordliste for Forsyth Edwards Notasjon (FEN)
      static From_Symbol = {
        "k": this.king,
        //001
        "q": this.queen,
        //110
        "r": this.rook,
        //101
        "b": this.bishop,
        //100
        "n": this.knight,
        //011
        "p": this.pawn
        //010
      };
      static From_Number = new Array(22);
      //Retningar for rette og diagonale linjer
      static directionOffsets = [-1, 1, 8, -8, 9, -9, 7, -7];
      static pin_W_E = 9;
      // +1 -1
      static pin_N_S = 10;
      // +8 -8
      static pin_NE_SW = 5;
      // +9 -9
      static pin_NW_SE = 6;
      // +7 -7
      static pins = [
        this.pin_W_E,
        this.pin_W_E,
        this.pin_N_S,
        this.pin_N_S,
        this.pin_NE_SW,
        this.pin_NE_SW,
        this.pin_NW_SE,
        this.pin_NW_SE
      ];
      // Images
      static Images = new Array(16);
      static {
        this.Images[this.black | this.king] = "Images/King_Black.png";
        this.Images[this.black | this.queen] = "Images/Queen_Black.png";
        this.Images[this.black | this.rook] = "Images/Rook_Black.png";
        this.Images[this.black | this.bishop] = "Images/Bishop_Black.png";
        this.Images[this.black | this.knight] = "Images/Knight_Black.png";
        this.Images[this.black | this.pawn] = "Images/Pawn_Black.png";
        this.Images[this.white | this.king] = "Images/King_White.png";
        this.Images[this.white | this.queen] = "Images/Queen_White.png";
        this.Images[this.white | this.rook] = "Images/Rook_White.png";
        this.Images[this.white | this.bishop] = "Images/Bishop_White.png";
        this.Images[this.white | this.knight] = "Images/Knight_White.png";
        this.Images[this.white | this.pawn] = "Images/Pawn_White.png";
        this.From_Number[_Piece.white | _Piece.pawn] = "P";
        this.From_Number[_Piece.white | _Piece.knight] = "N";
        this.From_Number[_Piece.white | _Piece.bishop] = "B";
        this.From_Number[_Piece.white | _Piece.rook] = "R";
        this.From_Number[_Piece.white | _Piece.queen] = "Q";
        this.From_Number[_Piece.white | _Piece.king] = "K";
        this.From_Number[_Piece.black | _Piece.pawn] = "p";
        this.From_Number[_Piece.black | _Piece.knight] = "n";
        this.From_Number[_Piece.black | _Piece.bishop] = "b";
        this.From_Number[_Piece.black | _Piece.rook] = "r";
        this.From_Number[_Piece.black | _Piece.queen] = "q";
        this.From_Number[_Piece.black | _Piece.king] = "k";
      }
      static CheckPieceColor(piece, isWhite) {
        let val = piece >> 3;
        if (isWhite) {
          return val == 1;
        } else {
          return val == 2;
        }
      }
      static IsType(piece, type) {
        return (piece & 7) == type;
      }
      static IsSlidingPiece(piece) {
        let pieceType = piece & 7;
        return 3 < pieceType && pieceType < 7;
      }
      static getPieceValue(piece) {
        return this.pieceValues[piece & 7];
      }
    };
  }
});

// Core/Utils/Chess_Helper.js
var ChessHelper;
var init_Chess_Helper = __esm({
  "Core/Utils/Chess_Helper.js"() {
    init_piece();
    ChessHelper = class {
      static numSquaresToEdge = new Array(64);
      static indexToLetter = new Array(64);
      static letterToIndex = {};
      static updateCastleRights = [
        //Queen side <- | -> King side
        11,
        15,
        15,
        15,
        3,
        15,
        15,
        7,
        // Utilizing & operator to remove castle rights
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 0b0111 = 7  => remove white kingside castle
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 0b1011 = 11 => remove white queenside castle
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 0b0011 = 3  => remove all white castling
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 0b1101 = 13 => remove black kingside castle
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        15,
        // 0b1110 = 14 => remove black queenside castle
        14,
        15,
        15,
        15,
        12,
        15,
        15,
        13
        // 0b1100 = 12 => remove all black castling
      ];
      static {
        for (let file = 0; file < 8; file++) {
          for (let rank = 0; rank < 8; rank++) {
            const squareIndex = rank * 8 + file;
            const numNorth = 7 - rank;
            const numEast = 7 - file;
            const numSouth = rank;
            const numWest = file;
            this.numSquaresToEdge[squareIndex] = [
              numWest,
              numEast,
              numNorth,
              numSouth,
              Math.min(numNorth, numEast),
              Math.min(numSouth, numWest),
              Math.min(numWest, numNorth),
              Math.min(numEast, numSouth)
            ];
          }
        }
      }
      static {
        const letters = "abcdefgh";
        for (let rank = 0; rank < 8; rank++) {
          for (let file = 0; file < 8; file++) {
            let index = rank * 8 + file;
            this.indexToLetter[index] = letters[file] + String(rank + 1);
          }
        }
      }
      static {
        for (let i = 0; i < 64; i++) {
          const letter = this.indexToLetter[i];
          this.letterToIndex[letter] = i;
        }
      }
      static checkForRepetitions(repetetionTable) {
        const copiedTable = [...repetetionTable];
        const hashToCheck = copiedTable.pop();
        let counter = 1;
        for (const hash of copiedTable) {
          if (hash == hashToCheck) counter++;
          if (2 < counter) return true;
        }
        return false;
      }
      static isInsufficientMaterial(board) {
        let whitePieces = [];
        let blackPieces = [];
        for (let i = 0; i < 64; i++) {
          const piece = board.square[i];
          if (piece == 0) continue;
          if (Piece.CheckPieceColor(piece, true)) whitePieces.push(piece);
          else blackPieces.push(piece);
        }
        whitePieces = whitePieces.filter((p) => !Piece.IsType(p, Piece.king));
        blackPieces = blackPieces.filter((p) => !Piece.IsType(p, Piece.king));
        if (whitePieces.length === 0 && blackPieces.length === 0) return true;
        const simpleMinor = (pieces) => pieces.length === 1 && (Piece.IsType(pieces[0], Piece.bishop) || Piece.IsType(pieces[0], Piece.knight));
        if (simpleMinor(whitePieces) && blackPieces.length === 0 || simpleMinor(blackPieces) && whitePieces.length === 0) {
          return true;
        }
        return false;
      }
      static RankIndex(squareIndex) {
        return Math.floor(squareIndex / 8);
      }
      static FileIndex(squareIndex) {
        return squareIndex % 8 - 1;
      }
      static CalculateEndgameWeight(board) {
        let numOpponentPieces = 0;
        for (let piece of board.square) {
          if (Piece.CheckPieceColor(piece, !board.white_To_Move)) {
            numOpponentPieces++;
          }
        }
        return (16 - numOpponentPieces) / 16;
      }
      static LocateKings(board) {
        let whiteKingSquare = 0;
        let blackKingSquare = 0;
        for (let i = 0; i < 64; i++) {
          const piece = board.square[i];
          if (piece == (Piece.king | Piece.white)) whiteKingSquare = i;
          if (piece == (Piece.king | Piece.black)) blackKingSquare = i;
        }
        return [whiteKingSquare, blackKingSquare];
      }
    };
  }
});

// Core/Constants/zobrist_hash_values.js
var hash_white_to_move, zobrist_hash_values;
var init_zobrist_hash_values = __esm({
  "Core/Constants/zobrist_hash_values.js"() {
    hash_white_to_move = 0x8f3a7c21b4d9e560n;
    zobrist_hash_values = {
      0: [
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n,
        0n
      ],
      9: [
        0xc4b032ccd7c524a5n,
        0xe51f30dc6a7ee39n,
        0xd261a7ab3aa2e4f9n,
        0xce177b4e0837b8a3n,
        0x66b2bc5b50c187fcn,
        0x10f1bc81448aaa9en,
        0xe9c349e03602f8acn,
        0x9132b63ef16287e4n,
        0xb7c93acfe059a0een,
        0x366eb16f508ebad7n,
        0x7fcd9eb1a7cad415n,
        0xe27a984d654821d0n,
        0xa491f0b2ea1fca65n,
        0x24933b83757750a9n,
        0x23bed01d43cf2fden,
        0xbeb799193f22faf8n,
        0x89fa6a688fb5d27bn,
        0xbf3c4c06434308bcn,
        0x6dadd6c795a76d79n,
        0x956269f0e5d7b875n,
        0x5cabcc97663f1c97n,
        0xff50bde4382567b8n,
        0x2369b584ff5e9ff0n,
        0x7e570ddf827050a8n,
        0xc17af08a1745d6d8n,
        0xdc713d960c0fd195n,
        0x27209bdf1c11f735n,
        0x28f49481a0a04dc4n,
        0xae340454cac5b68cn,
        0x98ae43346c12ace8n,
        0x62801c4510435a10n,
        0x988c24c961b1cd22n,
        0x77d21e02ff01cf99n,
        0x405cacec877409a9n,
        0x8da0365bf89897b9n,
        0xf143262fdc5c0eedn,
        0xae270da702f06b90n,
        0x1d53434bb88139b9n,
        0xe2817efdae849217n,
        0xc03987108976e334n,
        0xc4c2e2e3444ea7c8n,
        0x5715bd6fa4161293n,
        0x4b22d3081c8eaee9n,
        0x287d06ca6f4cc69an,
        0xd4af5974273ca3n,
        0xb8db0672f42d47ccn,
        0xb83cfe0be037e5edn,
        0xf8cda88b436d76e2n,
        0xc30ff46e8026695fn,
        0x81f76d1c2dbc2134n,
        0x1b3dbd5ce9a1fa6fn,
        0xa013ac6ededa4e16n,
        0xd777a4774c66e0a8n,
        0x81f631d4a39231a7n,
        0x32ebd6899be578c7n,
        0x5fb8d16c2720797dn,
        0x295b4715c333e861n,
        0xf4188f3f8a14be62n,
        0xec24a3c5c754108fn,
        0xeb2263dd87c5421en,
        0x99546eb400257ad1n,
        0x7d15438552fbe43bn,
        0x1ca35cfb04fc6d82n,
        0x5cec4eb5edd96831n
      ],
      10: [
        0xfc3e058be0f3eab0n,
        0xce88cb2dd4e80839n,
        0x3d4cbf374eb93effn,
        0x3da9c2a90ed42f1an,
        0x913e4de2e0c53cb8n,
        0x14296c07f26b4776n,
        0xbb5e4bcf15ed6269n,
        0xd0e6e6607c69dee1n,
        0xfa5d310011b7e948n,
        0x885f6e66c2b6d2c5n,
        0x2031d750c40db9b4n,
        0xa8e56e0c20de435dn,
        0xf264accc79ac1b1en,
        0x2a45c2ab8cbfedb0n,
        0x8715a10343dac043n,
        0x9b49bd26df57c59an,
        0xf6e07cc06c52c49fn,
        0xedcd465e36386821n,
        0xc1590f538a0f4efbn,
        0xb09b2a5cbadcc32an,
        0xb683d2e6337ea2dfn,
        0x66245bfa4fcca39an,
        0xabf3ad39fec21bben,
        0x5f987c71a65e688en,
        0xe64d1bcb702753a1n,
        0x7394988f847fd9b4n,
        0x3f76be1d1efa2197n,
        0x1064005c3985c3cfn,
        0x5628059568cc69bn,
        0x8dcdcd03969b6662n,
        0x96a402f23ae8cc93n,
        0x1d7425638602ab6n,
        0xb535106e122c9a56n,
        0xf1259e0a18ff6b6n,
        0x114125c63a9bedd4n,
        0x80aadfbe7c99b26n,
        0x5496f63cdc1110c1n,
        0x839fbc501223b513n,
        0x474a493b3ceddf2dn,
        0x7c441fe7ab4220a7n,
        0x8a0b3c3336d8393an,
        0xb92da22b21df306fn,
        0xe1e3db63ef7ddc76n,
        0x93829b43922fe15an,
        0x3e3511287900f7f9n,
        0x7914c120c8dcd19fn,
        0x683514f2ceb81f9dn,
        0x1825bc5430beb45fn,
        0xa8b317fa18d0752bn,
        0x5ab33edf6e595ed3n,
        0x693dffbc6c6fa611n,
        0xdd2467ac778eedb3n,
        0xdde29a6baa4b71an,
        0xa748dbcfac619e63n,
        0xa56c0941fbf24050n,
        0xf844fef1931e9een,
        0xba6c34ab6712303an,
        0xccf3a17156dc8907n,
        0x1bf90e27dc96925en,
        0x310c0c003fa7f104n,
        0x894a05e430b187efn,
        0x23e2fcb472d8567dn,
        0x2ef912766c006f61n,
        0x766ecb15474ebc19n
      ],
      11: [
        0xdfde4fbf3ff350bfn,
        0x134c6c92ec5b227cn,
        0xceda8bbb71710434n,
        0xdb20a56edc815fe7n,
        0x19108be58ce21ea3n,
        0xa6f2f7b80cf35b58n,
        0x8a63f881ffd0f9d5n,
        0x3c72ba8d605e770n,
        0x17e011b7f8102383n,
        0xc0e9ab30ed2662e9n,
        0x3c835dc0d9441fa5n,
        0x680ac07a2a935d62n,
        0x7b3a4e3e7c52fa17n,
        0xdd59ba7136b82481n,
        0xe7067ef466aa9385n,
        0x2a25a8880f02bad0n,
        0x8d4127610461e3n,
        0x63f2ae24fc3d3348n,
        0xed3049cf43e458fcn,
        0xc8fe3ccdc8b8d9c6n,
        0x490617f2747b6dban,
        0xb253d2186c4a37ean,
        0xbb026576f512c4c3n,
        0xc88a618efed4057dn,
        0xa97065e18e46d534n,
        0x7c967f79b7e99acan,
        0x309d258c27a0c3d7n,
        0x37bb3eec4bf50b52n,
        0xef8c2d6f7fd5646n,
        0xbc594585944528c0n,
        0xf9aea4b8acd4e10n,
        0x504867babf7b539bn,
        0xcd620c20ea2622bn,
        0x7a0ecfea958ca9ban,
        0xeb5cf46780bacd64n,
        0x87f7e1fbda4bd9can,
        0xe8fa8e0284d82e5n,
        0x82010c62f5f59b22n,
        0xd9f195d014822f53n,
        0x118a9d292f923996n,
        0x1165e21098543881n,
        0xdca02eecacdabaccn,
        0x675dd5af3c365296n,
        0xf10c718b1eb0e38an,
        0x91d63f78e3e9de99n,
        0x94340a033f07f814n,
        0xa2c827e98326856n,
        0x14fcdd549e8fc965n,
        0xa8499b926b5252e3n,
        0x90b2b633956b8c0cn,
        0x50fd9d3f85d51695n,
        0x42c18a62ef48e8d5n,
        0xab73295b344a54b8n,
        0x506e5a9ab758588dn,
        0x43ff50113d1a85ddn,
        0x21813d25655238a6n,
        0xa53f8a28abf3e3fcn,
        0x750cab754ccc9bc2n,
        0xedd4253b50f0fd0an,
        0xef8c485bc07a30f2n,
        0x2627f7312922f83n,
        0x9f044aed75523327n,
        0x902059e4ff9ab5c2n,
        0x19985f15ff002d4dn
      ],
      12: [
        0x89a2688b12c136e0n,
        0x8181a8cc369147ebn,
        0x21e8ac6843e42cafn,
        0x5958a499eeea163en,
        0x119c4ea3e1805081n,
        0x3e896c64e117dac3n,
        0x48f4ef125e9953d2n,
        0x702cdd20286218b8n,
        0x8b10550cd5704f32n,
        0x4d71c366b41b3143n,
        0xfbddcf7c9c96e9ecn,
        0xce9e1a11fcbb4e59n,
        0x8768a84fa76afde6n,
        0xaaf915310200b1f0n,
        0x8dfa6a56d12dbc9an,
        0xee87905e4ca415ean,
        0x1a84a51aa9d3d7c7n,
        0xe0ccedc5f05db76en,
        0x43b409ef2260e70fn,
        0xe3c436571d8cbbacn,
        0xbe0f051b1b66b5a9n,
        0x27cb6f2a8da01097n,
        0x48212ddb45b89cd9n,
        0x35ebd32d9ad620abn,
        0x57c700aab7b56ea7n,
        0xafffcfd2341ef40bn,
        0xda587e8aa25d6b29n,
        0x81627cf1439472e6n,
        0x40497b717d106c60n,
        0xe87d1c78e7c421c7n,
        0xd01280fd89a40c0n,
        0xa260772317a0df49n,
        0xd450281c6c6f7633n,
        0xb49452d46d483f3n,
        0x5563f61600e85ecen,
        0x217d65a0c56811cdn,
        0xfad409e2a319dcb4n,
        0x295d6fbf430f801dn,
        0x711c21c9bdc14f1fn,
        0xb4a69f3c8d3aed99n,
        0x8f9797b06d7ce3c9n,
        0x1ca3c4480279b6a6n,
        0xf1eedba313432e61n,
        0xb0e6a969e21342b0n,
        0x26286bfbe767dcean,
        0x93923de8babce3bn,
        0x5e84f058d5a804ebn,
        0x8d7248e2951f58d0n,
        0x6e06809725e97977n,
        0xab54bde20a04502n,
        0x5d59cd2a4eea04e7n,
        0xeededb07e623a689n,
        0xf8e1daa7cbceabden,
        0xa368ce7dc570131n,
        0x5b9962c6e61fecc0n,
        0xae9bec3635c7936cn,
        0xaabc25fa3fe12e47n,
        0x5a8aaeca1a50aec3n,
        0x8f5486b7c7b5b2bcn,
        0xdfed2c43e256a6dcn,
        0xf94d62046808593fn,
        0xbfddc3d99ee3ac2an,
        0xecfedb992790cebdn,
        0x3c9ad14cee0caeb5n
      ],
      13: [
        0x2999b735dd56cc94n,
        0xccc56569f9e8a369n,
        0x2d534dd0cf8ebc5an,
        0x698c206fe1a47e10n,
        0x2dea94930658663an,
        0xecab3301bc8f7d29n,
        0xc84a7b28550a1b46n,
        0x696608aaee49f329n,
        0xab7f089acd5f4822n,
        0xbc2cbb0ddd334cc7n,
        0x3f87e362cf8d446an,
        0x28c13091444d610bn,
        0xb386f7a4c991603fn,
        0x61ee411a1bac27a7n,
        0x9e9db0adf465290n,
        0x787f2425dbccc477n,
        0x3317347038f16a81n,
        0xeb1fa9f2d10bd1d0n,
        0x598336e375d66ed4n,
        0xd20eac174e20fd1an,
        0xdf0f06cbcb9bc326n,
        0x391184973a43b2ban,
        0xa8f7ef5a060edf5bn,
        0x6601ddd03170f437n,
        0x475287aa5408f9acn,
        0x11c58ef0dd463c09n,
        0xc5f8bc16f7860b50n,
        0x59e4b6714774bc58n,
        0x8268690ba43825b5n,
        0xadf4e62d6651529en,
        0xd7fa2d8dfb2ca025n,
        0x54c63cd889456f27n,
        0x710d430f071d879n,
        0xe08596db1d870966n,
        0x42deffccf86c2ca2n,
        0x94a1875d2db69edbn,
        0xfbc9f87af668a617n,
        0x9cb394243f59a85n,
        0x98b8e4cc1bc044fcn,
        0x587ef3446f3f920cn,
        0xc9535b63ba81edd9n,
        0x6fb78271504d281fn,
        0xfbf6e16f9b3080d5n,
        0x1d9af65982ec9f2dn,
        0xe645f129629c2ae3n,
        0x30a900ad939b462dn,
        0xb5cea6a41357e8cn,
        0x6fa17735b572f3d0n,
        0x85197ff4006ed6e3n,
        0xce777f00ecf27e76n,
        0xafd5dea589d7fd6cn,
        0xf0b5156bb82c9074n,
        0xbcae8081bdf070aan,
        0x3270e4faabae4f43n,
        0x6e6981a35d3d9e56n,
        0xf2e9702d11e9cdaan,
        0xebb7a385aa0b7b14n,
        0x9f871ce75487fd4fn,
        0xa9d3c2e6505cc686n,
        0x1fe771d6d9178793n,
        0xe6697833b841d0a0n,
        0x81d2c7de4ce1eb90n,
        0xaab97e494f2d4796n,
        0x5380b904688c7015n
      ],
      14: [
        0xb27c40266703b636n,
        0x8dedf9fb4bb00f20n,
        0x311c6eb62095eef6n,
        0xaa38d0a16ba25efen,
        0x610faa3ff0bbac67n,
        0xbf85bf0ead64b56cn,
        0x2c8d0e44e71e43a6n,
        0x91b0e1d99d9262afn,
        0x67f48ad54d0b0d1an,
        0xd56f03508c459ce2n,
        0x4dcabfb7001a9a8bn,
        0x35ce884149732d6cn,
        0xc9277d9b6e0d2648n,
        0x9b4e2c249479e1e6n,
        0x527eecfaa79ac9aan,
        0x7118e36477097749n,
        0xacf5e81e71316269n,
        0x82dc4c8e36b5229an,
        0xcb323e357922bac2n,
        0xf5b78cc7e6b3c944n,
        0xbc67f831cbc84759n,
        0xa8aa71582b70e525n,
        0x48a639d015b52908n,
        0xa9f2533683f4a9a9n,
        0x9e87e04ca2086977n,
        0x17e8392a55cee5dbn,
        0xf3b63fe1d1843324n,
        0x3c20592fc04a96c4n,
        0x4f77a665ac3c5640n,
        0xce7ae7f639820cffn,
        0x25b8fd4b32fa2de8n,
        0xbd4a9900640be0fn,
        0xfbe33b243eae0032n,
        0x9c7c737779a28903n,
        0xc4bbb7a9d98868ddn,
        0x7496276412a4def0n,
        0xe2d9de5d6a18ce4cn,
        0x935f2b0aa1384ddcn,
        0xb7e5848131c681ecn,
        0x624c69b6b24445a7n,
        0x664fa6637e8f8095n,
        0x25c73c443e75c3b4n,
        0xb00805cca7f36ae9n,
        0xe4855aa1016b6287n,
        0xdc45d539c03f3538n,
        0xe2add909c521bf2dn,
        0xc7468f591b494e15n,
        0x3805f9076cd66193n,
        0xcdda24ba2d06e8cfn,
        0xb227462cf53d4330n,
        0x76ecbdd68498e113n,
        0x8eb225790cdb1ca4n,
        0xeadf50853fcb7546n,
        0x1f115b76d92c9227n,
        0x222282e174daaebfn,
        0x76f2dbfecd29a36fn,
        0x87f8424daae65fc1n,
        0x8f15ba58fce68504n,
        0x513a7052986f9025n,
        0xc1581092f335cba3n,
        0x714c7df4e4347d51n,
        0xd0a444329cd6c852n,
        0xe45b712eb8225688n,
        0x6d3ee1dc81392443n
      ],
      17: [
        0xe1301617c2dff335n,
        0x473bd358610e6a64n,
        0xf3821cfdc083b73an,
        0x6bebac31d4f8fd72n,
        0xd5bcb8d04094ddedn,
        0x7866076514f7ce8dn,
        0xbfc00dc804f64d86n,
        0xd557b618a175dfen,
        0xf3b1025bfff9f585n,
        0x39669fa759970043n,
        0x1190f938a66fd7f7n,
        0xf510ab53c7fee39fn,
        0xa4e5b70a6d964a3n,
        0x7f194f9c1156d6dn,
        0x3f4df561f319c125n,
        0xd6d7b3b833094d35n,
        0x9f0fda8d05379ff6n,
        0x3d1148022702878bn,
        0x793b4c3220500494n,
        0x1d48a071ab61a7b1n,
        0xf2a0345990604f62n,
        0x770c779837cc863bn,
        0x41992fdfb31022f0n,
        0x5e6fea07c4536f1dn,
        0x9b1bc8952af43ab7n,
        0xf6b751f79b749245n,
        0xb7e6427cbf780e3fn,
        0xc71d5e601d5206abn,
        0x29ec8e49d1bdb8c0n,
        0x4fa03f26f6f7f0ccn,
        0x9424aed51bac5c15n,
        0xedcb8cb60692dc63n,
        0x93676a024fdc6e1bn,
        0xe87466d7ad66a1bdn,
        0x60141de9f54ad0a2n,
        0xf1043785658b2523n,
        0x32c5bd89b70b3420n,
        0x9793b9b413748146n,
        0xd4a057a7b0cc1b3bn,
        0x3e2b6091a092f52an,
        0xb27b3d901a16342cn,
        0x4d3485c5c5c14eb4n,
        0xaf2b99b4d9acd158n,
        0xce3714af99b49350n,
        0xcbd58bf61efd76e9n,
        0x90e0f4a0fbdd3933n,
        0xa8381bec85aca46n,
        0x8861fe1858e25888n,
        0xa95976636daa2e68n,
        0x11a726095eddbbbfn,
        0xa5c5650c8186a576n,
        0x33d2bce575aed2cn,
        0x6b88f83dd97dc9cdn,
        0x7d7ddbedd284476cn,
        0x6efb63b11b049863n,
        0x5cb85aedf5f62c97n,
        0xe43e4288a2b5b498n,
        0x75b17a55d4262982n,
        0x272a6d8eb5122df8n,
        0x2d174fc96f7c15ean,
        0x859131d2bbda0242n,
        0xa6846099f7294951n,
        0x9dac6e8345241ea6n,
        0xeb6c1016cee624d0n
      ],
      18: [
        0xc64ee6e389c5b31an,
        0x7701f7bb7bc67e1fn,
        0xd36357b66f81cf4fn,
        0x97ac6aa8bb2488a3n,
        0x52828d8044b591f7n,
        0x3ed8c56cda09dfa0n,
        0xef43613cd4aac9a3n,
        0x4767d76c162f8a24n,
        0x7367c28de1b294den,
        0xc01f36bf3e6dd58bn,
        0x91e1aa9676f72255n,
        0xab0e664e9c3eb2d5n,
        0x561e16d16105716bn,
        0x7e8adee70758e201n,
        0x533420e6d9d80b8dn,
        0x7cd0129d2e8d0e87n,
        0x5ad5cf06364d7c87n,
        0x4223623bcc3ebdden,
        0x4797b2c957207246n,
        0x989d9d4ae15ca666n,
        0xe14eb70db380c73an,
        0x8e48522346b98991n,
        0x8441aefd0299436an,
        0x30e912f2f2b43abfn,
        0x3dc9829015eabb27n,
        0x680bac63b856d035n,
        0x8e2007247d137018n,
        0x3d85de89c2171429n,
        0x79e13ceab0cbc61fn,
        0xb63b4dc3a559e463n,
        0x72bb912d7da67785n,
        0x46a0df5cafda613n,
        0x4b5305e517d2582en,
        0x6786d50638ba8abcn,
        0x3e493f43b118f68dn,
        0xa9f948b24e6384bbn,
        0x5e781fd794e0d3ban,
        0x8db0674679279973n,
        0x58007c0287ea7ff5n,
        0xff233d5f6cedd15dn,
        0x8ce6424dbef59fe6n,
        0x5a10412954aebd1bn,
        0x7428a656b3ee4d3bn,
        0x4e7ed827455ac762n,
        0x3b048a8b405bfdc9n,
        0xb8a6171f1ee34dc4n,
        0x50c7c006314d3441n,
        0xbe2d740a1e9b23bcn,
        0xf36cb62b892e6161n,
        0xb0ae8f08c31edbbcn,
        0x3108d4482f65fafan,
        0xbd1531c83764fbdan,
        0x46c8adfe7bf47042n,
        0x96ef2ad6b97e6703n,
        0xc29cfc0cfa02eaecn,
        0x98c7472a864e9a13n,
        0xfb02bebb48729a4dn,
        0xd52721e719bc143en,
        0x4bd6cee631b1b099n,
        0x5c62b3a23a3c563en,
        0x4d6168bd2defe193n,
        0xb540b30e039f3a25n,
        0x2067bdac88bd13d1n,
        0xba6eab94639447bn
      ],
      19: [
        0xdf56ac6f96b648an,
        0x4ac9778d8da8eee4n,
        0xf1afdb65b289f224n,
        0xa34b6cf62053da42n,
        0xc0b6fce2de53790an,
        0x1a432f0a7daa39f0n,
        0x323d342df6a8f93n,
        0x48ca765192f5df7bn,
        0x7a8d03aa782a65e0n,
        0x5738811d70c2903fn,
        0xf72ada9b2f32751en,
        0x40a26c600d270659n,
        0xdc99e04cf0e98b3bn,
        0x1d34d08e7a4c75d4n,
        0x10ba58e3d2762bdcn,
        0x7de31a516694c343n,
        0x93b7a88612f70c97n,
        0xafbb411aa1235a8cn,
        0x26d794d30db95301n,
        0xcfa701cd2631d00bn,
        0xf2f9e5fa90164161n,
        0x15ce6a664dc82a1en,
        0x3f897142fe716b14n,
        0x8edddfcd1e52d770n,
        0x6a8a616fc3b290d0n,
        0x989bc4da9b37a22bn,
        0x9e50aa42ca6dfda1n,
        0xc693da1139c6a1can,
        0x6160745985c7504bn,
        0xe893be3d7354ea6fn,
        0x4c1f55ab715629een,
        0x96a9954fdc33e1f9n,
        0x6dc7cac7fd72b050n,
        0x9191b3634e2d6645n,
        0xf6b40d09efba58bn,
        0xf5c9b0479c10c572n,
        0x19675f06bd767e35n,
        0xc342bd2bf295456en,
        0xa021c0ca3531968dn,
        0x43bfd9313605bf54n,
        0x14c8b3b4a911d192n,
        0x3d67cde92834e4c0n,
        0x8d4f5d272c7f0b79n,
        0x2812859a1337739en,
        0x68949b8d00af5b3an,
        0xb07aa066735435ean,
        0x784c2f29980402a2n,
        0x85b15fb4a8ff810n,
        0x49c13de73b4206c5n,
        0x48603b32b4fb0eb9n,
        0xdc0f2fcfb3f6fe0dn,
        0x1238d630743b65a2n,
        0x3bc1a987aff8754dn,
        0x43b9da13ec856f37n,
        0xca8f3653c9af18f8n,
        0x96fc734da003cd28n,
        0xcdccc33aa9434aa0n,
        0x32a447b2ef04e57dn,
        0x1d61fac36cd5e859n,
        0x398d1ca68b6870b5n,
        0x26242b40a5cb63a2n,
        0x44007d5ae88da719n,
        0x246998e8d39e198bn,
        0xf44704f1247ea4en
      ],
      20: [
        0xcae9b4a72a79ea68n,
        0x9854ce4e4ebfa5c3n,
        0xd3016989bfbbb17fn,
        0xebd3461691b78d8en,
        0x706c5c5649e2623dn,
        0x77fc97031fd5a423n,
        0x4dd8eb85b04d3376n,
        0x670acc5cb321bf21n,
        0x45b1ed25f1533ae8n,
        0x8a3c3b5e801ef1dan,
        0x7010f7197e695d0dn,
        0x9918ee461497d658n,
        0xe3b137fc0a3450fcn,
        0xbc0a6a5d6e996e3en,
        0x9a8cfa3c5283aac7n,
        0x69f14f140181c6en,
        0x3a9aca5e176132edn,
        0xac9ed156f63fce41n,
        0xdc4ad56bd6016237n,
        0x964db03f93403fadn,
        0x54f92fff366bad4n,
        0xc3c75611ffe3fa49n,
        0xd248a9a7ac1aa554n,
        0x9384ec2b44feacaen,
        0xc35b1c8c0a4c9f7fn,
        0x2cd94cbbc19ad58cn,
        0x84dad06a7872bdebn,
        0x7135f221a6c9537fn,
        0x473544f9ea83bf00n,
        0xff37d19c2e76128bn,
        0x6f96288295d82980n,
        0xd0725b5ca2814044n,
        0xf81401027de1bdfen,
        0x785299f4175ba98dn,
        0x6889803e5913f9d3n,
        0x5230dfbd5553b2fen,
        0x1ac70ec0ab8ddeb4n,
        0x292bd156db946570n,
        0x6961929e546e035an,
        0x7ed70ed7b194990bn,
        0xa99f131849c8a43fn,
        0x668409e3f1f8343en,
        0xc2b01cfdd045dd1cn,
        0x964fbbf8cd321b0n,
        0x168b1625746f7891n,
        0x409d360250843242n,
        0x1dad09b252c21221n,
        0xc5c5b37af85e06a1n,
        0xdd6ac7b86778043bn,
        0xd32e6dcd83bc9478n,
        0x4b6fabfcf56188n,
        0xde8ede0ba85c6e4an,
        0x764414fd8ae769edn,
        0xde051a669ca97d2n,
        0x84b871bb300568d2n,
        0x9f64eeed5c9d927dn,
        0x7f9d3e64c1a6423bn,
        0x71299889a01ac992n,
        0xd366dfcc28ebd70n,
        0x445dcc38341c6494n,
        0x218a15368c99a894n,
        0x49bc473fed7bf656n,
        0xe17f29e170286046n,
        0x7c16128db2c08394n
      ],
      21: [
        0x763fcd01f15c7b6n,
        0xa14923c2f920264cn,
        0xcc9fd3349bdf0377n,
        0xb5b453ca3d42993cn,
        0x4f8d5238288b78b5n,
        0x3802b708d03c91en,
        0x687213f98d605936n,
        0x3985fb6217dc8effn,
        0xd7665cdafe049059n,
        0x1d0bc9bde9b5c5cfn,
        0xf27292b6762172edn,
        0xa5d04d531e1242e3n,
        0x276aa6ced50755d9n,
        0xeec259dc7f95897cn,
        0x4ab7706eb77350can,
        0xb495db4e82456fb4n,
        0x6a5d932b45ff2c83n,
        0x7b85179ad5b077e0n,
        0x78e3654bfaf14ff0n,
        0x74eff5453e652603n,
        0x250741818d1fb540n,
        0x30cbd7556232b17an,
        0x9970cf60ebff8d15n,
        0xbf0d073d821c1336n,
        0x22f235f2e11b868dn,
        0x11df12d7dd30de89n,
        0xc5ce099c46b82659n,
        0xdabac50dca3dd859n,
        0x570210496a39aaa6n,
        0xc9a7d91fef2ae713n,
        0x44656d6b81fb18b3n,
        0xa81de9d20f87d0n,
        0xb9de7a3a486822b9n,
        0xd664d2644c6e27ffn,
        0x9475dbc996418cedn,
        0xa8f1e091ffb8102dn,
        0xdd81b7f57d5911c6n,
        0x7250ee18260a5962n,
        0x7bfdcc1289e06ab3n,
        0x551ac8ea585a0afan,
        0xc34b9fbb8d4a75b8n,
        0x6090d6978b1e3b9dn,
        0xeecf67d2749176f4n,
        0xde9e37575260001en,
        0xfb140bc3304b8590n,
        0x3d225c30b28f41den,
        0x620a60ac9261549dn,
        0xdb23aa8c3bcabf85n,
        0x69288e92c68a152fn,
        0x517400f80b2c782an,
        0x7914f8a8bea4ff31n,
        0xe9d68f23b489d070n,
        0x61985d54cfb87e6fn,
        0xfd08b32c62d60e93n,
        0xcada4f80a9e782d4n,
        0xa6eab79ed21c82f8n,
        0x26f05fcffb16e5dbn,
        0xf6febc0e7ecddbafn,
        0x2051acef097a1e10n,
        0xf72169bb80962718n,
        0x54fd9ad39716108en,
        0x19b17e80dea4ae17n,
        0xd85480f0dfcaf0b7n,
        0x1986b4b270b7e868n
      ],
      22: [
        0xe912b4bf86a4bae4n,
        0x3edd1f874f93d17n,
        0x24e75e8eb8f21423n,
        0xdef5768968f45bcen,
        0xf84f16b3a79fbfafn,
        0x1327f1bc2784378fn,
        0xc8120a8e78308930n,
        0x43d88870f81dbaa1n,
        0x9f8ded9756abf2f1n,
        0x65c17795b15516bcn,
        0x148f8b74a65bb1f2n,
        0x541cdfcdda0d4a5fn,
        0xaca2b148da330aa1n,
        0x889b78d5dbfdd97en,
        0xf4427e0b61484bb3n,
        0xa075e9275110b492n,
        0xe32f2e63b7fddd71n,
        0x7cea2045c268283en,
        0x8a80068ddf547e50n,
        0x9e11d2cd0930aef6n,
        0x3c19e71d118405adn,
        0xaf34cf65a193c4b2n,
        0x4991ab9bebc2026fn,
        0x3a3c8a71ff574e2bn,
        0x1723199dbf2c14a0n,
        0xfa7457616f18c108n,
        0xc2a796891933918cn,
        0xb4323070a23d4c2fn,
        0x19bad7aedf615a5cn,
        0x2a96e1e27194eae2n,
        0x4ca9cf07b1aa0f6an,
        0x769165fe746ccb9n,
        0x530a37df0bc61066n,
        0xe5dd462cbd00ef2n,
        0x5bc440f14b1a269bn,
        0x6e417d475ff595ean,
        0x3e83b91f25440fe0n,
        0x697c392387fa841an,
        0xae8a781390e0a95bn,
        0x2e183554cae28e66n,
        0x2cd1586a2b840c67n,
        0x9c07a75114374509n,
        0x61ee6c5bdeef580fn,
        0xaee1e86b9ea556aan,
        0x7f671eec3da70577n,
        0x9549c931e9af299dn,
        0x3b70b3a124a35cf2n,
        0xa34db7c5760debbbn,
        0x75a669814104a8b5n,
        0xaab612c9415d174an,
        0xe61ede900267deb3n,
        0x771ad655cdfc6ee0n,
        0x49a23a89e6b5a92cn,
        0x8beddb12ad77e82fn,
        0x12e89d1028711733n,
        0xf1faf665711533f3n,
        0xfcd6bdca5876fd09n,
        0x4c955f6a966b1964n,
        0xf6478986a3917c99n,
        0xb0b862ef6c9f82b9n,
        0x74f3310340066ff2n,
        0x4d57d880d865d69an,
        0xffd6f23232ffe294n,
        0xda743152627b41a1n
      ]
    };
  }
});

// Core/Board/move.js
var Move;
var init_move = __esm({
  "Core/Board/move.js"() {
    init_Chess_Helper();
    Move = class _Move {
      static flags = {
        quietMove: 0,
        doublePush: 1,
        kingCastle: 2,
        queenCastle: 3,
        captures: 4,
        epCapture: 5,
        knightPromotion: 8,
        bishopPromotion: 9,
        rookPromotion: 10,
        queenPromotion: 11,
        knightPromoCapture: 12,
        bishopPromoCapture: 13,
        rookPromoCapture: 14,
        queenPromoCapture: 15
      };
      static EncodeUINT16(startIndex, targetIndex, moveFlag) {
        const start = startIndex;
        const target = targetIndex << 6;
        const flag = moveFlag << 12;
        return start | target | flag;
      }
      static Start(move) {
        return move & 63;
      }
      static Target(move) {
        return move >> 6 & 63;
      }
      static Flag(move) {
        return move >> 12 & 15;
      }
      static IsPromotion(move) {
        const flag = this.Flag(move);
        return (flag & 8) != 0;
      }
      static IsCapture(move) {
        const flag = this.Flag(move);
        return (flag & 4) != 0;
      }
      static ToUCI(move) {
        const start = _Move.Start(move);
        const target = _Move.Target(move);
        const startCoord = ChessHelper.indexToLetter[start];
        const targetCoord = ChessHelper.indexToLetter[target];
        if (_Move.IsPromotion(move)) {
          const type = _Move.Flag(move) & 3;
          const letters = "kbrq";
          const promotion = letters[type];
          return startCoord + targetCoord + promotion;
        }
        return startCoord + targetCoord;
      }
      static toUINT16(UCI2, board) {
      }
    };
  }
});

// Core/Board/zobrist_hashing.js
var zobrist_hashing;
var init_zobrist_hashing = __esm({
  "Core/Board/zobrist_hashing.js"() {
    init_zobrist_hash_values();
    init_piece();
    init_move();
    zobrist_hashing = class {
      constructor() {
        this.hash = BigInt(0);
      }
      createHash(board, white_to_move) {
        this.hash = BigInt(0);
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
          const pieceType = board[squareIndex];
          this.hash ^= zobrist_hash_values[pieceType][squareIndex];
        }
        if (white_to_move) this.hash ^= hash_white_to_move;
      }
      toggleTurn() {
        this.hash ^= hash_white_to_move;
      }
      togglePiece(squareIndex, piece) {
        this.hash ^= zobrist_hash_values[piece][squareIndex];
      }
      incrementHash(move, board) {
        const start = Move.Start(move);
        const target = Move.Target(move);
        const flag = Move.Flag(move);
        const movedPiece = board.square[start];
        const capturedPiece = board.square[target];
        this.togglePiece(start, movedPiece);
        if (Move.IsCapture(move)) {
          if (flag == Move.flags.epCapture) {
            const pawn = board.square[board.enPassantSquare];
            this.togglePiece(board.enPassantSquare, pawn);
          } else {
            this.togglePiece(target, capturedPiece);
          }
        }
        let pieceToAdd = movedPiece;
        if (Move.IsPromotion(move)) {
          const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen];
          const color = movedPiece & 24;
          const pieceType = pieceTypes[flag & 3];
          pieceToAdd = color | pieceType;
        }
        this.togglePiece(target, pieceToAdd);
        if (flag == Move.flags.kingCastle) {
          const rookStart = start + 3;
          const rookTarget = start + 1;
          const rook = board.square[rookStart];
          this.togglePiece(rookStart, rook);
          this.togglePiece(rookTarget, rook);
        } else if (flag == Move.flags.queenCastle) {
          const rookStart = start - 4;
          const rookTarget = start - 1;
          const rook = board.square[rookStart];
          this.togglePiece(rookStart, rook);
          this.togglePiece(rookTarget, rook);
        }
        this.toggleTurn();
      }
    };
  }
});

// Core/Constants/AttackTables.js
var AttackTables;
var init_AttackTables = __esm({
  "Core/Constants/AttackTables.js"() {
    init_Chess_Helper();
    AttackTables = class {
      static king;
      static knight;
      static whitePawn;
      static blackPawn;
      // Lazy init: kall denne før du trenger tabellene
      static init() {
        if (this.king) return;
        this.king = new Array(64);
        this.knight = new Array(64);
        this.whitePawn = new Array(64).fill([]);
        this.blackPawn = new Array(64).fill([]);
        for (let startIndex = 0; startIndex < 64; startIndex++) {
          const moves = [];
          const west = ChessHelper.numSquaresToEdge[startIndex][0] > 0;
          const east = ChessHelper.numSquaresToEdge[startIndex][1] > 0;
          const north = ChessHelper.numSquaresToEdge[startIndex][2] > 0;
          const south = ChessHelper.numSquaresToEdge[startIndex][3] > 0;
          const dir = [west, north, east, south, west];
          const offset = [-1, 8, 1, -8, 7, 9, -7, -9];
          for (let i = 0; i < 4; i++) {
            if (dir[i]) moves.push(startIndex + offset[i]);
            if (dir[i] && dir[i + 1]) moves.push(startIndex + offset[i + 4]);
          }
          this.king[startIndex] = moves;
        }
        for (let startIndex = 0; startIndex < 64; startIndex++) {
          const moves = [];
          const data = ChessHelper.numSquaresToEdge[startIndex];
          if (data[2] >= 2 && data[0] >= 1) moves.push(startIndex + 15);
          if (data[2] >= 2 && data[1] >= 1) moves.push(startIndex + 17);
          if (data[0] >= 2 && data[2] >= 1) moves.push(startIndex + 6);
          if (data[1] >= 2 && data[2] >= 1) moves.push(startIndex + 10);
          if (data[0] >= 2 && data[3] >= 1) moves.push(startIndex - 10);
          if (data[1] >= 2 && data[3] >= 1) moves.push(startIndex - 6);
          if (data[3] >= 2 && data[0] >= 1) moves.push(startIndex - 17);
          if (data[3] >= 2 && data[1] >= 1) moves.push(startIndex - 15);
          this.knight[startIndex] = moves;
        }
        for (let startIndex = 0; startIndex < 64; startIndex++) {
          const whiteMoves = [];
          const blackMoves = [];
          const west = ChessHelper.numSquaresToEdge[startIndex][0] > 0;
          const east = ChessHelper.numSquaresToEdge[startIndex][1] > 0;
          if (west) {
            whiteMoves.push(startIndex + 7);
            blackMoves.push(startIndex - 9);
          }
          if (east) {
            whiteMoves.push(startIndex + 9);
            blackMoves.push(startIndex - 7);
          }
          if (startIndex < 56) this.whitePawn[startIndex] = whiteMoves;
          if (startIndex > 7) this.blackPawn[startIndex] = blackMoves;
        }
      }
    };
  }
});

// Core/Board/chessboard.js
var Board;
var init_chessboard = __esm({
  "Core/Board/chessboard.js"() {
    init_Chess_Helper();
    init_zobrist_hashing();
    init_piece();
    init_move();
    init_AttackTables();
    AttackTables.init();
    Board = class {
      constructor() {
        this.square = new Uint8Array(64).fill(0);
        this.white_To_Move = true;
        this.castlingRights = 15;
        this.halfMoveClock = 0;
        this.enPassantSquare = null;
        this.playedMoves = [];
        this.stack = [];
        this.repetitionTable = [];
        this.zobrist = new zobrist_hashing();
        this.pinMask = new Array(64).fill(0);
        this.blockingSquares = [];
        this.checkers = [];
      }
      Reset() {
        this.square = new Array(64).fill(0);
        this.stack = [];
        this.playedMoves = [];
      }
      //Denne funksjonen kan laste inn sjakkposisjonar frå standart sjakknotasjon (FEN)
      Load_Fen(fen) {
        this.Reset();
        const data = fen.split(" ");
        const piece_positions = data[0].split("");
        let file = 0;
        let rank = 7;
        piece_positions.forEach((char) => {
          if (char == "/") {
            file = 0;
            rank--;
          } else {
            if (!isNaN(char)) {
              file += parseInt(char);
            } else {
              let color = char == char.toLowerCase() ? Piece.black : Piece.white;
              this.square[rank * 8 + file] = color | Piece.From_Symbol[char.toLowerCase()];
              file++;
            }
          }
        });
        this.white_To_Move = data[1] == "w";
        this.castlingRights = 0;
        const castlingRights = data[2].split("");
        castlingRights.forEach((char) => {
          if (char == "-") this.castlingRights = 0;
          else if (char == "K") this.castlingRights += 8;
          else if (char == "Q") this.castlingRights += 4;
          else if (char == "k") this.castlingRights += 2;
          else if (char == "q") this.castlingRights += 1;
        });
        this.zobrist.createHash(this.square, this.white_To_Move);
        this.repetitionTable = [this.zobrist.hash];
      }
      Export_Fen() {
        let fen = "";
        for (let rank = 7; 0 <= rank; rank--) {
          let empty = 0;
          for (let file = 0; file < 8; file++) {
            const squareIndex = rank * 8 + file;
            const piece = this.square[squareIndex];
            if (piece == 0) {
              empty++;
              continue;
            }
            if (1 <= empty) {
              fen += String(empty);
            }
            empty = 0;
            const symbol = Piece.From_Number[piece];
            fen += symbol;
          }
          if (1 <= empty) fen += String(empty);
          if (0 < rank) fen += "/";
        }
        const sideToMove = this.white_To_Move ? " w " : " b ";
        fen += sideToMove;
        const lookUp = ["", "q", "k", "kq"];
        fen += lookUp[this.castlingRights >> 2 & 3].toUpperCase();
        fen += lookUp[this.castlingRights & 3];
        if (this.castlingRights == 0) fen += "-";
        if (this.enPassantSquare == null) {
          fen += " -";
        } else {
          fen += " " + String(this.enPassantSquare);
        }
        fen += " 0 0";
        return fen;
      }
      Make_Move(move) {
        const start = Move.Start(move);
        const target = Move.Target(move);
        const flag = Move.Flag(move);
        let capturedPiece = this.square[target];
        this.stack.push({
          // Posisjons info
          capturedPiece,
          castlingRights: this.castlingRights,
          enPassantSquare: this.enPassantSquare,
          hash: this.zobrist.hash
        });
        this.zobrist.incrementHash(move, this);
        this.castlingRights &= ChessHelper.updateCastleRights[start];
        this.castlingRights &= ChessHelper.updateCastleRights[target];
        if (flag == Move.flags.epCapture) {
          capturedPiece = this.square[this.enPassantSquare];
          this.square[this.enPassantSquare] = 0;
        }
        if (flag == Move.flags.doublePush) {
          this.enPassantSquare = target;
        } else {
          this.enPassantSquare = null;
        }
        let movedPiece = this.square[start];
        if (Move.IsPromotion(move)) {
          const pieceTypes = [Piece.knight, Piece.bishop, Piece.rook, Piece.queen];
          const color = movedPiece & 24;
          const pieceType = pieceTypes[flag & 3];
          movedPiece = color | pieceType;
        }
        this.square[target] = movedPiece;
        this.square[start] = 0;
        if (flag == Move.flags.kingCastle) {
          const rookSquare = start + 3;
          const targetSquare = start + 1;
          this.square[targetSquare] = this.square[rookSquare];
          this.square[rookSquare] = 0;
        } else if (flag == Move.flags.queenCastle) {
          const rookSquare = start - 4;
          const targetSquare = start - 1;
          this.square[targetSquare] = this.square[rookSquare];
          this.square[rookSquare] = 0;
        }
        this.white_To_Move = !this.white_To_Move;
        this.playedMoves.push(move);
        this.repetitionTable.push(this.zobrist.hash);
      }
      Unmake_Move(move) {
        if (this.stack.length == 0) return;
        this.white_To_Move = !this.white_To_Move;
        const previousPosition = this.stack.pop();
        this.castlingRights = previousPosition.castlingRights;
        this.enPassantSquare = previousPosition.enPassantSquare;
        this.zobrist.hash = previousPosition.hash;
        const start = Move.Start(move);
        const target = Move.Target(move);
        const flag = Move.Flag(move);
        let movedPiece = this.square[target];
        const capturedPiece = previousPosition.capturedPiece;
        const friendlyColor = this.white_To_Move ? Piece.white : Piece.black;
        if (Move.IsPromotion(move)) {
          movedPiece = Piece.pawn | friendlyColor;
        }
        this.square[start] = movedPiece;
        this.square[target] = capturedPiece;
        if (flag == Move.flags.kingCastle) {
          this.square[start + 1] = 0;
          this.square[start + 3] = Piece.rook | friendlyColor;
        } else if (flag == Move.flags.queenCastle) {
          this.square[start - 1] = 0;
          this.square[start - 4] = Piece.rook | friendlyColor;
        }
        if (flag == Move.flags.epCapture) {
          const enemyColor = this.white_To_Move ? Piece.black : Piece.white;
          this.square[this.enPassantSquare] = Piece.pawn | enemyColor;
        }
        this.playedMoves.pop();
        this.repetitionTable.pop();
      }
      computeKingSafety() {
        this.pinMask.fill(0);
        this.checkers.length = 0;
        this.blockingSquares.length = 0;
        let kings = ChessHelper.LocateKings(this);
        const friendlyKingSquare = this.white_To_Move ? kings[0] : kings[1];
        const enemyColor = this.white_To_Move ? Piece.black : Piece.white;
        const KnightAttackers = AttackTables.knight[friendlyKingSquare];
        for (let startSquare of KnightAttackers) {
          const piece = this.square[startSquare];
          if (piece == (Piece.knight | enemyColor)) {
            this.checkers.push(startSquare);
            this.blockingSquares.push(startSquare);
          }
        }
        const pawnAttackers = this.white_To_Move ? AttackTables.whitePawn[friendlyKingSquare] : AttackTables.blackPawn[friendlyKingSquare];
        for (let startSquare of pawnAttackers) {
          const piece = this.square[startSquare];
          if (piece == (Piece.pawn | enemyColor)) {
            this.checkers.push(startSquare);
            this.blockingSquares.push(startSquare);
          }
        }
        let data = ChessHelper.numSquaresToEdge[friendlyKingSquare];
        const blockingSquares = [];
        let potentialPinnedPiece;
        for (let i = 0; i < 8; i++) {
          if (2 == this.checkers.length) return;
          const otherSlidingPiece = i < 4 ? Piece.rook : Piece.bishop;
          const offset = Piece.directionOffsets[i];
          const pinType = Piece.pins[i];
          blockingSquares.length = 0;
          potentialPinnedPiece = null;
          for (let n = 0; n < data[i]; n++) {
            const target = friendlyKingSquare + offset * (n + 1);
            const pieceOnTargetSquare = this.square[target];
            blockingSquares.push(target);
            if (pieceOnTargetSquare == 0) {
              continue;
            } else if (pieceOnTargetSquare == (Piece.queen | enemyColor) || pieceOnTargetSquare == (otherSlidingPiece | enemyColor)) {
              if (potentialPinnedPiece == null) {
                this.blockingSquares = [...blockingSquares];
                this.checkers.push(target);
              } else {
                this.pinMask[potentialPinnedPiece] = pinType;
              }
              break;
            } else {
              if ((pieceOnTargetSquare & 24) == enemyColor) {
                break;
              } else {
                if (potentialPinnedPiece != null) {
                  break;
                }
                potentialPinnedPiece = target;
              }
            }
          }
        }
      }
      squareUnderAttack(squareIndex, whiteAttacks) {
        const opponentColor = whiteAttacks ? Piece.white : Piece.black;
        const knightAttacks = AttackTables.knight[squareIndex];
        for (let i = 0; i < knightAttacks.length; i++) {
          const attackIndex = knightAttacks[i];
          const piece = this.square[attackIndex];
          if (piece == (Piece.knight | opponentColor)) return true;
        }
        const kingAttacks = AttackTables.king[squareIndex];
        for (let i = 0; i < kingAttacks.length; i++) {
          const attackIndex = kingAttacks[i];
          const piece = this.square[attackIndex];
          if (piece == (Piece.king | opponentColor)) return true;
        }
        const pawnAttacks = whiteAttacks ? AttackTables.blackPawn[squareIndex] : AttackTables.whitePawn[squareIndex];
        for (let i = 0; i < pawnAttacks.length; i++) {
          const attackIndex = pawnAttacks[i];
          const piece = this.square[attackIndex];
          if (piece == (Piece.pawn | opponentColor)) return true;
        }
        for (let i = 0; i < 8; i++) {
          const offset = Piece.directionOffsets[i];
          const numSquaresToEdge = ChessHelper.numSquaresToEdge[squareIndex][i];
          const slidingPiece = i < 4 ? Piece.rook | opponentColor : Piece.bishop | opponentColor;
          for (let n = 0; n < numSquaresToEdge; n++) {
            const target = squareIndex + offset * (n + 1);
            const pieceOnTargetSquare = this.square[target];
            if (pieceOnTargetSquare == 0) {
              continue;
            } else if (pieceOnTargetSquare == (Piece.queen | opponentColor) || pieceOnTargetSquare == slidingPiece) {
              return true;
            } else {
              break;
            }
          }
        }
        return false;
      }
      InCheck(white) {
        const index = white ? 0 : 1;
        const KingSquare = ChessHelper.LocateKings(this)[index];
        return this.squareUnderAttack(KingSquare, !white);
      }
      GenerateSlidingMoves(piece, start) {
        let moves = [];
        let pieceType = piece & 7;
        let data = ChessHelper.numSquaresToEdge[start];
        let startIndex = pieceType == Piece.bishop ? 4 : 0;
        let endIndex = pieceType == Piece.rook ? 4 : 8;
        for (let i = startIndex; i < endIndex; i++) {
          const PinType = this.pinMask[start];
          const PinTypeForThisDirection = Piece.pins[i];
          if (!(PinType == 0 || PinType == PinTypeForThisDirection)) continue;
          let offset = Piece.directionOffsets[i];
          for (let n = 0; n < data[i]; n++) {
            const target = start + offset * (n + 1);
            const pieceOnTargetSquare = this.square[target];
            if (Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)) {
              break;
            }
            if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)) {
              const move2 = Move.EncodeUINT16(start, target, Move.flags.captures);
              moves.push(move2);
              break;
            }
            const move = Move.EncodeUINT16(start, target, Move.flags.quietMove);
            moves.push(move);
          }
        }
        return moves;
      }
      GenerateKnightMoves(start) {
        const pin = this.pinMask[start];
        if (pin != 0) return [];
        let targetSquares = AttackTables.knight[start];
        let moves = [];
        targetSquares.forEach((targetSquare) => {
          const pieceOnTargetSquare = this.square[targetSquare];
          if (pieceOnTargetSquare == 0) {
            const move = Move.EncodeUINT16(start, targetSquare, Move.flags.quietMove);
            moves.push(move);
          } else if (!Piece.CheckPieceColor(pieceOnTargetSquare, this.white_To_Move)) {
            const move = Move.EncodeUINT16(start, targetSquare, Move.flags.captures);
            moves.push(move);
          }
        });
        return moves;
      }
      GeneratePawnMoves(start) {
        let moves = [];
        const pawnIsWhite = this.white_To_Move;
        const dir = pawnIsWhite ? 1 : -1;
        const doublePush = pawnIsWhite ? start < 16 : 47 < start;
        const promotion = pawnIsWhite ? 47 < start : start < 16;
        const pinType = this.pinMask[start];
        const canMoveForward = pinType == Piece.pin_N_S || pinType == 0;
        for (let n = 1; n < 3; n++) {
          if (!canMoveForward) break;
          const target = start + 8 * n * dir;
          if (this.square[target] != 0) {
            break;
          }
          const flag = n == 2 ? Move.flags.doublePush : Move.flags.quietMove;
          if (promotion) {
            moves.push(Move.EncodeUINT16(start, target, Move.flags.bishopPromotion));
            moves.push(Move.EncodeUINT16(start, target, Move.flags.knightPromotion));
            moves.push(Move.EncodeUINT16(start, target, Move.flags.rookPromotion));
            moves.push(Move.EncodeUINT16(start, target, Move.flags.queenPromotion));
          } else {
            moves.push(Move.EncodeUINT16(start, target, flag));
          }
          if (!doublePush) break;
        }
        const pawnAttacks = pawnIsWhite ? AttackTables.whitePawn[start] : AttackTables.blackPawn[start];
        let epTarget = null;
        if (this.enPassantSquare != null) {
          epTarget = this.enPassantSquare + 8 * dir;
        }
        for (const target of pawnAttacks) {
          const offset = Math.abs(target - start);
          if (pinType != 0) {
            if (offset == 7 && pinType != Piece.pin_NW_SE) continue;
            if (offset == 9 && pinType != Piece.pin_NE_SW) continue;
          }
          if (target == epTarget) {
            const move = Move.EncodeUINT16(start, target, Move.flags.epCapture);
            moves.push(move);
          }
          const targetPiece = this.square[target];
          if (Piece.CheckPieceColor(targetPiece, !this.white_To_Move)) {
            if (promotion) {
              moves.push(Move.EncodeUINT16(start, target, Move.flags.bishopPromoCapture));
              moves.push(Move.EncodeUINT16(start, target, Move.flags.knightPromoCapture));
              moves.push(Move.EncodeUINT16(start, target, Move.flags.rookPromoCapture));
              moves.push(Move.EncodeUINT16(start, target, Move.flags.queenPromoCapture));
            } else {
              moves.push(Move.EncodeUINT16(start, target, Move.flags.captures));
            }
          }
        }
        return moves;
      }
      GenerateKingMoves(start) {
        let moves = [];
        const king = this.square[start];
        this.square[start] = 0;
        const kingAttacks = AttackTables.king[start];
        for (let target of kingAttacks) {
          if (this.squareUnderAttack(target, !this.white_To_Move)) continue;
          const pieceOnTargetSquare = this.square[target];
          if (pieceOnTargetSquare == 0) {
            moves.push(Move.EncodeUINT16(start, target, Move.flags.quietMove));
          }
          if (Piece.CheckPieceColor(pieceOnTargetSquare, !this.white_To_Move)) {
            moves.push(Move.EncodeUINT16(start, target, Move.flags.captures));
          }
        }
        this.square[start] = king;
        const castleRights = this.white_To_Move ? this.castlingRights >> 2 : this.castlingRights;
        const myKingSquare = this.white_To_Move ? 4 : 60;
        if ((castleRights & 2) == 2) {
          let legal = !this.squareUnderAttack(myKingSquare, !this.white_To_Move);
          for (let i = 1; i < 3; i++) {
            if (!legal) {
              break;
            }
            const squareToCheck = myKingSquare + i;
            if (this.square[squareToCheck] != 0) {
              legal = false;
            } else if (i < 3 && this.squareUnderAttack(squareToCheck, !this.white_To_Move)) {
              legal = false;
            }
          }
          if (legal) moves.push(Move.EncodeUINT16(myKingSquare, myKingSquare + 2, Move.flags.kingCastle));
        }
        if ((castleRights & 1) == 1) {
          let legal = !this.squareUnderAttack(myKingSquare, !this.white_To_Move);
          for (let i = 1; i < 4; i++) {
            const squareToCheck = myKingSquare - i;
            if (!legal) {
              break;
            }
            if (this.square[squareToCheck] != 0) {
              legal = false;
            } else if (i < 3 && this.squareUnderAttack(squareToCheck, !this.white_To_Move)) {
              legal = false;
            }
          }
          if (legal) moves.push(Move.EncodeUINT16(myKingSquare, myKingSquare - 2, Move.flags.queenCastle));
        }
        return moves;
      }
      GenerateLegalMoves() {
        let moves = [];
        this.computeKingSafety();
        if (1 < this.checkers.length) {
          const kings = ChessHelper.LocateKings(this);
          const KingSquare = this.white_To_Move ? kings[0] : kings[1];
          return this.GenerateKingMoves(KingSquare);
        }
        for (let squareIndex = 0; squareIndex < 64; squareIndex++) {
          const piece = this.square[squareIndex];
          if (piece == 0) continue;
          if (Piece.CheckPieceColor(piece, !this.white_To_Move)) continue;
          if (Piece.IsType(piece, Piece.king)) {
            moves.push(...this.GenerateKingMoves(squareIndex));
          }
          if (Piece.IsType(piece, Piece.pawn)) {
            moves.push(...this.GeneratePawnMoves(squareIndex));
          }
          if (Piece.IsType(piece, Piece.knight)) {
            moves.push(...this.GenerateKnightMoves(squareIndex));
          }
          if (Piece.IsSlidingPiece(piece)) {
            moves.push(...this.GenerateSlidingMoves(piece, squareIndex));
          }
        }
        if (this.checkers.length == 1) {
          moves = moves.filter((move) => {
            const start = Move.Start(move);
            const target = Move.Target(move);
            const piece = this.square[start];
            if (Piece.IsType(piece, Piece.king)) return true;
            if (Move.Flag(move) == Move.flags.epCapture) return true;
            return this.blockingSquares.includes(target);
          });
        }
        if (this.enPassantSquare == null) return moves;
        const filteredMoves = [];
        const colorToCheck = this.white_To_Move;
        for (let move of moves) {
          if (Move.Flag(move) == Move.flags.epCapture) {
            this.Make_Move(move);
            if (!this.InCheck(colorToCheck)) {
              filteredMoves.push(move);
            }
            this.Unmake_Move(move);
          } else {
            filteredMoves.push(move);
          }
        }
        return filteredMoves;
      }
      GenerateTacticalMoves() {
        let captureMoves = [];
        const legalMoves = this.GenerateLegalMoves();
        legalMoves.forEach((move) => {
          if (Move.IsCapture(move) || Move.IsPromotion(move)) captureMoves.push(move);
        });
        return captureMoves;
      }
    };
  }
});

// Core/Engine/Transposition_Table.js
var Transposition_Table;
var init_Transposition_Table = __esm({
  "Core/Engine/Transposition_Table.js"() {
    Transposition_Table = class {
      constructor() {
        this.table = /* @__PURE__ */ new Map();
      }
      Clear() {
        this.table = /* @__PURE__ */ new Map();
      }
      AddPosition(hash, score, depth, flag, bestMove) {
        const entry = this.table.get(hash);
        if (entry == void 0) {
          this.table.set(hash, {
            score,
            depth,
            flag,
            bestMove
          });
          return;
        }
        if (depth < entry.depth) {
          return;
        }
        this.table.set(hash, {
          score,
          depth,
          flag,
          bestMove
        });
      }
      IsValidTransposition(hash, currentDepth) {
        const entry = this.table.get(hash);
        if (entry == void 0) {
          return false;
        }
        let depthSearched = entry.depth;
        return depthSearched >= currentDepth;
      }
    };
  }
});

// Core/Engine/evaluation.js
var Evaluation;
var init_evaluation = __esm({
  "Core/Engine/evaluation.js"() {
    init_piece();
    init_Chess_Helper();
    init_move();
    Evaluation = class _Evaluation {
      static mirroredBoard = new Array(64);
      static mapFromPieceType = Array(12);
      static kingMap = [
        40,
        40,
        100,
        0,
        0,
        40,
        100,
        40,
        30,
        30,
        10,
        0,
        0,
        10,
        30,
        30,
        10,
        10,
        5,
        0,
        0,
        5,
        10,
        10,
        0,
        0,
        0,
        -10,
        -10,
        0,
        0,
        0,
        -10,
        -10,
        -10,
        -20,
        -20,
        -10,
        -10,
        -10,
        -20,
        -20,
        -20,
        -30,
        -30,
        -20,
        -20,
        -20,
        -30,
        -30,
        -30,
        -40,
        -40,
        -30,
        -30,
        -30,
        -40,
        -40,
        -40,
        -50,
        -50,
        -40,
        -40,
        -40
      ];
      static pawnMap = [
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        10,
        10,
        10,
        -10,
        -10,
        10,
        10,
        10,
        5,
        5,
        10,
        20,
        20,
        10,
        5,
        5,
        5,
        5,
        15,
        25,
        25,
        15,
        5,
        5,
        10,
        10,
        20,
        30,
        30,
        20,
        10,
        10,
        20,
        20,
        30,
        35,
        35,
        30,
        20,
        20,
        30,
        30,
        30,
        30,
        30,
        30,
        30,
        30,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ];
      static knightMap = [
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50,
        -40,
        -20,
        0,
        5,
        5,
        0,
        -20,
        -40,
        -30,
        5,
        15,
        20,
        20,
        15,
        5,
        -30,
        -30,
        10,
        20,
        30,
        30,
        20,
        10,
        -30,
        -30,
        5,
        20,
        30,
        30,
        20,
        5,
        -30,
        -30,
        0,
        15,
        20,
        20,
        15,
        0,
        -30,
        -40,
        -20,
        0,
        0,
        0,
        0,
        -20,
        -40,
        -50,
        -40,
        -30,
        -30,
        -30,
        -30,
        -40,
        -50
      ];
      static bishopMap = [
        -20,
        -10,
        -10,
        -10,
        -10,
        -10,
        -10,
        -20,
        -10,
        5,
        0,
        0,
        0,
        0,
        5,
        -10,
        -10,
        10,
        10,
        10,
        10,
        10,
        10,
        -10,
        -10,
        0,
        10,
        15,
        15,
        10,
        0,
        -10,
        -10,
        5,
        5,
        15,
        15,
        5,
        5,
        -10,
        -10,
        0,
        5,
        10,
        10,
        5,
        0,
        -10,
        -10,
        0,
        0,
        0,
        0,
        0,
        0,
        -10,
        -20,
        -10,
        -10,
        -10,
        -10,
        -10,
        -10,
        -20
      ];
      static rookMap = [
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0,
        0,
        5,
        10,
        15,
        15,
        10,
        5,
        0,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0,
        5,
        10,
        10,
        10,
        10,
        10,
        10,
        5,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        0
      ];
      static queenMap = [
        -20,
        -10,
        -10,
        -5,
        -5,
        -10,
        -10,
        -20,
        -10,
        0,
        0,
        0,
        0,
        0,
        0,
        -10,
        -10,
        0,
        5,
        5,
        5,
        5,
        0,
        -10,
        -5,
        0,
        5,
        10,
        10,
        5,
        0,
        -5,
        0,
        0,
        5,
        10,
        10,
        5,
        0,
        -5,
        -10,
        5,
        5,
        5,
        5,
        5,
        0,
        -10,
        -10,
        0,
        5,
        0,
        0,
        0,
        0,
        -10,
        -20,
        -10,
        -10,
        -5,
        -5,
        -10,
        -10,
        -20
      ];
      static {
        let i = 0;
        for (let rank = 7; rank >= 0; rank--) {
          for (let file = 0; file < 8; file++) {
            const squareIndex = rank * 8 + file;
            this.mirroredBoard[squareIndex] = i;
            i++;
          }
        }
        this.mapFromPieceType[Piece.king] = this.kingMap;
        this.mapFromPieceType[Piece.pawn] = this.pawnMap;
        this.mapFromPieceType[Piece.knight] = this.knightMap;
        this.mapFromPieceType[Piece.bishop] = this.bishopMap;
        this.mapFromPieceType[Piece.rook] = this.rookMap;
        this.mapFromPieceType[Piece.queen] = this.queenMap;
      }
      // Board
      static evaluate(board) {
        const endgameWeight = ChessHelper.CalculateEndgameWeight(board);
        let score = 0;
        const materialWeight = 1;
        const positionWeight = 1;
        const mobilityWeight = 0;
        const kingWeight = 30;
        score += this.countMaterial(board) * materialWeight;
        score += this.positionBonus(board, endgameWeight) * positionWeight;
        score += this.mobilityBonus(board) * mobilityWeight;
        score += this.forceKingToCornerWithKing(board, endgameWeight) * kingWeight;
        return score;
      }
      static countMaterial(board) {
        let materialScore = 0;
        for (let i = 0; i < 64; i++) {
          const piece = board.square[i];
          if (piece == 0) continue;
          const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1;
          materialScore += sign * Piece.getPieceValue(piece);
        }
        return materialScore;
      }
      static positionBonus(board, endgameWeight) {
        let score = 0;
        for (let i = 0; i < 64; i++) {
          const piece = board.square[i];
          if (piece == 0) continue;
          const sign = Piece.CheckPieceColor(piece, board.white_To_Move) ? 1 : -1;
          const pieceType = piece & 7;
          const mapIndex = Piece.CheckPieceColor(piece, true) ? i : _Evaluation.mirroredBoard[i];
          const bonus = _Evaluation.mapFromPieceType[pieceType][mapIndex];
          score += sign * bonus * 0.2;
        }
        return score * (1 - endgameWeight);
      }
      static mobilityBonus(board) {
        const myMobility = board.GenerateLegalMoves().length;
        return myMobility;
      }
      static forceKingToCornerWithKing(board, endgameWeight) {
        let score = 0;
        let friendlyKingSquare = 0;
        let enemyKingSquare = 0;
        for (let i = 0; i < 64; i++) {
          const piece = board.square[i];
          if (!Piece.IsType(piece, Piece.king)) continue;
          const isFriendly = Piece.CheckPieceColor(piece, board.white_To_Move);
          if (isFriendly) friendlyKingSquare = i;
          else enemyKingSquare = i;
        }
        const friendlyKingRank = ChessHelper.RankIndex(friendlyKingSquare);
        const friendlyKingFile = ChessHelper.FileIndex(friendlyKingSquare);
        const enemyKingRank = ChessHelper.RankIndex(enemyKingSquare);
        const enemyKingFile = ChessHelper.FileIndex(enemyKingSquare);
        const enemyKingDstToCenterRank = Math.abs(enemyKingRank - 3.5);
        const enemyKingDstToCenterFile = Math.abs(enemyKingFile - 3.5);
        const enemyKingDstToCenter = enemyKingDstToCenterRank + enemyKingDstToCenterFile;
        score += enemyKingDstToCenter / 7;
        const RankDistance = Math.abs(friendlyKingRank - enemyKingRank);
        const FileDistance = Math.abs(friendlyKingFile - enemyKingFile);
        const kingDistance = FileDistance + RankDistance;
        score += (14 - kingDistance) / 14;
        return score * Math.min(endgameWeight, 1);
      }
      // Moves
      static Move(move, board) {
        let score = 0;
        const start = Move.Start(move);
        const target = Move.Target(move);
        score += this.MVV_LVA_ordering(start, target, board);
        score += this.PieceSquareTables(start, target, board);
        return score;
      }
      static MVV_LVA_ordering(start, target, board) {
        let pieceTypeMoved = board.square[start] & 7;
        let pieceTypeAttacked = board.square[target] & 7;
        return Piece.pieceValues[pieceTypeAttacked] - Piece.pieceValues[pieceTypeMoved];
      }
      static PieceSquareTables(start, target, board) {
        const piece = board.square[start];
        const pieceType = piece & 7;
        const startIndex = Piece.CheckPieceColor(piece, true) ? start : _Evaluation.mirroredBoard[start];
        const targetIndex = Piece.CheckPieceColor(piece, true) ? target : _Evaluation.mirroredBoard[target];
        const bonusOld = _Evaluation.mapFromPieceType[pieceType][startIndex];
        const bonusNew = _Evaluation.mapFromPieceType[pieceType][targetIndex];
        return bonusOld - bonusNew;
      }
    };
  }
});

// Core/Engine/MoveOrdering.js
function MoveOrder(board, moves, TTbestMove) {
  let sortedMoves = moves.sort((a, b) => {
    const valueA = Evaluation.Move(a, board);
    const valueB = Evaluation.Move(b, board);
    return valueB - valueA;
  });
  if (TTbestMove != null) {
    sortedMoves = sortedMoves.filter((move) => move != TTbestMove);
    sortedMoves.unshift(TTbestMove);
  }
  return sortedMoves;
}
var init_MoveOrdering = __esm({
  "Core/Engine/MoveOrdering.js"() {
    init_evaluation();
  }
});

// Core/Constants/SearchConstants.js
var maxSearchDepth, checkMateScore, mateTreshold, drawScore;
var init_SearchConstants = __esm({
  "Core/Constants/SearchConstants.js"() {
    maxSearchDepth = 24;
    checkMateScore = 1e5;
    mateTreshold = checkMateScore - maxSearchDepth;
    drawScore = -1;
  }
});

// Core/Engine/QuiesenceSearch.js
function QuiescenceSearch(board, timeManager, ply, alpha, beta) {
  if (timeManager.ExceededTimeLimit()) return void 0;
  let moves;
  if (board.InCheck(board.white_To_Move)) {
    moves = board.GenerateLegalMoves();
  } else {
    moves = board.GenerateTacticalMoves();
  }
  if (moves.length == 0 && board.InCheck(board.white_To_Move)) {
    return -(checkMateScore - ply);
  }
  let standPat = Evaluation.evaluate(board);
  if (beta <= standPat) return standPat;
  alpha = Math.max(alpha, standPat);
  moves = MoveOrder(board, moves);
  for (let move of moves) {
    board.Make_Move(move);
    let score = -QuiescenceSearch(board, timeManager, ply + 1, -beta, -alpha);
    board.Unmake_Move(move);
    if (score >= beta) return score;
    alpha = Math.max(alpha, score);
  }
  return alpha;
}
var init_QuiesenceSearch = __esm({
  "Core/Engine/QuiesenceSearch.js"() {
    init_evaluation();
    init_MoveOrdering();
    init_SearchConstants();
  }
});

// Core/Engine/Search.js
var nodesSearched, Search;
var init_Search = __esm({
  "Core/Engine/Search.js"() {
    init_Transposition_Table();
    init_Chess_Helper();
    init_MoveOrdering();
    init_QuiesenceSearch();
    init_move();
    init_SearchConstants();
    Search = class {
      constructor(board, timeManager) {
        this.board = board;
        this.timeManager = timeManager;
        this.TT = new Transposition_Table();
        this.bestMove = null;
      }
      IterativeDeepening() {
        this.timeManager.Start();
        this.bestMove = null;
        for (let depth = 1; depth < maxSearchDepth; depth++) {
          nodesSearched = 0;
          this.currentDepth = depth;
          const score = this.Negamax(depth, 0, -Infinity, Infinity);
          if (mateTreshold <= score) {
            const mateDepth = checkMateScore - score;
            this.timeManager.Stop();
          }
          if (this.timeManager.cancelSearch) {
            break;
          }
        }
        return this.bestMove ?? this.board.GenerateLegalMoves()[0];
      }
      Negamax(depth, ply, alpha, beta) {
        if (this.timeManager.ExceededTimeLimit()) {
          return void 0;
        }
        nodesSearched++;
        if (ChessHelper.checkForRepetitions(this.board.repetitionTable)) {
          return drawScore;
        }
        const hash = this.board.zobrist.hash;
        let TTbestMove = null;
        if (this.TT.IsValidTransposition(hash, depth) && depth != this.currentDepth) {
          const entry = this.TT.table.get(hash);
          TTbestMove = entry.bestMove;
          let mutatedScore = entry.score;
          if (mateTreshold < entry.score) {
            mutatedScore = entry.score - ply;
          } else if (entry.score < -mateTreshold) {
            mutatedScore = entry.score + ply;
          }
          if (entry.flag == "EXACT") {
            return mutatedScore;
          }
          if (entry.flag == "UPPER") {
            beta = Math.min(beta, mutatedScore);
          } else if (entry.flag == "LOWER") {
            alpha = Math.max(alpha, mutatedScore);
          }
          if (alpha >= beta) {
            return mutatedScore;
          }
        }
        if (depth == 0) {
          return QuiescenceSearch(this.board, this.timeManager, ply + 1, alpha, beta);
        }
        const UnsortedlegalMoves = this.board.GenerateLegalMoves();
        if (UnsortedlegalMoves.length == 0) {
          if (this.board.InCheck(this.board.white_To_Move)) {
            const mateScore = -(checkMateScore - ply);
            this.TT.AddPosition(hash, -checkMateScore, depth, "EXACT", null);
            return mateScore;
          }
          this.TT.AddPosition(hash, drawScore, depth, "EXACT");
          return drawScore;
        }
        let moves = MoveOrder(this.board, UnsortedlegalMoves, TTbestMove);
        if (depth == this.currentDepth && this.bestMove != null) {
          moves = moves.filter((move) => move != this.bestMove);
          moves.unshift(this.bestMove);
        }
        const originalAlpha = alpha;
        let bestMoveThisIteration = null;
        for (let move of moves) {
          this.board.Make_Move(move);
          const score = -this.Negamax(depth - 1, ply + 1, -beta, -alpha);
          this.board.Unmake_Move(move);
          if (this.timeManager.cancelSearch) return void 0;
          if (alpha < score) {
            alpha = score;
            bestMoveThisIteration = move;
            if (depth == this.currentDepth) {
              this.bestMove = move;
            }
          }
          if (beta <= score) {
            let scoreToStore2 = score;
            if (mateTreshold < scoreToStore2)
              scoreToStore2 += ply;
            else if (scoreToStore2 < -mateTreshold)
              scoreToStore2 -= ply;
            this.TT.AddPosition(hash, scoreToStore2, depth, "LOWER", move);
            return score;
          }
        }
        let flag = "";
        if (alpha <= originalAlpha) flag = "UPPER";
        else if (alpha >= beta) flag = "LOWER";
        else flag = "EXACT";
        let scoreToStore = alpha;
        if (mateTreshold < scoreToStore)
          scoreToStore += ply;
        else if (scoreToStore < -mateTreshold)
          scoreToStore -= ply;
        this.TT.AddPosition(hash, scoreToStore, depth, flag, bestMoveThisIteration);
        return alpha;
      }
    };
  }
});

// Core/Engine/TimeManager.js
var TimeManager;
var init_TimeManager = __esm({
  "Core/Engine/TimeManager.js"() {
    TimeManager = class {
      constructor(timeLimitMS) {
        this.timeLimitMS = timeLimitMS;
        this.cancelSearch = false;
      }
      SetTimeLimit(time) {
        this.timeLimitMS = time;
      }
      Start() {
        this.cancelSearch = false;
        this.start = performance.now();
      }
      Stop() {
        this.cancelSearch = true;
      }
      ExceededTimeLimit() {
        const elapsedMS = performance.now() - this.start;
        this.cancelSearch = this.timeLimitMS < elapsedMS;
        return this.cancelSearch;
      }
    };
  }
});

// Core/Engine/Engine.js
var Engine_exports = {};
__export(Engine_exports, {
  Engine: () => Engine
});
var Engine;
var init_Engine = __esm({
  "Core/Engine/Engine.js"() {
    init_chessboard();
    init_Search();
    init_TimeManager();
    Engine = class {
      constructor(thinkingTime = 1e3) {
        this.board = new Board();
        this.timeManager = new TimeManager(thinkingTime);
        this.search = new Search(this.board, this.timeManager);
      }
      Reset() {
        this.board.Reset();
      }
      SetPosition(fen) {
        this.board.Load_Fen(fen);
      }
      ImportGameHistory(repetitionTable) {
        this.board.repetitionTable = repetitionTable;
      }
      ThinkingTime(thinkingTime) {
        this.timeManager.SetTimeLimit(thinkingTime);
      }
      Bestmove() {
        return this.search.IterativeDeepening();
      }
      Stop() {
        this.timeManager.Stop();
      }
    };
  }
});

// Core/UCI_Engine/UCI.js
var UCI_exports = {};
__export(UCI_exports, {
  UCI: () => UCI
});
module.exports = __toCommonJS(UCI_exports);
var readline = require("readline");
var { Engine: Engine2 } = (init_Engine(), __toCommonJS(Engine_exports));
var { Move: Move2 } = (init_piece(), __toCommonJS(piece_exports));
var UCI = class {
  constructor() {
    this.engine = new Engine2(1e3);
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
    const parts = cmd.split(" ");
    const firstWord = parts[0];
    if (firstWord === "uci") {
      this.send("id name PrebenV1");
      this.send("id author Johanens Husev\xE5g Standal");
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
    if (firstWord === "position") {
      this.handlePosition(parts);
      return;
    }
    if (firstWord === "go") {
      this.handleGo(parts);
      return;
    }
    if (firstWord === "stop") {
      this.engine.Stop();
    }
    if (firstWord === "quit") {
      process.exit(0);
    }
  }
  handlePosition(parts) {
    if (parts[1] == "startpos") {
      this.engine.SetPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    } else if (parts[1] == "fen") {
      let fen = "";
      parts.slice(2, 8).forEach((part) => {
        fen += part + " ";
      });
      this.engine.SetPosition(fen);
    }
    const movesIndex = parts.indexOf("moves");
    if (0 <= movesIndex) {
      const UCIMoves = parts.slice(movesIndex + 1, parts.length);
      for (const UCImove of UCIMoves) {
        const move = decodeMove(UCImove, this.engine.board);
        this.engine.board.Make_Move(move);
      }
    }
  }
  handleGo(parts) {
    const whiteTimeIndex = parts.indexOf("wtime");
    const blackTimeIndex = parts.indexOf("btime");
    let wTime = 1e4;
    let bTime = 1e4;
    if (0 <= whiteTimeIndex) {
      wTime = parseInt(parts[whiteTimeIndex + 1]);
    }
    if (0 <= whiteTimeIndex) {
      bTime = parseInt(parts[blackTimeIndex + 1]);
    }
    const myTimeLeft = this.engine.board.white_To_Move ? wTime : bTime;
    const thinkingTime = Math.max(100, myTimeLeft / 30);
    this.engine.ThinkingTime(thinkingTime);
    const bestMove = this.engine.Bestmove().CoordinatesNotation();
    this.send(`bestmove ${bestMove}`);
  }
  send(msg) {
    process.stdout.write(msg + "\n");
  }
};
function decodeMove(UCIMove, board) {
  const parts = UCIMove.split("");
  const letterToNumber = {
    "a": 0,
    "b": 1,
    "c": 2,
    "d": 3,
    "e": 4,
    "f": 5,
    "g": 6,
    "h": 7
  };
  const start = letterToNumber[parts[0]] + (parseInt(parts[1]) - 1) * 8;
  const target = letterToNumber[parts[2]] + (parseInt(parts[3]) - 1) * 8;
  let flag = 0;
  if (board.square[target] != 0) {
    flag += 4;
  }
  if (parts.length == 5) {
    const letterToFlag = {
      "n": Move2.flags.knightPromotion,
      "b": Move2.flags.bishopPromotion,
      "r": Move2.flags.rookPromotion,
      "q": Move2.flags.queenPromotion
    };
    flag += letterToFlag[parts[4]];
  }
  if (UCIMove == "e1g1" || UCIMove == "e8g8") flag = Move2.flags.kingCastle;
  if (UCIMove == "e1c1" || UCIMove == "e8c8") flag = Move2.flags.queenCastle;
  if (target == board.enPassantSquare) flag = Move2.enPassantSquare;
  return new Move2(start, target, flag);
}
new UCI();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UCI
});
//# sourceMappingURL=engine.cjs.map
