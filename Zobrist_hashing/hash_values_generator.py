"""
This is a subsection of the chess engine. The purpose of this file is to 
generete a table of values for the Zobrist hashing.
"""

import random
import json

class Piece:
    # Brikker (lavere bits)
    none   = 0b00_000
    king   = 0b00_001
    pawn   = 0b00_010
    knight = 0b00_011
    bishop = 0b00_100
    rook   = 0b00_101
    queen  = 0b00_110

    # Farger (øverste bits)
    white  = 0b01_000
    black  = 0b10_000


pieces = {
    Piece.white | Piece.king,
    Piece.white | Piece.queen,
    Piece.white | Piece.rook,
    Piece.white | Piece.bishop,
    Piece.white | Piece.knight,
    Piece.white | Piece.pawn,
    Piece.black | Piece.king,
    Piece.black | Piece.queen,
    Piece.black | Piece.rook,
    Piece.black | Piece.bishop,
    Piece.black | Piece.knight,
    Piece.black | Piece.pawn,
}

BOARD_SIZE = 64  # 8x8 brett


def generate_zobrist_table():
    random.seed(42)
    table = {}

    for value in pieces:
        # Generer 64 tilfeldige 64-bit heltall som vanlige tall (ikke strenger)
        table[value] = [random.getrandbits(64) for _ in range(BOARD_SIZE)]

    return table


def write_js_file(table, filename="zobrist_hash_values.js"):
    # Konverter tallene til "BigInt"-notasjon (0x...n) slik at JS beholder 64-bit-verdi
    # JS Numbers mister presisjon over 53 bit, så BigInt er tryggere
    js_ready = {
        str(k): [f"0x{v:x}n" for v in vals]
        for k, vals in table.items()
    }

    # Lag JS-filinnhold
    js_lines = [
        "// Auto-generert Zobrist-hashtabell (64-bit BigInt-verdier)",
        "// Generert med Python\n",
        "export const zobrist_hash_values = {"
    ]
    for key, values in js_ready.items():
        js_lines.append(f"    {key}: [")
        # del verdiene i grupper på 4 per linje for lesbarhet
        for i in range(0, len(values), 4):
            chunk = ", ".join(values[i:i+4])
            js_lines.append(f"        {chunk},")
        js_lines.append("    ],")
    js_lines.append("};\n")

    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(js_lines))

    print(f"✅ Filen '{filename}' ble generert med {len(table)} brikketyper × {BOARD_SIZE} felter.")


if __name__ == "__main__":
    table = generate_zobrist_table()
    write_js_file(table)