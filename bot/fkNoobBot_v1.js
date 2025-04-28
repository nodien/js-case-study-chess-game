// /bot/fkNoobBot_v1.js


export default class FkNoobBot_v1 {
    constructor(color = 'b', delay = 100, depth = 3) {
        this.color = color;
        this.delay = delay;
        this.depth = depth;
        this.PST   = this.initPieceSquareTables();
        this.values = { p:100, n:320, b:330, r:500, q:900, k:20000 };
    }

    makeMove(state, onMove) {
        setTimeout(() => {
            const { move } = this.minimax(state, this.depth, -Infinity, Infinity, true);
            onMove(move);
        }, this.delay);
    }

    minimax(state, depth, alpha, beta, maximizing) {
        if (depth === 0 || state.isCheckmate() || state.isStalemate() || state.isDraw()) {
            return { score: this.evaluate(state), move: null };
        }
        let bestMove = null;
        let moves = state.getLegalMoves();
        moves = this.orderMoves(state, moves);

        if (maximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                state.makeMove(move);
                const nextMax = state.activeColor === this.color;
                const { score } = this.minimax(state, depth - 1, alpha, beta, nextMax);
                state.undoMove();
                if (score > maxEval) { maxEval = score; bestMove = move; }
                alpha = Math.max(alpha, maxEval);
                if (beta <= alpha) break;
            }
            return { score: maxEval, move: bestMove };
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                state.makeMove(move);
                const nextMax = state.activeColor === this.color;
                const { score } = this.minimax(state, depth - 1, alpha, beta, nextMax);
                state.undoMove();
                if (score < minEval) { minEval = score; bestMove = move; }
                beta = Math.min(beta, minEval);
                if (beta <= alpha) break;
            }
            return { score: minEval, move: bestMove };
        }
    }

    /**
     * Order moves: captures first, sorted by MVV/LVA; others keep original order.
     */
    orderMoves(state, moves) {
        return moves
            .map(move => {
                const attacker = state.board[move.from.rank][move.from.file];
                const victim = state.board[move.to.rank][move.to.file];
                const attackerVal = attacker ? this.values[attacker.type.toLowerCase()] : 0;
                const victimVal   = victim   ? this.values[victim.type.toLowerCase()]   : 0;
                const score = victimVal ? (victimVal * 100 - attackerVal) : 0;
                return { move, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(item => item.move);
    }

    evaluate(state) {
        let score = 0;
        // material & PST
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const piece = state.board[r][f];
                if (!piece) continue;
                const key = piece.type.charAt(0).toLowerCase();
                const v   = this.values[key] || 0;
                const pstRow = piece.color === this.color ? r : 7 - r;
                const pstCol = piece.color === this.color ? f : 7 - f;
                const pst   = this.PST[key]?.[pstRow]?.[pstCol] ?? 0;
                const side  = piece.color === this.color ? 1 : -1;
                score += side * (v + pst);
            }
        }
        // mobility factor
        const myMoves = state.getLegalMoves().length;
        const orig = state.activeColor;
        state.activeColor = this.color === 'w' ? 'b' : 'w';
        const oppMoves = state.getLegalMoves().length;
        state.activeColor = orig;
        score += 10 * (myMoves - oppMoves);
        return score;
    }


    initPieceSquareTables() {
        const pawnPST = [
            [ 0,   0,   0,   0,   0,   0,   0,   0],
            [ 5,  10,  10, -20, -20,  10,  10,   5],
            [ 5,  -5, -10,   0,   0, -10,  -5,   5],
            [ 0,   0,   0,  20,  20,   0,   0,   0],
            [ 5,   5,  10,  25,  25,  10,   5,   5],
            [10,  10,  20,  30,  30,  20,  10,  10],
            [50,  50,  50,  50,  50,  50,  50,  50],
            [ 0,   0,   0,   0,   0,   0,   0,   0]
        ];
        const knightPST = [
            [-50, -40, -30, -30, -30, -30, -40, -50],
            [-40, -20,   0,   0,   0,   0, -20, -40],
            [-30,   0,  10,  15,  15,  10,   0, -30],
            [-30,   5,  15,  20,  20,  15,   5, -30],
            [-30,   0,  15,  20,  20,  15,   0, -30],
            [-30,   5,  10,  15,  15,  10,   5, -30],
            [-40, -20,   0,   5,   5,   0, -20, -40],
            [-50, -40, -30, -30, -30, -30, -40, -50]
        ];
        const bishopPST = [
            [-20, -10, -10, -10, -10, -10, -10, -20],
            [-10,   0,   0,   0,   0,   0,   0, -10],
            [-10,   0,   5,  10,  10,   5,   0, -10],
            [-10,   5,   5,  10,  10,   5,   5, -10],
            [-10,   0,  10,  10,  10,  10,   0, -10],
            [-10,  10,  10,  10,  10,  10,  10, -10],
            [-10,   5,   0,   0,   0,   0,   5, -10],
            [-20, -10, -10, -10, -10, -10, -10, -20]
        ];
        const rookPST = [
            [  0,   0,   0,   5,   5,   0,   0,   0],
            [ -5,   0,   0,   0,   0,   0,   0,  -5],
            [ -5,   0,   0,   0,   0,   0,   0,  -5],
            [ -5,   0,   0,   0,   0,   0,   0,  -5],
            [ -5,   0,   0,   0,   0,   0,   0,  -5],
            [ -5,   0,   0,   0,   0,   0,   0,  -5],
            [  5,  10,  10,  10,  10,  10,  10,   5],
            [  0,   0,   0,   0,   0,   0,   0,   0]
        ];
        const queenPST = [
            [-20, -10, -10,  -5,  -5, -10, -10, -20],
            [-10,   0,   0,   0,   0,   0,   0, -10],
            [-10,   0,   5,   5,   5,   5,   0, -10],
            [ -5,   0,   5,   5,   5,   5,   0,  -5],
            [  0,   0,   5,   5,   5,   5,   0,  -5],
            [-10,   5,   5,   5,   5,   5,   0, -10],
            [-10,   0,   5,   0,   0,   0,   0, -10],
            [-20, -10, -10,  -5,  -5, -10, -10, -20]
        ];
        const kingPST = [
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-30, -40, -40, -50, -50, -40, -40, -30],
            [-20, -30, -30, -40, -40, -30, -30, -20],
            [-10, -20, -20, -20, -20, -20, -20, -10],
            [ 20,  20,   0,   0,   0,   0,  20,  20],
            [ 20,  30,  10,   0,   0,  10,  30,  20]
        ];
        return { p: pawnPST, n: knightPST, b: bishopPST, r: rookPST, q: queenPST, k: kingPST };
    }
}