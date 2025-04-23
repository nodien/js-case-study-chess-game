import Piece from './Piece.js';
import { inBounds } from '../core/utils.js';

export default class Knight extends Piece {
    constructor(color) {
        super(color);
        this.type = 'knight';
    }
    getFENChar() { return this.color === 'w' ? 'N' : 'n'; }

    getMoves(from, state) {
        const moves = [];
        const jumps = [
            [ 2, 1 ], [ 2, -1 ], [ -2, 1 ], [ -2, -1 ],
            [ 1, 2 ], [ 1, -2 ], [ -1, 2 ], [ -1, -2 ]
        ];
        jumps.forEach(([dr, df]) => {
            const r = from.rank + dr, f = from.file + df;
            if (inBounds(r, f)) {
                const t = state.board[r][f];
                if (!t || t.color !== this.color) {
                    moves.push({ from, to: { rank: r, file: f } });
                }
            }
        });
        return moves;
    }
}
