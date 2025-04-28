// main.js

import { GameState }        from './core/gameState.js';
import { renderBoard }      from './ui/renderer.js';
import { notationToCoords, coordsToNotation } from './core/utils.js';
import Queen                from './pieces/Queen.js';
import Rook                 from './pieces/Rook.js';
import Bishop               from './pieces/Bishop.js';
import Knight               from './pieces/Knight.js';

const state     = new GameState();
const boardEl   = document.getElementById('board');
const fenInput  = document.getElementById('fenInput');
const setFenBtn = document.getElementById('setFenBtn');
const resetBtn  = document.getElementById('resetBtn');
const undoBtn   = document.getElementById('undoBtn');
const moveList  = document.getElementById('moveList');
const flipBtn   = document.getElementById('flipBtn');

let selected    = null;
let legalMoves  = [];
let moveHistory = [];  // array of strings

/** redraw board & preserve history display */
function updateBoard() {
    const dests = legalMoves.map(m => m.to);
    renderBoard(state, boardEl, selected, dests);
    renderHistory();
}

function renderHistory() {
    const tbody = document.querySelector('#moveTable tbody');
    tbody.innerHTML = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
        const whiteMove = moveHistory[i] || '';
        const blackMove = moveHistory[i+1] || '';
        const tr = document.createElement('tr');
        const tdW = document.createElement('td');
        const tdB = document.createElement('td');
        tdW.textContent = whiteMove;
        tdB.textContent = blackMove;
        tr.appendChild(tdW);
        tr.appendChild(tdB);
        tbody.appendChild(tr);
    }
}


// --- controls handlers ---
setFenBtn.addEventListener('click', () => {
    const fen = fenInput.value.trim();
    if (!fen) return alert('Please enter a FEN string.');
    try {
        state.loadFEN(fen);
        moveHistory = [];
        selected    = null;
        legalMoves  = [];
        updateBoard();
    } catch (err) {
        alert('Invalid FEN:\n' + err.message);
    }
});

resetBtn.addEventListener('click', () => {
    state.loadFEN();
    fenInput.value = GameState.START_FEN;
    moveHistory = [];
    selected    = null;
    legalMoves  = [];
    updateBoard();
});

flipBtn.addEventListener('click', () => {
    boardEl.classList.toggle('flipped');
});

undoBtn.addEventListener('click', () => {
    state.undoMove();
    moveHistory.pop();
    selected    = null;
    legalMoves  = [];
    updateBoard();
});

// --- board click handler ---
boardEl.addEventListener('click', e => {
    const sq = e.target.closest('td')?.dataset.square;
    if (!sq) return;
    const { rank, file } = notationToCoords(sq);

    if (!selected) {
        const piece = state.board[rank][file];
        if (piece && piece.color === state.activeColor) {
            selected   = { rank, file };
            legalMoves = state.getLegalMoves()
                .filter(m => m.from.rank === rank && m.from.file === file);
        }
    } else {
        const dests = legalMoves.filter(m => m.to.rank === rank && m.to.file === file);
        if (dests.length) {
            // choose promotion if needed
            let move;
            if (dests.length === 1) {
                move = dests[0];
            } else {
                const choice = window.prompt(
                    'Promote to (Q=Queen, R=Rook, B=Bishop, N=Knight)?',
                    'Q'
                )?.toUpperCase();
                const promoMap = { Q: Queen, R: Rook, B: Bishop, N: Knight };
                const Pcls = promoMap[choice] || Queen;
                move = dests.find(m => m.promotion === Pcls) || dests[0];
            }

            state.makeMove(move);

            // record history entry
            const fromSq = coordsToNotation(move.from);
            const toSq   = coordsToNotation(move.to);
            const promo  = move.promotion ? `=${move.promotion.name.charAt(0)}` : '';
            moveHistory.push(`${fromSq}→${toSq}${promo}`);

            // end‐of‐game alerts
            if (state.isCheckmate()) {
                const winner = state.activeColor === 'w' ? 'Black' : 'White';
                alert(`${winner} wins by checkmate!`);
            } else if (state.isStalemate()) {
                alert('Draw by stalemate.');
            } else if (state.isDraw()) {
                alert('Draw.');
            }
        }

        selected   = null;
        legalMoves = [];
    }

    updateBoard();
});



// initial render
updateBoard();
