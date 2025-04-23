import Piece from './Piece.js';
import { inBounds } from '../core/utils.js';
import { isSquareAttacked } from '../core/check.js';

export default class King extends Piece {
    constructor(color) {
        super(color);
        this.type = 'king';
    }
    getFENChar() { return this.color === 'w' ? 'K' : 'k'; }

    getMoves(from, state) {
        const moves = [];
        // One-step moves
        for (let dr = -1; dr <= 1; dr++) {
            for (let df = -1; df <= 1; df++) {
                if (dr || df) {
                    const r = from.rank + dr, f = from.file + df;
                    if (inBounds(r, f)) {
                        const t = state.board[r][f];
                        if (!t || t.color !== this.color) {
                            moves.push({ from, to: { rank: r, file: f } });
                        }
                    }
                }
            }
        }

        // Castling
        const rights = state.castlingRights;
        const row = this.color === 'w' ? 7 : 0;
        // Kingside
        if ((this.color==='w'?rights.includes('K'):rights.includes('k'))
            && !state.board[row][5] && !state.board[row][6]
            && !isSquareAttacked(state, {rank:row,file:4}, this.color)
            && !isSquareAttacked(state, {rank:row,file:5}, this.color)
            && !isSquareAttacked(state, {rank:row,file:6}, this.color)
        ) {
            moves.push({ from, to: { rank: row, file: 6 }, castle: 'K' });
        }
        // Queenside
        if ((this.color==='w'?rights.includes('Q'):rights.includes('q'))
            && !state.board[row][1] && !state.board[row][2] && !state.board[row][3]
            && !isSquareAttacked(state, {rank:row,file:4}, this.color)
            && !isSquareAttacked(state, {rank:row,file:3}, this.color)
            && !isSquareAttacked(state, {rank:row,file:2}, this.color)
        ) {
            moves.push({ from, to: { rank: row, file: 2 }, castle: 'Q' });
        }

        return moves;
    }
}
