import { useState, useEffect } from "react";
import Player from "../../snake/player";
import { GameStatus, gridSize } from "../../constants";
import { styleEyes } from "../../snake/visuals";

interface CanvasProps {
  humanPlaying: boolean;
  populationSize: number;
  speed: number;
  gameStatus: GameStatus;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
}

const Canvas: React.FC<CanvasProps> = ({
  humanPlaying,
  populationSize,
  speed,
  gameStatus,
  setGameStatus,
}) => {
  const [player, setPlayer] = useState(new Player());
  const [grid, setGrid] = useState<[number, number, number][][]>(
    player.getGrid(),
  );

  console.log(populationSize);

  useEffect(() => {
    if (gameStatus === "running" && humanPlaying) {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "ArrowUp":
            if (player.direction !== "DOWN") player.setDirection("UP");
            break;
          case "ArrowDown":
            if (player.direction !== "UP") player.setDirection("DOWN");
            break;
          case "ArrowLeft":
            if (player.direction !== "RIGHT") player.setDirection("LEFT");
            break;
          case "ArrowRight":
            if (player.direction !== "LEFT") player.setDirection("RIGHT");
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [player, gameStatus, humanPlaying]);

  useEffect(() => {
    if (gameStatus === "running") {
      const interval = setInterval(() => {
        player.moveSnake();
        if (!player.isAlive) {
          setGameStatus(GameStatus.Done);
          clearInterval(interval);
        } else {
          player.updateGrid();
          setGrid(player.getGrid());
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [player, speed, gameStatus]);

  useEffect(() => {
    if (gameStatus === "reset") {
      const newPlayer = new Player();
      setPlayer(newPlayer);
      setGrid(newPlayer.getGrid());
      setGameStatus(GameStatus.Paused);
    }
  }, [gameStatus, setGameStatus]);

  return (
    <div
      className={`grid-cols-${gridSize} grid-rows-${gridSize} border-neutral-40 grid h-full w-full border-[0.01px]`}
    >
      {grid.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={`col-span-${gridSize} row-span-1 flex`}
        >
          {row.map((cell, cellIndex) => {
            const isHead =
              rowIndex === player.snake[0].row &&
              cellIndex === player.snake[0].col;
            const { eye1Style, eye2Style } = styleEyes(player.direction);

            return (
              <div
                key={`${rowIndex}-${cellIndex}`}
                style={{
                  backgroundColor: `rgb(${cell[0]}, ${cell[1]}, ${cell[2]})`,
                  position: "relative",
                }}
                className="col-span-1 row-span-1 aspect-1 flex-1 border-[0.01px] border-neutral-400"
              >
                {isHead && (
                  <>
                    <div style={eye1Style}></div>
                    <div style={eye2Style}></div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
