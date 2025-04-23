
export function renderBoard(state, container, selected = null, legalMoves = []) {
    container.innerHTML = '';
    const table = document.createElement('table');

    for (let r = 0; r < 8; r++) {
        const row = table.insertRow();
        for (let f = 0; f < 8; f++) {
            const cell = row.insertCell();

            cell.className = (r + f) % 2 === 0 ? 'light' : 'dark';
            cell.dataset.square = `${String.fromCharCode(97 + f)}${8 - r}`;

            if (selected && selected.rank === r && selected.file === f) {
                cell.classList.add('selected');
            }

            if (legalMoves.some(m => m.rank === r && m.file === f)) {
                cell.classList.add('dot');
            }

            const piece = state.board[r][f];
            if (piece) {
                const fenChar = piece.getFENChar();
                const color   = fenChar === fenChar.toUpperCase() ? 'w' : 'b';
                const type    = fenChar.toUpperCase();
                const img     = document.createElement('img');
                img.src       = `./img/${color}${type}.png`;
                img.alt       = `${color}${type}`;
                cell.appendChild(img);
            }
        }
    }

    container.appendChild(table);
}
