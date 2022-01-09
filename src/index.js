import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
	const style = {};
	if (props.focus) {
		style.border = "2px solid #999";
	}
	if (props.coloured) {
		style.background = "#00FF00";
	}

	return (
		<button className="square" style={style} onClick={props.onClick}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		const focus = i === this.props.lastMove ? true : false;
		const coloured = this.props.winCombo.includes(i) ? true : false;

		return (
			<Square
				value={this.props.squares[i]}
				focus={focus}
				coloured={coloured}
				onClick={() => this.props.onClick(i)}
			/>
		);
	}

	render() {
		let board = [];
		for (let row = 0; row < 3; row++) {
			let boardRow = [];
			for (let col = 0; col < 3; col++) {
				boardRow.push(
					<span key={row * 3 + col}>
						{this.renderSquare(row * 3 + col)}
					</span>
				);
			}
			board.push(
				<div key={row} className="board-row">
					{boardRow}
				</div>
			);
		}

		return <div>{board}</div>;
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{ squares: Array(9).fill(null), lastMove: null }],
			stepNumber: 0,
			xIsNext: true,
			mvListOrder: null,
		};
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();

		if (Game.calculateWinner(squares)[0] || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? "X" : "O";

		this.setState({
			history: history.concat([{ squares: squares, lastMove: i }]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext,
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: step % 2 === 0,
		});
	}

	toggleOrder() {
		const order = this.state.mvListOrder ? null : "reversed";
		this.setState({
			mvListOrder: order,
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const [winner, winCombo] = Game.calculateWinner(current.squares);
		let status;
		if (winner) {
			status = `Winner: ${winner}`;
		} else {
			if (!current.squares.includes(null)) {
				status = "Game Over, It's a Draw!";
			} else {
				status = `Current player: ${this.state.xIsNext ? "X" : "O"}`;
			}
		}

		const moves = history.map((step, turn) => {
			let desc;
			if (turn) {
				desc = `${turn % 2 === 0 ? "O" : "X"}
					@ (${Game.getSqrLoc(history[turn].lastMove)})`;
			} else {
				desc = "Go to game start";
			}

			const style =
				turn === this.state.stepNumber ? { fontWeight: "bold" } : null;

			return (
				<li style={style} key={turn}>
					<button style={style} onClick={() => this.jumpTo(turn)}>
						{desc}
					</button>
				</li>
			);
		});

		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						lastMove={current.lastMove}
						winCombo={winCombo}
						onClick={(i) => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>
						<b>{status}</b>
					</div>
					<ol reversed={this.state.mvListOrder}>
						{!this.state.mvListOrder ? moves : moves.reverse()}
					</ol>
					<button
						style={{ marginLeft: "30px" }}
						onClick={() => this.toggleOrder()}
					>
						Toggle Order
					</button>
				</div>
			</div>
		);
	}

	static getSqrLoc(i) {
		const row = Math.ceil((i + 1) / 3);
		const col = (i % 3) + 1;
		return [row, col];
	}

	static calculateWinner(squares) {
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
			if (
				squares[a] &&
				squares[a] === squares[b] &&
				squares[a] === squares[c]
			) {
				return [squares[a], lines[i]];
			}
		}
		return [null, []];
	}
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
