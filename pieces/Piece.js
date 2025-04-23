export default class Piece {
    constructor(color) {
        this.color = color;
    }
    getFENChar() { return ''; }
    getMoves(from, state) { return []; }
}
