import { useState, useEffect } from "react";
import Player from "../../snake/player";
import { gridSize, GameStatus } from "../../constants";

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
  const [player] = useState(new Player());
  const [grid, setGrid] = useState<[number, number, number][][]>(
    player.getGrid(),
  );

  useEffect(() => {
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
  }, [player]);

  useEffect(() => {
    if (gameStatus === GameStatus.Running) {
      const interval = setInterval(() => {
        player.moveSnake();
        player.updateGrid();
        setGrid(player.getGrid());
      }, speed);

      return () => clearInterval(interval);
    }
  }, [player, speed, gameStatus]);

  return (
    <div
      className={`grid-cols-${gridSize} grid-rows-${gridSize} grid h-full w-full`}
    >
      {grid.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className={`col-span-${gridSize} row-span-1 flex`}
        >
          {row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              style={{
                backgroundColor: `rgb(${cell[0]}, ${cell[1]}, ${cell[2]})`,
              }}
              className="col-span-1 row-span-1 aspect-1 flex-1 border-[0.01px] border-neutral-400"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
