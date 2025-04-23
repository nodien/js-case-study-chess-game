import Piece from './Piece.js';
import Rook from './Rook.js';
import Bishop from './Bishop.js';

export default class Queen extends Piece {
    constructor(color) {
        super(color);
        this.type = 'queen';
    }
    getFENChar() { return this.color === 'w' ? 'Q' : 'q'; }

    getMoves(from, state) {
        return [
            ...new Rook(this.color).getMoves(from, state),
            ...new Bishop(this.color).getMoves(from, state)
        ];
    }
}
