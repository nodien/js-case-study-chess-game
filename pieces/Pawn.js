// pieces/Pawn.js
import Piece from './Piece.js';
import { inBounds, coordsToNotation } from '../core/utils.js';
import Queen from './Queen.js';
import Rook from './Rook.js';
import Bishop from './Bishop.js';
import Knight from './Knight.js';

export default class Pawn extends Piece {
    constructor(color) {
        super(color);
        this.type = 'pawn';
    }
    getFENChar() {
        return this.color === 'w' ? 'P' : 'p';
    }

    getMoves(from, state) {
        const moves = [];
        const dir = this.color === 'w' ? -1 : 1;
        const startRank = this.color === 'w' ? 6 : 1;
        const r1 = from.rank + dir;

        // 1) Forward moves
        if (inBounds(r1, from.file) && !state.board[r1][from.file]) {
            const base = { from, to: { rank: r1, file: from.file } };
            // Promotion
            if (r1 === 0 || r1 === 7) {
                [Queen, Rook, Bishop, Knight].forEach(Promo => {
                    moves.push({ ...base, promotion: Promo });
                });
            } else {
                moves.push(base);
            }
            // Double-step
            const r2 = from.rank + 2 * dir;
            if (from.rank === startRank && inBounds(r2, from.file) && !state.board[r2][from.file]) {
                moves.push({ from, to: { rank: r2, file: from.file } });
            }
        }

        // 2) Captures & en passant
        for (const df of [-1, 1]) {
            const cf = from.file + df;
            if (!inBounds(r1, cf)) continue;

            const target = state.board[r1][cf];
            const base   = { from, to: { rank: r1, file: cf } };

            // Normal capture
            if (target && target.color !== this.color) {
                if (r1 === 0 || r1 === 7) {
                    [Queen, Rook, Bishop, Knight].forEach(Promo => {
                        moves.push({ ...base, promotion: Promo });
                    });
                } else {
                    moves.push(base);
                }
            }

            // En passant
            if (!target && state.enPassant === coordsToNotation({ rank: r1, file: cf })) {
                moves.push({ ...base, enPassant: true });
            }
        }

        return moves;
    }
}
