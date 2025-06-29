import { useState, useEffect } from "react";
import { useSimulation } from "@/contexts";
import { Player, styleEyes, Direction, getGridSize, Grid } from "@/snake";
import { GameStatus } from "@/types";
import { NeatConfig, Population } from "@/neat";

const Snake = () => {
  const {
    humanPlaying,
    populationSize,
    speed,
    gameStatus,
    setGameStatus,
    targetGeneration,
    setCurrentGeneration,
    setTrainedGenerations,
    setAliveCount,
    setScore,
    setBestScore,
    setNetworkPlayer,
  } = useSimulation();

  const [player, setPlayer] = useState(new Player(false));
  const [grid, setGrid] = useState<Grid>(player.getGrid());
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
    if (gameStatus !== GameStatus.Training) return;
    const interval = setInterval(() => {
      if (population.generation - 1 >= targetGeneration) {
        if (player.isAlive) {
          player.toggleMode();
          player.transplant(population.genBestPlayers[targetGeneration - 1]);
          setPlayer(player);
        } else {
          setPlayer(
            population.genBestPlayers[targetGeneration - 1].clone(false),
          );
        }
        setGameStatus(GameStatus.Running);
      } else {
        if (!population.finished()) {
          population.updateSurvivors();
        } else {
          const avg =
            population.players.reduce((a, p) => a + p.getScore(), 0) /
            population.players.length;
          console.log(
            `Gen:${population.generation} CurrBest:${
              population.currBestPlayer?.getScore() ?? "N/A"
            } / BestEver:${
              population.bestEverPlayer?.getScore() ?? "N/A"
            } Avg:${avg.toFixed(2)}`,
          );
          population.naturalSelection();
        }
        setNetworkPlayer(population.currBestPlayer ?? player);
        setCurrentGeneration(population.generation);
        setAliveCount(population.getAliveCount());
        setScore(population.currBestPlayer?.getScore() ?? 0);
        setBestScore(population.bestEverPlayer?.getScore() ?? 0);
        setTrainedGenerations(population.generation - 1);
      }
    }, 0);
    return () => clearInterval(interval);
  }, [population, gameStatus, targetGeneration]);

  useEffect(() => {
    if (gameStatus !== GameStatus.Running || !humanPlaying) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (player.direction !== Direction.DOWN)
            player.setDirection(Direction.UP);
          break;
        case "ArrowDown":
          if (player.direction !== Direction.UP)
            player.setDirection(Direction.DOWN);
          break;
        case "ArrowLeft":
          if (player.direction !== Direction.RIGHT)
            player.setDirection(Direction.LEFT);
          break;
        case "ArrowRight":
          if (player.direction !== Direction.LEFT)
            player.setDirection(Direction.RIGHT);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [player, gameStatus, humanPlaying]);

  useEffect(() => {
    if (gameStatus !== GameStatus.Running) return;

    if (humanPlaying) {
      if (!player.isAlive) {
        setGameStatus(GameStatus.Reset);
        return;
      }
      const iv = setInterval(() => {
        player.moveSnake(true);
        if (player.isAlive) {
          player.updateGrid();
          setGrid(player.getGrid());
          setScore(player.getScore());
        } else {
          setGameStatus(GameStatus.Idle);
          clearInterval(iv);
        }
      }, 110 - speed);
      return () => clearInterval(iv);
    }

    if (!player.isAlive) {
      setPlayer(player.clone(false));
    }
    const iv = setInterval(() => {
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
        setGameStatus(
          targetGeneration >= population.generation
            ? GameStatus.Training
            : GameStatus.Idle,
        );
        clearInterval(iv);
      }
    }, 110 - speed);
    return () => clearInterval(iv);
  }, [player, gameStatus, humanPlaying, speed, population]);

  useEffect(() => {
    if (gameStatus !== GameStatus.Reset) return;

    if (humanPlaying) {
      const fresh = new Player(false);
      setPlayer(fresh);
      setGrid(fresh.getGrid());
      setScore(fresh.getScore());
    } else {
      setPopulation(new Population(config, populationSize));
      setTrainedGenerations(0);
    }
    setGameStatus(GameStatus.Idle);
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === GameStatus.Idle) return;
    if (humanPlaying) {
      player.toggleMode();
      setPlayer(player);
      setGameStatus(GameStatus.Paused);
      setScore(player.getScore());
    } else {
      setNetworkPlayer(player.clone());
      setGameStatus(GameStatus.Training);
    }
  }, [humanPlaying]);

  useEffect(() => {
    if (humanPlaying || gameStatus === GameStatus.Idle) return;
    if (population.generation - 1 >= targetGeneration) {
      if (player.isAlive) {
        player.toggleMode();
        player.transplant(population.genBestPlayers[targetGeneration - 1]);
        setPlayer(player);
      } else {
        setPlayer(population.genBestPlayers[targetGeneration - 1].clone(false));
      }
    } else {
      setGameStatus(GameStatus.Training);
    }
  }, [targetGeneration]);

  return (
    <div
      id="snake"
      className={`grid-cols-${getGridSize(grid)} grid-rows-${getGridSize(grid)} border-neutral-40 grid h-full w-full border-[0.01px]`}
    >
      {grid.map((row, r) => (
        <div
          key={r}
          className={`col-span-${getGridSize(grid)} row-span-1 flex`}
        >
          {row.map((cell, c) => {
            const isHead =
              r === player.snake[0].row && c === player.snake[0].col;
            const { eye1Style, eye2Style } = styleEyes(player.direction);
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  backgroundColor: `rgb(${cell[0]},${cell[1]},${cell[2]})`,
                  position: "relative",
                }}
                className="col-span-1 row-span-1 aspect-1 flex-1 border-[0.01px] border-neutral-400"
              >
                {isHead && (
                  <>
                    <div style={eye1Style} />
                    <div style={eye2Style} />
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
