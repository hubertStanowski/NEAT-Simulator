import { useState, useEffect } from "react";
import Player from "../../snake/player";
import { GameStatus, gridSize } from "../../constants";
import { styleEyes } from "../../snake/visuals";
import { NeatConfig } from "../../neat/neatConfig";
import { Population } from "../../neat/population";

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

  const config = new NeatConfig();
  let population = new Population(config, populationSize);
  const target_generation = 20;
  let show_previous = false;

  useEffect(() => {
    if (gameStatus === "training") {
      const interval = setInterval(() => {
        if (population.generation - 1 >= target_generation || show_previous) {
          if (show_previous) {
            if (population.prevBestPlayer) {
              setPlayer(population.prevBestPlayer.clone());
            }
            show_previous = false;
          } else {
            setPlayer(population.genBestPlayers[target_generation - 1].clone());
          }
          setGameStatus(GameStatus.Simulating);
        } else {
          // console.log(population.generation);
          if (!population.finished()) {
            population.updateSurvivors();
            // const alivePlayersCount = population.players.filter(
            //   (player) => player.isAlive,
            // ).length;
            // console.log(`Alive players: ${alivePlayersCount}`);
          } else {
            console.log(
              `Gen: ${population.generation}, Score: ${population.currBestPlayer ? population.currBestPlayer.getScore() : "N/A"} / ${population.bestEverPlayer ? population.bestEverPlayer.getScore() : "N/A"}`,
            );
            const averageScore =
              population.players.reduce(
                (sum, player) => sum + player.getScore(),
                0,
              ) / population.players.length;
            console.log(`Average Score: ${averageScore}`);
            population.naturalSelection();
          }
        }
      }, 0);

      return () => clearInterval(interval);
    }
  }, [gameStatus, population, speed, target_generation, setGameStatus]);

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
    if (gameStatus === "simulating") {
      const interval = setInterval(() => {
        if (player.isAlive) {
          player.look();
          player.decide();
          player.moveSnake();
          player.updateGrid();
          setGrid(player.getGrid());
        } else {
          setGameStatus(GameStatus.Done);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [player, speed, gameStatus, setGameStatus]);

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
