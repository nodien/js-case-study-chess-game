import { coordsToNotation } from './utils.js';
import Pawn from '../pieces/Pawn.js';
import Rook from '../pieces/Rook.js';
import King from '../pieces/King.js';

export function makeMove(state, move) {
    const { from, to, promotion, castle, enPassant } = move;
    const piece = state.board[from.rank][from.file];
    const target = enPassant
        ? state.board[from.rank][to.file]
        : state.board[to.rank][to.file];

    const prev = {
        move,
        piece,
        target,
        castlingRights: state.castlingRights,
        enPassant: state.enPassant,
        halfmoveClock: state.halfmoveClock,
        fullmoveNumber: state.fullmoveNumber,
    };

    // Reset enPassant
    state.enPassant = null;

    // Pawn double-step → set en passant target
    if (piece instanceof Pawn && Math.abs(to.rank - from.rank) === 2) {
        const epRank = (from.rank + to.rank) / 2;
        state.enPassant = coordsToNotation({ rank: epRank, file: from.file });
    }

    // Castling
    if (castle && piece instanceof King) {
        const dir = to.file - from.file > 0 ? 1 : -1;
        const rookFromFile = dir > 0 ? 7 : 0;
        const rookToFile = from.file + dir;

        // Move king
        state.board[to.rank][to.file] = piece;
        state.board[from.rank][from.file] = null;
        // Move rook
        const rook = state.board[from.rank][rookFromFile];
        state.board[from.rank][rookFromFile] = null;
        state.board[from.rank][rookToFile] = rook;
        // Remove castling rights
        const flag = piece.color === 'w'
            ? (dir > 0 ? 'K' : 'Q')
            : (dir > 0 ? 'k' : 'q');
        state.castlingRights = state.castlingRights.replace(flag, '');
    } else {
        // En passant capture
        if (enPassant && piece instanceof Pawn) {
            state.board[from.rank][from.file] = null;
            state.board[to.rank][to.file] = piece;
            state.board[from.rank][to.file] = null;
        } else {
            // Normal move or promotion
            state.board[to.rank][to.file] = promotion
                ? new promotion(piece.color)
                : piece;
            state.board[from.rank][from.file] = null;
        }

        // Update castling rights if king or rook moves/captured
        const rights = state.castlingRights.split('');
        // King moved: remove both
        if (piece instanceof King) {
            ['K','Q'].forEach(r => {
                const flag = piece.color === 'w' ? r : r.toLowerCase();
                const idx = rights.indexOf(flag);
                if (idx >= 0) rights.splice(idx, 1);
            });
        }
        // Rook moved: remove specific
        if (piece instanceof Rook) {
            const flag = piece.color === 'w'
                ? (from.file === 0 ? 'Q' : from.file === 7 ? 'K' : null)
                : (from.file === 0 ? 'q' : from.file === 7 ? 'k' : null);
            const idx = flag ? rights.indexOf(flag) : -1;
            if (idx >= 0) rights.splice(idx, 1);
        }
        // Rook captured: remove specific
        if (target instanceof Rook) {
            const flag = target.color === 'w'
                ? (to.file === 0 ? 'Q' : to.file === 7 ? 'K' : null)
                : (to.file === 0 ? 'q' : to.file === 7 ? 'k' : null);
            const idx = flag ? rights.indexOf(flag) : -1;
            if (idx >= 0) rights.splice(idx, 1);
        }
        state.castlingRights = rights.join('') || '-';
    }

    // Halfmove clock
    if (piece instanceof Pawn || target) state.halfmoveClock = 0;
    else state.halfmoveClock++;

    // Fullmove number
    if (state.activeColor === 'b') state.fullmoveNumber++;

    return prev;
}
