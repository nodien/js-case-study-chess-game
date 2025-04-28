import { GameState }        from './core/gameState.js';
import { renderBoard }      from './ui/renderer.js';
import { notationToCoords, coordsToNotation } from './core/utils.js';
import Queen                from './pieces/Queen.js';
import Rook                 from './pieces/Rook.js';
import Bishop               from './pieces/Bishop.js';
import Knight               from './pieces/Knight.js';
import FkNoobBot_v1         from './bot/fkNoobBot_v1.js';

const state         = new GameState();
const boardEl       = document.getElementById('board');
const fenInput      = document.getElementById('fenInput');
const setFenBtn     = document.getElementById('setFenBtn');
const resetBtn      = document.getElementById('resetBtn');
const undoBtn       = document.getElementById('undoBtn');
const flipBtn       = document.getElementById('flipBtn');
const botSideSelect = document.getElementById('botSide');
// Now read the static UI checkbox instead of injecting it
const botToggle     = document.getElementById('enableBot');

let selected    = null;
let legalMoves  = [];
let moveHistory = [];
let bot         = null;

function updateBoard() {
    const dests = legalMoves.map(m => m.to);
    renderBoard(state, boardEl, selected, dests);
    renderHistory();
}

function renderHistory() {
    const tbody = document.querySelector('#moveTable tbody');
    tbody.innerHTML = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
        const whiteMove = moveHistory[i]   || '';
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

function handleBotMove(move) {
    state.makeMove(move);
    const fromSq = coordsToNotation(move.from);
    const toSq   = coordsToNotation(move.to);
    const promo  = move.promotion ? `=${move.promotion.name.charAt(0)}` : '';
    moveHistory.push(`${fromSq}→${toSq}${promo}`);

    if (state.isCheckmate()) {
        const winner = state.activeColor === 'w' ? 'Black' : 'White';
        alert(`${winner} wins by checkmate!`);
    } else if (state.isStalemate()) {
        alert('Draw by stalemate.');
    } else if (state.isDraw()) {
        alert('Draw.');
    }

    selected   = null;
    legalMoves = [];
    updateBoard();

    if (botToggle.checked && state.activeColor === bot.color) {
        bot.makeMove(state, handleBotMove);
    }
}

function setupBot() {
    const humanColor = botSideSelect.value;
    const botColor   = humanColor === 'w' ? 'b' : 'w';
    bot = new FkNoobBot_v1(botColor);
}

botSideSelect.addEventListener('change', () => {
    const humanColor = botSideSelect.value;
    const placement  = GameState.START_FEN.split(' ')[0];
    // Always start with White to move
    const initialFen = `${placement} w KQkq - 0 1`;

    state.loadFEN(initialFen);
    fenInput.value  = initialFen;
    moveHistory     = [];
    selected        = null;
    legalMoves      = [];

    if (humanColor === 'b') boardEl.classList.add('flipped');
    else                 boardEl.classList.remove('flipped');

    setupBot();
    updateBoard();

    if (botToggle.checked && state.activeColor === bot.color) {
        bot.makeMove(state, handleBotMove);
    }
});

// Initialize on load
botSideSelect.dispatchEvent(new Event('change'));

setFenBtn.addEventListener('click', () => {
    const fen = fenInput.value.trim();
    if (!fen) return alert('Please enter a FEN string.');
    try {
        state.loadFEN(fen);
        moveHistory = [];
        selected    = null;
        legalMoves  = [];
        boardEl.classList.remove('flipped');
        setupBot();
        updateBoard();
    } catch (err) {
        alert('Invalid FEN:\n' + err.message);
    }
});

resetBtn.addEventListener('click', () => {
    const placement  = GameState.START_FEN.split(' ')[0];
    const defaultFen = `${placement} w KQkq - 0 1`;

    state.loadFEN(defaultFen);
    fenInput.value = defaultFen;
    moveHistory = [];
    selected    = null;
    legalMoves  = [];
    boardEl.classList.remove('flipped');
    setupBot();
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

boardEl.addEventListener('click', e => {
    const sq = e.target.closest('td')?.dataset.square;
    if (!sq) return;
    const { rank, file } = notationToCoords(sq);
    const piece = state.board[rank][file];

    // (Re)select your own piece
    if (piece && piece.color === state.activeColor) {
        selected   = { rank, file };
        legalMoves = state.getLegalMoves()
            .filter(m => m.from.rank === rank && m.from.file === file);
        updateBoard();
        return;
    }

    // If a piece is selected, attempt move
    if (selected) {
        const dests = legalMoves.filter(
            m => m.to.rank === rank && m.to.file === file
        );
        if (dests.length) {
            let move = dests[0];
            if (dests.length > 1) {
                const choice     = window.prompt('Promote to (Q,R,B,N)?','Q')?.toUpperCase();
                const promoMap   = { Q:Queen, R:Rook, B:Bishop, N:Knight };
                const Pcls       = promoMap[choice] || Queen;
                move             = dests.find(m => m.promotion === Pcls) || move;
            }

            state.makeMove(move);
            const fromSq = coordsToNotation(move.from);
            const toSq   = coordsToNotation(move.to);
            const promo  = move.promotion ? `=${move.promotion.name.charAt(0)}` : '';
            moveHistory.push(`${fromSq}→${toSq}${promo}`);

            if      (state.isCheckmate()) alert(`${state.activeColor==='w'?'Black':'White'} wins!`);
            else if (state.isStalemate()) alert('Draw by stalemate.');
            else if (state.isDraw())      alert('Draw.');

            selected   = null;
            legalMoves = [];
            updateBoard();

            if (botToggle.checked && state.activeColor === bot.color) {
                bot.makeMove(state, handleBotMove);
            }
        }
    }
});
