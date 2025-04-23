import Pawn   from '../pieces/Pawn.js';
import Rook   from '../pieces/Rook.js';
import Knight from '../pieces/Knight.js';
import Bishop from '../pieces/Bishop.js';
import Queen  from '../pieces/Queen.js';
import King   from '../pieces/King.js';

export function parseFEN(fen) {
    const parts = fen.split(' ');
    const rows  = parts[0].split('/');
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));

    rows.forEach((row, r) => {
        let file = 0;
        for (const c of row) {
            if (/[1-8]/.test(c)) {
                file += parseInt(c, 10);
            } else {
                const color = c === c.toUpperCase() ? 'w' : 'b';
                let piece;
                switch (c.toLowerCase()) {
                    case 'p': piece = new Pawn(color);   break;
                    case 'r': piece = new Rook(color);   break;
                    case 'n': piece = new Knight(color); break;
                    case 'b': piece = new Bishop(color); break;
                    case 'q': piece = new Queen(color);  break;
                    case 'k': piece = new King(color);   break;
                }
                board[r][file] = piece;
                file++;
            }
        }
    });

    return {
        board,
        activeColor:   parts[1],
        castlingRights:parts[2],
        enPassant:     parts[3] === '-' ? null : parts[3],
        halfmoveClock: parseInt(parts[4], 10),
        fullmoveNumber:parseInt(parts[5], 10),
    };
}

export function generateFEN({
                                board, activeColor,
                                castlingRights, enPassant,
                                halfmoveClock, fullmoveNumber
                            }) {
    const rows = board.map(rank => {
        let empty = 0, str = '';
        rank.forEach(square => {
            if (!square) empty++;
            else {
                if (empty) { str += empty; empty = 0; }
                str += square.getFENChar();
            }
        });
        if (empty) str += empty;
        return str;
    });

    return [
        rows.join('/'),
        activeColor,
        castlingRights || '-',
        enPassant     || '-',
        halfmoveClock,
        fullmoveNumber
    ].join(' ');
}
