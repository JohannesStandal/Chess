import chess.pgn
import json

def analyser_pgn(filnavn, antall_trekk=12):
    resultater = []

    with open(filnavn, encoding="utf-8") as pgn:
        while True:
            game = chess.pgn.read_game(pgn)
            if game is None:
                break

            opening_name = game.headers.get("Opening", "Ukjent åpning")

            trekk = []
            board = game.board()
            for i, move in enumerate(game.mainline_moves()):
                if i >= antall_trekk:
                    break

                # Rokade-handtering
                if board.is_castling(move):
                    if board.is_kingside_castling(move):
                        trekk.append("o-o")
                    elif board.is_queenside_castling(move):
                        trekk.append("o-o-o")
                else:
                    # Bruk berre "til"-feltet frå UCI, f.eks. "b1c3" → "c3"
                    trekk.append(move.uci()[2:4])

                board.push(move)

            resultater.append({
                "opening": opening_name,
                "moves": trekk
            })

    return resultater


def lagre_som_json(data, filnavn="åpningsdata.json"):
    with open(filnavn, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"✅ Lagra {len(data)} partier til '{filnavn}'.")


if __name__ == "__main__":
    spilldata = analyser_pgn("Openings/twic1607.pgn", antall_trekk=12)
    lagre_som_json(spilldata)