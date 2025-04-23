export function undoMove(state, record) {
    const {
        move, piece, target,
        castlingRights, enPassant,
        halfmoveClock, fullmoveNumber
    } = record;
    const { from, to, castle, enPassant: ep } = move;

    // Restore metadata
    state.castlingRights = castlingRights;
    state.enPassant      = enPassant;
    state.halfmoveClock  = halfmoveClock;
    state.fullmoveNumber = fullmoveNumber;

    // Restore board snapshot
    state.board = state.board.map(r => r.slice());

    if (castle && piece.constructor.name === 'King') {
        // Reverse castling: king back + rook back
        const dir = to.file - from.file > 0 ? 1 : -1;
        const rookFromFile = dir > 0 ? 7 : 0;
        const rookToFile   = from.file + dir;

        state.board[from.rank][from.file] = piece;
        state.board[to.rank][to.file]     = null;
        const rook = state.board[from.rank][rookToFile];
        state.board[from.rank][rookToFile] = null;
        state.board[from.rank][rookFromFile] = rook;
    } else {
        // Regular or en passant
        if (ep) {
            state.board[from.rank][from.file] = piece;
            state.board[to.rank][to.file]     = null;
            state.board[from.rank][to.file]   = target;
        } else {
            state.board[from.rank][from.file] = piece;
            state.board[to.rank][to.file]     = target;
        }
    }
}
