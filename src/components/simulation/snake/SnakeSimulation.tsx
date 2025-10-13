import { useState, useEffect } from 'react';
import { useSimulation } from '@/contexts';
import { Player, Direction, Grid, SnakePopulation } from '@/snake';
import SnakeGrid from './SnakeGrid';
import { GameStatus } from '@/types';
import { NeatConfig } from '@/neat';

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
    setIsPlayerAlive,
    setResetAndStartGame,
  } = useSimulation();

  const [player, setPlayer] = useState(new Player(false));
  const [grid, setGrid] = useState<Grid>(player.getGrid());
  const config = new NeatConfig();
  const [population, setPopulation] = useState(
    new SnakePopulation(config, populationSize)
  );

  // Training Loop Handlers
  const handleTrainingStep = () => {
    if (population.generation - 1 >= targetGeneration) {
      handleTargetGenerationReached();
    } else {
      handlePopulationEvolution();
    }
  };

  const handleTargetGenerationReached = () => {
    if (player.isAlive) {
      player.toggleMode();
      player.transplant(population.genBestPlayers[targetGeneration - 1]);
      setPlayer(player);
    } else {
      setPlayer(population.genBestPlayers[targetGeneration - 1].clone(false));
    }
    setGameStatus(GameStatus.Running);
  };

  const handlePopulationEvolution = () => {
    if (!population.finished()) {
      population.updateSurvivors();
    } else {
      logGenerationStats();
      population.naturalSelection();
    }
    updateSimulationState();
  };

  const logGenerationStats = () => {
    const avg =
      population.players.reduce((a, p) => a + p.getScore(), 0) /
      population.players.length;
    console.log(
      `Gen:${population.generation} CurrBest:${
        population.currBestPlayer?.getScore() ?? 'N/A'
      } / BestEver:${
        population.bestEverPlayer?.getScore() ?? 'N/A'
      } Avg:${avg.toFixed(2)}`
    );
  };

  const updateSimulationState = () => {
    setNetworkPlayer(population.currBestPlayer ?? player);
    setCurrentGeneration(population.generation);
    setAliveCount(population.getAliveCount());
    setScore(population.currBestPlayer?.getScore() ?? 0);
    setBestScore(population.bestEverPlayer?.getScore() ?? 0);
    setTrainedGenerations(population.generation - 1);
  };

  // Keyboard Control Handlers
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        if (player.direction !== Direction.DOWN)
          player.setDirection(Direction.UP);
        break;
      case 'ArrowDown':
        if (player.direction !== Direction.UP)
          player.setDirection(Direction.DOWN);
        break;
      case 'ArrowLeft':
        if (player.direction !== Direction.RIGHT)
          player.setDirection(Direction.LEFT);
        break;
      case 'ArrowRight':
        if (player.direction !== Direction.LEFT)
          player.setDirection(Direction.RIGHT);
        break;
    }
  };

  const setupKeyboardControls = () => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  };

  // Game Loop Handlers
  const handleHumanGameStep = () => {
    player.moveSnake(true);
    if (player.isAlive) {
      player.updateGrid();
      setGrid(player.getGrid());
      setScore(player.getScore());
    } else {
      setGameStatus(GameStatus.Idle);
      setIsPlayerAlive(false);
    }
  };

  const handleAIGameStep = () => {
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
          : GameStatus.Idle
      );
    }
  };

  const setupHumanGameLoop = () => {
    if (!player.isAlive) {
      setGameStatus(GameStatus.Reset);
      setIsPlayerAlive(false);
      return;
    }
    const interval = setInterval(handleHumanGameStep, 110 - speed);
    return () => clearInterval(interval);
  };

  const setupAIGameLoop = () => {
    if (!player.isAlive) {
      setPlayer(player.clone(false));
    }
    const interval = setInterval(handleAIGameStep, 110 - speed);
    return () => clearInterval(interval);
  };

  // Game Reset Handlers
  const resetPlayer = () => {
    const fresh = new Player(false);
    setPlayer(fresh);
    setGrid(fresh.getGrid());
    setScore(fresh.getScore());
  };

  const resetPopulation = () => {
    const newPopulation = new SnakePopulation(config, populationSize);
    setPopulation(newPopulation);

    // Reset all simulation state values
    setNetworkPlayer(player);
    setCurrentGeneration(0);
    setAliveCount(populationSize);
    setScore(0);
    setBestScore(0);
    setTrainedGenerations(0);
  };

  const handleGameReset = () => {
    resetPlayer();
    if (!humanPlaying) {
      resetPopulation();
    }

    setGameStatus(GameStatus.Idle);
    setIsPlayerAlive(true);
  };

  const handleResetAndStart = () => {
    resetPlayer();
    setGameStatus(GameStatus.Running);
    setIsPlayerAlive(true);
  };

  // Population Management Handlers
  const handleNewPopulation = () => {
    resetPopulation();
    if (
      gameStatus !== GameStatus.Idle &&
      gameStatus !== GameStatus.Stopped &&
      !humanPlaying
    ) {
      setGameStatus(GameStatus.Training);
      resetPlayer();
    }
    console.log('NEW POPULATION');
  };

  // Mode Switching Handlers
  const switchToHumanMode = () => {
    player.toggleMode();
    setPlayer(player);
    setGameStatus(GameStatus.Paused);
    setScore(player.getScore());
  };

  const switchToAIMode = () => {
    setNetworkPlayer(player.clone());
    setGameStatus(GameStatus.Training);
  };

  const handleModeSwitch = () => {
    if (humanPlaying) {
      switchToHumanMode();
    } else {
      switchToAIMode();
    }
  };

  // Generation Switching Handlers
  const switchToTargetGeneration = () => {
    if (player.isAlive) {
      player.toggleMode();
      player.transplant(population.genBestPlayers[targetGeneration - 1]);
      setPlayer(player);
    } else {
      setPlayer(population.genBestPlayers[targetGeneration - 1].clone(false));
    }
  };

  const handleGenerationSwitch = () => {
    if (population.generation - 1 >= targetGeneration) {
      switchToTargetGeneration();
    } else {
      setGameStatus(GameStatus.Training);
    }
  };

  // Main training loop - evolve population and switch to best player when target reached
  useEffect(() => {
    if (gameStatus !== GameStatus.Training) return;
    const interval = setInterval(handleTrainingStep, 0);
    return () => clearInterval(interval);
  }, [population, gameStatus, targetGeneration]);

  // Main game loop - handles snake movement for both human and AI players
  useEffect(() => {
    if (gameStatus !== GameStatus.Running) return;
    return humanPlaying ? setupHumanGameLoop() : setupAIGameLoop();
  }, [player, gameStatus, humanPlaying, speed, population]);

  // Create a new population when population size changes
  useEffect(() => {
    handleNewPopulation();
  }, [populationSize]);

  // Handle game reset - create fresh player or population
  useEffect(() => {
    if (gameStatus !== GameStatus.Reset) return;
    handleGameReset();
  }, [gameStatus]);

  // Switch to specific generation player when target generation changes
  useEffect(() => {
    if (humanPlaying || gameStatus === GameStatus.Idle) return;
    handleGenerationSwitch();
  }, [targetGeneration]);

  // Switch between human and AI modes
  useEffect(() => {
    if (gameStatus === GameStatus.Idle) return;
    handleModeSwitch();
  }, [humanPlaying]);

  // Setup keyboard controls when human is playing
  useEffect(() => {
    if (gameStatus !== GameStatus.Running || !humanPlaying) return;
    return setupKeyboardControls();
  }, [player, gameStatus, humanPlaying]);

  // Set up reset and start function for the Parameters component to use
  useEffect(() => {
    setResetAndStartGame(() => handleResetAndStart);
  }, []);

  return <SnakeGrid grid={grid} player={player} />;
};

export default Snake;
