import { parseFEN, generateFEN } from './fen.js';
import { makeMove } from './move.js';
import { undoMove } from './undo.js';
import { getLegalMoves } from './validator.js';
import { isInCheck } from './check.js';

export class GameState {
    constructor(fen = null) {
        this.history = [];
        this.loadFEN(fen);
    }

    static START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    loadFEN(fen) {
        const f = fen || GameState.START_FEN;
        const { board, activeColor, castlingRights, enPassant, halfmoveClock, fullmoveNumber } = parseFEN(f);
        this.board = board;
        this.activeColor = activeColor;
        this.castlingRights = castlingRights; // e.g., 'KQkq'
        this.enPassant = enPassant;           // e.g., 'e3' or null
        this.halfmoveClock = halfmoveClock;
        this.fullmoveNumber = fullmoveNumber;
        this.history = [];
    }

    generateFEN() {
        return generateFEN({
            board: this.board,
            activeColor: this.activeColor,
            castlingRights: this.castlingRights,
            enPassant: this.enPassant,
            halfmoveClock: this.halfmoveClock,
            fullmoveNumber: this.fullmoveNumber,
        });
    }

    getLegalMoves() {
        return getLegalMoves(this);
    }

    makeMove(move) {
        const record = makeMove(this, move);
        this.history.push(record);
        this.activeColor = this.activeColor === 'w' ? 'b' : 'w';
    }

    undoMove() {
        const record = this.history.pop();
        if (record) {
            undoMove(this, record);
            this.activeColor = this.activeColor === 'w' ? 'b' : 'w';
        }
    }

    // inside your GameState class, after existing methods:

    isCheck() {
        return isInCheck(this, this.activeColor);
    }

    isCheckmate() {
        return this.getLegalMoves().length === 0 && this.isCheck();
    }

    isStalemate() {
        return this.getLegalMoves().length === 0 && !this.isCheck();
    }

    hasInsufficientMaterial() {
        // collect all pieces except kings
        const others = this.board.flat().filter(p => p && p.type !== 'king');
        if (others.length === 0) return true;                         // K vs K
        if (others.length === 1) {                                   // K+B vs K  or  K+N vs K
            return ['bishop','knight'].includes(others[0].type);
        }
        if (others.length === 2) {                                   // K+B vs K+B (same color bishops)
            return others.every(p => p.type === 'bishop' && p.color === others[0].color);
        }
        return false;
    }

    isDraw() {
        if (this.halfmoveClock >= 100) return true;                  // 50 full moves
        if (this.hasInsufficientMaterial()) return true;
        return !!this.isStalemate();
    }
}
