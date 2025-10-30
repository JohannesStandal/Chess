const zobristTable = new Array(64).fill(null).map(() => ({
    10: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    11: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    12: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    13: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    14: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    9: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    18: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    19: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    20: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    21: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    22: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)),
    17: BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
}));

const zobristBlackToMove = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

function GenerateZobristHash(board, isBlackToMove) {
    let hash = BigInt(0);

    for (let i = 0; i < 64; i++) {
        let piece = board[i]; // F.eks. 'P' for hvit bonde, 'n' for svart springer
        if (piece && zobristTable[i][piece]) {
            hash ^= zobristTable[i][piece];
        }
    }

    // Legg til trekkfarge
    if (isBlackToMove) {
        hash ^= zobristBlackToMove;
    }

    return hash;
}