// core/check.js
import { inBounds } from './utils.js';

export function isInCheck(state, color) {
    // locate our king
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const p = state.board[r][f];
            if (p && p.constructor.name === 'King' && p.color === color) {
                kingPos = { rank: r, file: f };
                break;
            }
        }
        if (kingPos) break;
    }
    return isSquareAttacked(state, kingPos, color);
}

export function isSquareAttacked(state, square, color) {
    const enemy = color === 'w' ? 'b' : 'w';
    const { rank, file } = square;

    // 1) Pawn attacks
    // Enemy pawns move “down” for white‐king, “up” for black‐king
    const pawnDir = color === 'w' ? -1 : 1;
    for (const df of [-1, 1]) {
        const r = rank + pawnDir, f = file + df;
        if (inBounds(r, f)) {
            const p = state.board[r][f];
            if (p && p.color === enemy && p.type === 'pawn') return true;
        }
    }

    // 2) Knight jumps
    const knightOffsets = [
        [ 2,  1], [ 2, -1], [-2,  1], [-2, -1],
        [ 1,  2], [ 1, -2], [-1,  2], [-1, -2]
    ];
    for (const [dr, df] of knightOffsets) {
        const r = rank + dr, f = file + df;
        if (inBounds(r, f)) {
            const p = state.board[r][f];
            if (p && p.color === enemy && p.type === 'knight') return true;
        }
    }

    // 3) Bishop/Queen diagonal rays
    const diagDirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
    for (const [dr, df] of diagDirs) {
        let r = rank + dr, f = file + df;
        while (inBounds(r, f)) {
            const p = state.board[r][f];
            if (p) {
                if (p.color === enemy && (p.type === 'bishop' || p.type === 'queen')) {
                    return true;
                }
                break;  // blocked by any piece
            }
            r += dr; f += df;
        }
    }

    // 4) Rook/Queen straight rays
    const straightDirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dr, df] of straightDirs) {
        let r = rank + dr, f = file + df;
        while (inBounds(r, f)) {
            const p = state.board[r][f];
            if (p) {
                if (p.color === enemy && (p.type === 'rook' || p.type === 'queen')) {
                    return true;
                }
                break;
            }
            r += dr; f += df;
        }
    }

    // 5) King adjacency (opposing king next to this square)
    for (let dr = -1; dr <= 1; dr++) {
        for (let df = -1; df <= 1; df++) {
            if (!dr && !df) continue;
            const r = rank + dr, f = file + df;
            if (inBounds(r, f)) {
                const p = state.board[r][f];
                if (p && p.color === enemy && p.type === 'king') {
                    return true;
                }
            }
        }
    }

    return false;
}
