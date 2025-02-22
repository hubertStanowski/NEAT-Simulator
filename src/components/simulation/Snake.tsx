import { useState, useEffect } from "react";
import Player from "../../snake/player";
import { GameStatus, gridSize, startingPlayerSize } from "../../constants";
import { styleEyes } from "../../snake/visuals";
import { NeatConfig } from "../../neat/neatConfig";
import { Population } from "../../neat/population";

type SnakeProps = {
  humanPlaying: boolean;
  populationSize: number;
  speed: number;
  gameStatus: GameStatus;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  targetGeneration: number;
  setCurrentGeneration: React.Dispatch<React.SetStateAction<number>>;
  setAliveCount: React.Dispatch<React.SetStateAction<number>>;
  setNetworkPlayer: React.Dispatch<React.SetStateAction<Player>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setBestScore: React.Dispatch<React.SetStateAction<number>>;
  setTrainedGenerations: React.Dispatch<React.SetStateAction<number>>;
};
const Snake: React.FC<SnakeProps> = ({
  humanPlaying,
  populationSize,
  speed,
  gameStatus,
  setGameStatus,
  targetGeneration,
  setCurrentGeneration,
  setAliveCount,
  setNetworkPlayer,
  setScore,
  setBestScore,
  setTrainedGenerations,
}) => {
  document
    .querySelector("link[rel='icon']")
    ?.setAttribute("href", "assets/logo-snake.png");

  const [player, setPlayer] = useState(new Player(startingPlayerSize));

  const [grid, setGrid] = useState<[number, number, number][][]>(
    player.getGrid(),
  );

  const config = new NeatConfig();
  const [population, setPopulation] = useState(
    new Population(config, populationSize),
  );

  useEffect(() => {
    setPopulation(new Population(config, populationSize));
    if (gameStatus !== GameStatus.Idle && !humanPlaying) {
      setGameStatus(GameStatus.Training);
    }
    console.log("NEW POPULATION");
  }, [populationSize]);

  useEffect(() => {
    if (gameStatus === "training") {
      const interval = setInterval(() => {
        if (population.generation - 1 >= targetGeneration) {
          if (player.isAlive) {
            const transformedPlayer = player;
            transformedPlayer.toggleMode();
            transformedPlayer.transplant(
              population.genBestPlayers[targetGeneration - 1],
            );
            setPlayer(transformedPlayer);
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
          setNetworkPlayer(population.currBestPlayer || player);
          setCurrentGeneration(population.generation);
          setAliveCount(population.getAliveCount());
          setScore(
            population.currBestPlayer
              ? population.currBestPlayer.getScore()
              : 0,
          );
          setBestScore(
            population.bestEverPlayer
              ? population.bestEverPlayer.getScore()
              : 0,
          );
          setTrainedGenerations(population.generation - 1);
        }
      }, 0);

      return () => clearInterval(interval);
    }
  }, [player, gameStatus, population, targetGeneration]);

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
      if (!player.isAlive) {
        gameStatus = GameStatus.Reset;
      }
      const interval = setInterval(() => {
        player.moveSnake(true);
        if (player.isAlive) {
          player.updateGrid();
          setGrid(player.getGrid());
          setScore(player.getScore());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(interval);
        }
      }, 110 - speed);

      return () => clearInterval(interval);
    } else if (gameStatus === "running" && !humanPlaying) {
      if (!player.isAlive) {
        setPlayer(player.clone(startingPlayerSize));
      }
      const interval = setInterval(() => {
        player.moveSnake();
        if (player.isAlive) {
          player.look();
          player.decide();
          player.updateGrid();
          setGrid(player.getGrid());
          setScore(player.getScore());
          setNetworkPlayer(player.clone());
          setCurrentGeneration(player.generation);
        } else {
          if (targetGeneration >= population.generation) {
            setGameStatus(GameStatus.Training);
          } else {
            setGameStatus(GameStatus.Idle);
          }
          clearInterval(interval);
        }
      }, 110 - speed);

      return () => clearInterval(interval);
    }
  }, [speed, gameStatus]);

  useEffect(() => {
    console.log(gameStatus, humanPlaying);
    if (gameStatus === GameStatus.Reset) {
      if (humanPlaying) {
        const newPlayer = new Player(startingPlayerSize);
        setPlayer(newPlayer);
        setGrid(newPlayer.getGrid());
        setScore(newPlayer.getScore());
      } else {
        setPopulation(new Population(config, populationSize));
        setTrainedGenerations(0);
      }

      setGameStatus(GameStatus.Idle);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus !== GameStatus.Idle) {
      if (humanPlaying) {
        const transformedPlayer = player;
        transformedPlayer.toggleMode();
        setPlayer(transformedPlayer);
        setGameStatus(GameStatus.Paused);
        setScore(transformedPlayer.getScore());
      } else {
        setNetworkPlayer(player.clone());
        setGameStatus(GameStatus.Training);
      }
    }
  }, [humanPlaying]);

  useEffect(() => {
    if (!humanPlaying && gameStatus != GameStatus.Idle) {
      if (population.generation - 1 >= targetGeneration) {
        if (player.isAlive) {
          const transformedPlayer = player;
          transformedPlayer.toggleMode();
          transformedPlayer.transplant(
            population.genBestPlayers[targetGeneration - 1],
          );
          setPlayer(transformedPlayer);
        } else {
          setPlayer(
            population.genBestPlayers[targetGeneration - 1].clone(
              startingPlayerSize,
            ),
          );
        }
      } else {
        setGameStatus(GameStatus.Training);
      }
    }
  }, [targetGeneration]);

  return (
    <div
      id="snake"
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

export default Snake;
