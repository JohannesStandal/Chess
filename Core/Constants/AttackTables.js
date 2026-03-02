// attackTable.js
import { ChessHelper } from "../Utils/Chess_Helper.js";

export class AttackTables {
  static king;
  static knight;
  static whitePawn;
  static blackPawn;

  // Lazy init: kall denne før du trenger tabellene
  static init() {
    if (this.king) return; // allerede initialisert

    this.king = new Array(64);
    this.knight = new Array(64);
    this.whitePawn = new Array(64).fill([]);
    this.blackPawn = new Array(64).fill([]);

    // King moves
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

    // Knight moves
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

    // Pawn moves
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
}