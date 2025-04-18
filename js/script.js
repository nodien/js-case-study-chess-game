// ===== Chess Game Logic ===== //

// === Globals ===
const startFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let initialPosition = parseFEN(startFEN);
let currentTurn = "w";
let enPassantSquare = null;
let selected = null;

let castlingRights = {
    w: { kingside: true, queenside: true },
    b: { kingside: true, queenside: true },
};

renderBoard();

// === Utility ===
function oppositeColor(color) {
    return color === "w" ? "b" : "w";
}

function parseFEN(fen) {
    const rows = fen.split(" ")[0].split("/");
    const board = [];
    for (let row of rows) {
        const boardRow = [];
        for (let char of row) {
            if (!isNaN(char)) {
                for (let i = 0; i < Number(char); i++) boardRow.push("");
            } else {
                const color = char === char.toUpperCase() ? "w" : "b";
                const piece = char.toUpperCase();
                boardRow.push(color + piece);
            }
        }
        board.push(boardRow);
    }
    return board;
}

// === Piece Movement Validators (add your isValidPawnMove, Knight, Bishop, etc. here) ===

function isLegalPieceMove(fromRow, fromCol, toRow, toCol, color, type) {
    switch (type) {
        case "P": return isValidPawnMove(fromRow, fromCol, toRow, toCol, color);
        case "N": return isValidKnightMove(fromRow, fromCol, toRow, toCol, color);
        case "B": return isValidBishopMove(fromRow, fromCol, toRow, toCol, color);
        case "R": return isValidRookMove(fromRow, fromCol, toRow, toCol, color);
        case "Q": return isValidQueenMove(fromRow, fromCol, toRow, toCol, color);
        case "K": return isValidKingMove(fromRow, fromCol, toRow, toCol, color);
        default: return false;
    }
}

function getLegalMoves(row, col) {
    const piece = initialPosition[row][col];
    if (!piece) return [];

    const color = piece[0];
    const type = piece[1];
    let moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isLegalPieceMove(row, col, r, c, color, type)) {
                const backup = JSON.parse(JSON.stringify(initialPosition));
                initialPosition[r][c] = initialPosition[row][col];
                initialPosition[row][col] = "";

                if (!isInCheck(color)) moves.push({ row: r, col: c });
                initialPosition = backup;
            }
        }
    }

    if (type === "K") {
        if (canCastleKingside(color)) moves.push({ row, col: 6 });
        if (canCastleQueenside(color)) moves.push({ row, col: 2 });
    }

    return moves;
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = initialPosition[fromRow][fromCol];
    const color = piece[0];
    const type = piece[1];

    if (color !== currentTurn) return false;

    const legalMoves = getLegalMoves(fromRow, fromCol);
    const isLegal = legalMoves.some(m => m.row === toRow && m.col === toCol);
    if (!isLegal) return false;

    if (type === "K" && Math.abs(toCol - fromCol) === 2) {
        const side = toCol === 6 ? "kingside" : "queenside";
        applyCastlingMove(color, side);
    } else if (type === "P" && initialPosition[toRow][toCol] === "" && fromCol !== toCol) {
        applyEnPassantMove(fromRow, fromCol, toRow, toCol, color);
    } else {
        initialPosition[toRow][toCol] = piece;
        initialPosition[fromRow][fromCol] = "";
    }

    if (type === "P") {
        handlePromotion(toRow, toCol, color);
    }

    if (type === "P" && Math.abs(toRow - fromRow) === 2) {
        enPassantSquare = { row: (fromRow + toRow) / 2, col: fromCol };
    } else {
        enPassantSquare = null;
    }

    if (type === "K") {
        castlingRights[color].kingside = false;
        castlingRights[color].queenside = false;
    } else if (type === "R") {
        if (fromCol === 0) castlingRights[color].queenside = false;
        else if (fromCol === 7) castlingRights[color].kingside = false;
    }

    currentTurn = oppositeColor(currentTurn);
    return true;
}

function isCheckmate(color) {
    if (!isInCheck(color)) return false;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialPosition[row][col];
            if (piece && piece[0] === color) {
                const moves = getLegalMoves(row, col);
                if (moves.length > 0) return false;
            }
        }
    }
    return true;
}

function isStalemate(color) {
    if (isInCheck(color)) return false;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialPosition[row][col];
            if (piece && piece[0] === color) {
                const moves = getLegalMoves(row, col);
                if (moves.length > 0) return false;
            }
        }
    }
    return true;
}

function handleSquareClick(row, col) {
    const piece = initialPosition[row][col];

    if (selected) {
        const moved = makeMove(selected.row, selected.col, row, col);
        selected = null;
        renderBoard();

        if (moved) {
            if (isCheckmate(currentTurn)) alert(`${oppositeColor(currentTurn)} wins by checkmate!`);
            else if (isStalemate(currentTurn)) alert(`Game drawn by stalemate!`);
        }
        return;
    }

    if (piece && piece[0] === currentTurn) {
        selected = { row, col };
        renderBoard(getLegalMoves(row, col));
    }
}

function renderBoard(highlightedMoves = []) {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");
            square.className = `square ${(row + col) % 2 === 0 ? "light" : "dark"}`;

            if (highlightedMoves.some(m => m.row === row && m.col === col)) {
                square.classList.add("highlight");
            }

            square.addEventListener("click", () => handleSquareClick(row, col));

            const piece = initialPosition[row][col];
            if (piece) {
                const pieceDiv = document.createElement("div");
                pieceDiv.className = `piece ${piece}`;
                square.appendChild(pieceDiv);
            }

            boardElement.appendChild(square);
        }
    }
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);

    let r = fromRow + rowStep;
    let c = fromCol + colStep;

    while (r !== toRow || c !== toCol) {
        if (initialPosition[r][c] !== "") return false;
        r += rowStep;
        c += colStep;
    }

    return true;
}


// === Piece Validators ===
function isValidRookMove(fromRow, fromCol, toRow, toCol, color) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    if (!isPathClear(fromRow, fromCol, toRow, toCol)) return false;
    const target = initialPosition[toRow][toCol];
    if (target && target[0] === color) return false;
    return true;
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff !== colDiff) return false;
    if (!isPathClear(fromRow, fromCol, toRow, toCol)) return false;
    const target = initialPosition[toRow][toCol];
    if (target && target[0] === color) return false;
    return true;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    const isLShape = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    if (!isLShape) return false;
    const target = initialPosition[toRow][toCol];
    if (target && target[0] === color) return false;
    return true;
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol, color) {
    return (
        isValidRookMove(fromRow, fromCol, toRow, toCol, color) ||
        isValidBishopMove(fromRow, fromCol, toRow, toCol, color)
    );
}

function isValidKingMove(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (rowDiff <= 1 && colDiff <= 1) {
        const target = initialPosition[toRow][toCol];
        if (!target || target[0] !== color) {
            return true;
        }
    }

    return false;
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol, color) {
    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const target = initialPosition[toRow][toCol];

    if (colDiff === 0 && rowDiff === direction && target === "") return true;
    if (
        colDiff === 0 &&
        rowDiff === 2 * direction &&
        fromRow === startRow &&
        initialPosition[fromRow + direction][fromCol] === "" &&
        target === ""
    ) return true;
    if (
        Math.abs(colDiff) === 1 &&
        rowDiff === direction &&
        target !== "" &&
        target[0] !== color
    ) return true;

    return canEnPassant(fromRow, fromCol, toRow, toCol, color);
}

// === En Passant ===
function canEnPassant(fromRow, fromCol, toRow, toCol, color) {
    if (!enPassantSquare) return false;
    const direction = color === "w" ? -1 : 1;
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    return (
        rowDiff === direction &&
        Math.abs(colDiff) === 1 &&
        toRow === enPassantSquare.row &&
        toCol === enPassantSquare.col
    );
}

function applyEnPassantMove(fromRow, fromCol, toRow, toCol, color) {
    const capturedPawnRow = color === "w" ? toRow + 1 : toRow - 1;
    initialPosition[toRow][toCol] = initialPosition[fromRow][fromCol];
    initialPosition[fromRow][fromCol] = "";
    initialPosition[capturedPawnRow][toCol] = "";
}

// === Promotion ===
function handlePromotion(row, col, color) {
    const piece = initialPosition[row][col];
    if (piece[1] !== "P") return;
    const promotionRow = color === "w" ? 0 : 7;
    if (row === promotionRow) {
        initialPosition[row][col] = color + "Q";
    }
}

// === Castling ===
function canCastleKingside(color) {
    const row = color === "w" ? 7 : 0;
    if (!castlingRights[color].kingside) return false;
    if (initialPosition[row][5] !== "" || initialPosition[row][6] !== "") return false;
    if (
        isSquareUnderAttack(row, 4, oppositeColor(color)) ||
        isSquareUnderAttack(row, 5, oppositeColor(color)) ||
        isSquareUnderAttack(row, 6, oppositeColor(color))
    ) return false;
    return true;
}

function canCastleQueenside(color) {
    const row = color === "w" ? 7 : 0;
    if (!castlingRights[color].queenside) return false;
    if (initialPosition[row][1] !== "" || initialPosition[row][2] !== "" || initialPosition[row][3] !== "") return false;
    if (
        isSquareUnderAttack(row, 4, oppositeColor(color)) ||
        isSquareUnderAttack(row, 3, oppositeColor(color)) ||
        isSquareUnderAttack(row, 2, oppositeColor(color))
    ) return false;
    return true;
}

function applyCastlingMove(color, side) {
    const row = color === "w" ? 7 : 0;
    if (side === "kingside") {
        initialPosition[row][4] = "";
        initialPosition[row][7] = "";
        initialPosition[row][6] = color + "K";
        initialPosition[row][5] = color + "R";
    } else {
        initialPosition[row][4] = "";
        initialPosition[row][0] = "";
        initialPosition[row][2] = color + "K";
        initialPosition[row][3] = color + "R";
    }
    castlingRights[color].kingside = false;
    castlingRights[color].queenside = false;
}

// === Check Detection ===
function isPawnAttacking(fromRow, fromCol, toRow, toCol, color) {
    const direction = color === "w" ? -1 : 1;
    return (
        toRow === fromRow + direction &&
        Math.abs(toCol - fromCol) === 1
    );
}

function isSquareUnderAttack(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = initialPosition[r][c];
            if (!piece || piece[0] !== byColor) continue;
            const type = piece[1];
            let valid = false;
            switch (type) {
                case "P": valid = isPawnAttacking(r, c, row, col, byColor); break;
                case "N": valid = isValidKnightMove(r, c, row, col, byColor); break;
                case "B": valid = isValidBishopMove(r, c, row, col, byColor); break;
                case "R": valid = isValidRookMove(r, c, row, col, byColor); break;
                case "Q": valid = isValidQueenMove(r, c, row, col, byColor); break;
                case "K":
                    const rowDiff = Math.abs(row - r);
                    const colDiff = Math.abs(col - c);
                    valid = rowDiff <= 1 && colDiff <= 1;
                    break;
            }
            if (valid) return true;
        }
    }
    return false;
}

function isInCheck(color) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = initialPosition[r][c];
            if (piece === color + "K") {
                return isSquareUnderAttack(r, c, oppositeColor(color));
            }
        }
    }
    return false;
}

function resetGame() {
    initialPosition = parseFEN(startFEN);
    currentTurn = "w";
    castlingRights = {
        w: { kingside: true, queenside: true },
        b: { kingside: true, queenside: true },
    };
    enPassantSquare = null;
    selected = null;
    renderBoard();
} // END
