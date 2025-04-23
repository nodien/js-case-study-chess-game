import { isInCheck } from './check.js';

export function getLegalMoves(state) {
    const legal = [];
    const side  = state.activeColor;

    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const piece = state.board[r][f];
            if (piece && piece.color === side) {
                const from  = { rank: r, file: f };
                const moves = piece.getMoves(from, state).filter(m => {
                    state.makeMove(m);
                    const ok = !isInCheck(state, side);
                    state.undoMove();
                    return ok;
                });
                legal.push(...moves);
            }
        }
    }

    return legal;
}
