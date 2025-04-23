export function inBounds(r, f) {
    return r >= 0 && r < 8 && f >= 0 && f < 8;
}
export function notationToCoords(sq) {
    return {
        file: sq.charCodeAt(0) - 97,
        rank: 8 - parseInt(sq[1], 10)
    };
}
export function coordsToNotation({ rank, file }) {
    return String.fromCharCode(97 + file) + (8 - rank);
}
