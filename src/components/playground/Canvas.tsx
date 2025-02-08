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
  const [humanPlayer, setHumanPlayer] = useState(
    new Player(startingPlayerSize, false),
  );
  const [aiPlayer, setAiPlayer] = useState(
    new Player(startingPlayerSize, true),
  );
  const [grid, setGrid] = useState<[number, number, number][][]>(
    humanPlayer.getGrid(),
  );

  const config = new NeatConfig();
  const [population, setPopulation] = useState(
    new Population(config, populationSize),
  );

  useEffect(() => {
    setPopulation(new Population(config, populationSize));
    setGameStatus(GameStatus.Training);
    console.log("NEW POPULATION");
  }, [populationSize]);

  let show_previous = false;

  useEffect(() => {
    if (gameStatus === "training") {
      const interval = setInterval(() => {
        if (population.generation - 1 >= targetGeneration || show_previous) {
          if (show_previous) {
            if (population.prevBestPlayer) {
              setAiPlayer(population.prevBestPlayer.clone(startingPlayerSize));
            }
            show_previous = false;
          } else {
            setAiPlayer(
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
            const averageScore =
              population.players.reduce(
                (acc, player) => acc + player.getScore(),
                0,
              ) / population.players.length;
            console.log(
              `Gen: ${population.generation}, Score: ${population.currBestPlayer ? population.currBestPlayer.getScore() : "N/A"} / ${population.bestEverPlayer ? population.bestEverPlayer.getScore() : "N/A"}, Avg Score: ${averageScore}`,
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
            if (humanPlayer.direction !== "DOWN")
              humanPlayer.setDirection("UP");
            break;
          case "ArrowDown":
            if (humanPlayer.direction !== "UP")
              humanPlayer.setDirection("DOWN");
            break;
          case "ArrowLeft":
            if (humanPlayer.direction !== "RIGHT")
              humanPlayer.setDirection("LEFT");
            break;
          case "ArrowRight":
            if (humanPlayer.direction !== "LEFT")
              humanPlayer.setDirection("RIGHT");
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [humanPlayer, gameStatus, humanPlaying]);

  useEffect(() => {
    if (gameStatus === "running" && humanPlaying) {
      const interval = setInterval(() => {
        humanPlayer.moveSnake();
        if (humanPlayer.isAlive) {
          humanPlayer.updateGrid();
          setGrid(humanPlayer.getGrid());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    } else if (gameStatus === "running" && !humanPlaying) {
      const interval = setInterval(() => {
        aiPlayer.moveSnake();
        if (aiPlayer.isAlive) {
          aiPlayer.look();
          aiPlayer.decide();
          aiPlayer.updateGrid();
          setGrid(aiPlayer.getGrid());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [aiPlayer, speed, gameStatus]);

  useEffect(() => {
    if (gameStatus === "reset") {
      if (humanPlaying) {
        const newPlayer = new Player(startingPlayerSize, false);
        setHumanPlayer(newPlayer);
        setGrid(newPlayer.getGrid());
        setGameStatus(GameStatus.Idle);
      } else {
        setGameStatus(GameStatus.Training);
      }
    }
  }, [gameStatus]);

  useEffect(() => {
    setGameStatus(GameStatus.Reset);
  }, [humanPlaying]);

  useEffect(() => {
    if (!humanPlaying) {
      if (population.generation <= targetGeneration) {
        setGameStatus(GameStatus.Training);
      } else {
        setAiPlayer(
          population.genBestPlayers[targetGeneration - 1].clone(
            startingPlayerSize,
          ),
        );
        setGameStatus(GameStatus.Running);
      }
    }
  }, [targetGeneration]);

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
            const player = humanPlaying ? humanPlayer : aiPlayer;
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
