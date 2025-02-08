import { useState, useEffect } from "react";
import Player from "../../snake/player";
import { GameStatus, gridSize, startingPlayerSize } from "../../constants";
import { styleEyes } from "../../snake/visuals";
import { NeatConfig } from "../../neat/neatConfig";
import { Population } from "../../neat/population";

interface CanvasProps {
  humanPlaying: boolean;
  populationSize: number;
  speed: number;
  gameStatus: GameStatus;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  targetGeneration: number;
}
const Canvas: React.FC<CanvasProps> = ({
  humanPlaying,
  populationSize,
  speed,
  gameStatus,
  setGameStatus,
  targetGeneration,
}) => {
  const [player, setPlayer] = useState(new Player(startingPlayerSize, false));
  const [grid, setGrid] = useState<[number, number, number][][]>(
    player.getGrid(),
  );

  const config = new NeatConfig();
  const [population, setPopulation] = useState(
    new Population(config, populationSize),
  );

  useEffect(() => {
    setPopulation(new Population(config, populationSize));
    console.log("NEW POPULATION");
  }, [populationSize]);

  let show_previous = false;

  useEffect(() => {
    if (gameStatus === "training") {
      const interval = setInterval(() => {
        console.log(targetGeneration);
        if (population.generation - 1 >= targetGeneration || show_previous) {
          if (show_previous) {
            if (population.prevBestPlayer) {
              setPlayer(population.prevBestPlayer.clone(startingPlayerSize));
            }
            show_previous = false;
          } else {
            setPlayer(
              population.genBestPlayers[targetGeneration - 1].clone(
                startingPlayerSize,
              ),
            );
          }
          setGameStatus(GameStatus.Running);
        } else {
          if (!population.finished()) {
            population.updateSurvivors();
          } else {
            console.log(
              `Gen: ${population.generation}, Score: ${population.currBestPlayer ? population.currBestPlayer.getScore() : "N/A"} / ${population.bestEverPlayer ? population.bestEverPlayer.getScore() : "N/A"}`,
            );
            population.naturalSelection();
          }
        }
      }, 0);

      return () => clearInterval(interval);
    }
  }, [gameStatus, population, targetGeneration]);

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
    if (gameStatus === "running" && humanPlaying) {
      const interval = setInterval(() => {
        player.moveSnake();
        if (player.isAlive) {
          player.updateGrid();
          setGrid(player.getGrid());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    } else if (gameStatus === "running" && !humanPlaying) {
      const interval = setInterval(() => {
        player.moveSnake();
        if (player.isAlive) {
          player.look();
          player.decide();
          player.updateGrid();
          setGrid(player.getGrid());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [player, speed, gameStatus]);

  useEffect(() => {
    if (gameStatus === "reset") {
      if (humanPlaying) {
        const newPlayer = new Player(startingPlayerSize, false);
        setPlayer(newPlayer);
        setGrid(newPlayer.getGrid());
      }
      setGameStatus(GameStatus.Idle);
    }
  }, [gameStatus]);

  useEffect(() => {
    setGameStatus(GameStatus.Reset);
  }, [humanPlaying]);

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
