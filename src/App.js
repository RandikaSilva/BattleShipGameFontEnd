import React, { useState, useEffect } from "react";
import axios from "axios";

const GameBoard = () => {
  const [playerBoard, setPlayerBoard] = useState([]);
  const [computerBoard, setComputerBoard] = useState([]);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("");
  const [firedCoordinates, setFiredCoordinates] = useState(new Set());
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchPlayerBoard();
    fetchComputerBoard();
  }, []);

  const fetchPlayerBoard = () => {
    axios
      .get("https://localhost:7034/BattleShips/player-board")
      .then((response) => {
        setPlayerBoard(response.data);
      })
      .catch((error) => {
        console.error("Error fetching player board:", error);
      });
  };

  const fetchComputerBoard = () => {
    axios
      .get("https://localhost:7034/BattleShips/computer-board")
      .then((response) => {
        setComputerBoard(response.data);
      })
      .catch((error) => {
        console.error("Error fetching computer board:", error);
      });
  };

  const handleFireShot = (coordinates) => {
    if (firedCoordinates.has(coordinates)) {
      setMessage(
        "You already fired at these coordinates. Please select a different one."
      );
      return;
    }

    const config = {
      headers: {
        "Content-Type": "application/json",  
      },
    };

    axios
      .post(
        "https://localhost:7034/BattleShips/fire-shot",
        JSON.stringify(coordinates),
        config
      )
      .then((response) => {
        const result = response.data;
        console.log("result", result);
        if (result.message === "Player Wins") {
          setWinner("Player");
          setMessage(
            "Congratulations! You sank all the computer's ships. You win!"
          );
          setGameOver(true);
        } else if (result.message === "Computer Wins") {
          setWinner("Computer");
          setMessage("Game over! The computer sank all your ships. You lose!");
          setGameOver(true);
        } else if (result.gameOver) {
          setMessage("Game over! The game has ended.");
          setGameOver(true);
        } else {
          setMessage(result.message);
          setFiredCoordinates(new Set([...firedCoordinates, coordinates]));
          fetchPlayerBoard();
          fetchComputerBoard();
        }
      })
      .catch((error) => {
        console.error("Error firing shot:", error);
      });
  };

  const handleReplay = () => {
    axios
      .get("https://localhost:7034/BattleShips/re-player")
      .then((response) => {
        setWinner(null);
        setMessage("");
        setFiredCoordinates(new Set());
        setGameOver(false);
        fetchPlayerBoard();
        fetchComputerBoard();
        fetchPlayerBoard();
        fetchComputerBoard();
      })
      .catch((error) => {
        console.error("Error fetching computer board:", error);
      });
  };

  return (
    <div>
      <h2>Your Board</h2>
      <button onClick={handleReplay}>Replay</button>
      <Board board={playerBoard} onClick={() => {}} />
      <h2>Computer's Board</h2>
      <Board board={computerBoard} handleFireShot={handleFireShot} />
      {winner && <h2>{message}</h2>}
      {gameOver && <button onClick={handleReplay}>Replay</button>}
    </div>
  );
};

const Board = ({ board, handleFireShot }) => {
  const handleClick = (event, coordinates) => {
    event.preventDefault();
    handleFireShot(coordinates);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`cell ${
                cell === "X" ? "hit" : cell === "O" ? "miss" : ""
              }`}
              onClick={(event) =>
                handleClick(
                  event,
                  `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
                )
              }
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>Battleships</h1>
      <GameBoard />
    </div>
  );
};

export default App;
