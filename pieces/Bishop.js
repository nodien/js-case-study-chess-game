import Piece from './Piece.js';
import { inBounds } from '../core/utils.js';

export default class Bishop extends Piece {
    constructor(color) {
        super(color);
        this.type = 'bishop';
    }
    getFENChar() { return this.color === 'w' ? 'B' : 'b'; }

    getMoves(from, state) {
        const moves = [];
        const dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
        dirs.forEach(([dr, df]) => {
            let r = from.rank + dr, f = from.file + df;
            while (inBounds(r, f)) {
                const t = state.board[r][f];
                if (!t) {
                    moves.push({ from, to: { rank: r, file: f } });
                } else {
                    if (t.color !== this.color) {
                        moves.push({ from, to: { rank: r, file: f } });
                    }
                    break;
                }
                r += dr; f += df;
            }
        });
        return moves;
    }
}
