import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { styles } from './styles';

function Square(props) {
    return (
        <button
            onClick={props.onClick}
            style={props.style} // Style depending on a kind of sign
            className={props.isWinningSquare} // styling depending on the fact the square caused win or not
        >
            {props.value}
        </button> // The div above added to be rotated
    );
}

function SequenceButton(props) {
    return (
        <button
            className='changeBtn' 
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}
  
class Board extends React.Component {
    // The function checks if the square caused win and should be highlighted. Parameters: nr of a square, array of 3 squares numbers that caused win
    checkSquares(i, threeSquares) {
        for (let j = 0; j < 3; j++) {
            if (threeSquares[j]===i) {
                return 'square winningSquares';
            }
        }
        return 'square';
    }

    renderSquare(i) {
        return (
            <Square
                key={'square #' + i + 1} // I've decided that unique keys will be 1-9, not 0-8
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                isWinningSquare={this.props.winningSquares ? this.checkSquares(i, this.props.winningSquares) : "square"} // if there are winningSquares - we check if one of them is currently compiled and assign proper highlighting class if necessary
                style={this.props.squares[i]==='x' ? styles.cross : styles.circle}
            />
        );
    }

    createRow(x) { // starting number for a first square in a row (should be passed 1, 4 or 7)
        let squaresInRow = [];
        for (let i = 0; i < 3; i++) { // We want to generate exactly 3 squares
            squaresInRow.push(this.renderSquare(x));
            x++;
        }
        return squaresInRow;
    }

    createTable() {
        let table = [];
        for (let n = 0; n < 7; n+=3) {
            table.push(<div key={'row #' + (n/3 + 1)} className="board-row">{this.createRow(n)}</div>);
        }
        return table;
    }

    render() {
        return (
            <div>
                {this.createTable()}
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            coordinatesHistory: [],
            isDescending: false
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1); // The array of objects like in the line below
        const current = history[history.length - 1]; // Object with the value of an array of squares from the last move e.g.: squares: ['O', null, null, null, null, 'X', 'X', null, null]
        const squares = current.squares.slice(); // Extracting the copy of an array described in the line above

        let coordinatesHistory = this.state.coordinatesHistory.slice(0, this.state.stepNumber); // if jump() function changed stepNumber - the slice method "cuts out" history with "future" moves

        if (calculateWinner(squares)[0] || squares[i]) return; // if  we have a winner or the clicked square is already filled - the function won't do anything more

        squares[i] = this.state.xIsNext ? 'x' : 'o';

        // Assigning the coordinates of the last move
        let coordinates;
        switch (i) {
            case 0:
                coordinates = {
                    column: 1,
                    row: 1
                }
                break; 
            case 1:
                coordinates = {
                    column: 2,
                    row: 1
                }
                break; 
            case 2:
                coordinates = {
                    column: 3,
                    row: 1
                }
                break; 
            case 3:
                coordinates = {
                    column: 1,
                    row: 2
                }
                break; 
            case 4:
                coordinates = {
                    column: 2,
                    row: 2
                }
                break; 
            case 5:
                coordinates = {
                    column: 3,
                    row: 2
                }
                break; 
            case 6:
                coordinates = {
                    column: 1,
                    row: 3
                }
                break; 
            case 7:
                coordinates = {
                    column: 2,
                    row: 3
                }
                break; 
            default:
                coordinates = {
                    column: 3,
                    row: 3
                }
        }

        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length, // here the history array is shortened  when we jump to one of previous moves
            xIsNext: !this.state.xIsNext,
            coordinatesHistory: coordinatesHistory.concat([coordinates]), // concat merges two arrays and without affecting them returns a brand new one
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    toggleOrder() {
        this.setState({
            isDescending: !this.state.isDescending
        });
    }

    // Checking if there are empty squares
    isDraw(allSquares) {      
        let emptySlots = allSquares.filter(square => square === null);
        return emptySlots.length===0 ? true : false;
    }

        // Finally, we will modify the Game component’s render method from always rendering the last move to rendering the currently selected move according to stepNumber:
    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
            // If there is a winner - calculateWinner returns an array with X or O on first position and winning squares e.g. [0, 1, 2] on the second one.
        const winnerAndWinningSquares = calculateWinner(current.squares); 
        const winner = winnerAndWinningSquares[0];
        const winningSquares = winnerAndWinningSquares[1];

        const isItDescending = this.state.isDescending;

        const moves = history.map((step, move) => {
                // If ascending - the conditional statement changes move value
            if (isItDescending) { 
                let moveOpposite = history.length - 1;
                move = moveOpposite - move;
            }

            const stepDescription = move ?
                `Go to move # ${move} (${this.state.coordinatesHistory[move - 1].column}, ${this.state.coordinatesHistory[move - 1].row})`:
                'Go to game start';
            return (
                <li key={move}>
                    <button 
                        onClick={() => this.jumpTo(move)}
                        style={move === this.state.stepNumber ? styles.currentMoveRecord : styles.moveRecord} // If we render currently selected item - bold text
                        // style={move === this.state.stepNumber ? 'moveBtns' : 'moveBtns currentMoveBtn'}
                    >
                        {stepDescription}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
          status = 'Winner: ' + winner;
        } else if (this.isDraw(current.squares)) {
            status = 'Draw!';
        } else {
          status = 'Next player: ' + (this.state.xIsNext ? 'x' : 'o');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        winningSquares={winningSquares} // null or a winning trinity
                    />
                </div>
                <div className="game-info">
                    <div className='status'>{status}</div>
                    <div>
                        <SequenceButton 
                            value={this.state.isDescending ? 'Set in ascending order ' : 'Set in descending order'} 
                            onClick={() => this.toggleOrder()}
                        />
                    </div>
                    <ol reversed={this.state.isDescending ? true : false} className='moveList'>{moves}</ol>
                </div>
            </div>
        );
    }
}

  // ========================================
  
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

// As an argument (in parameter below) will be provided an array of squares from the last move, e.g.: ['O', null, null, null, null, 'X', 'X', null, null]
function calculateWinner(squares) { 
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
];

for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [squares[a], lines[i]]; // Returns the array with a winning sign ('x' or 'o') and an array with numbers of squares which caused a win
    }
}
    return [null, null];
}