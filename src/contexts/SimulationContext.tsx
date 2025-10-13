import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameStatus, SimulationContextType, Simulations } from '@/types';
import { INeatPlayer } from '@/neat';

const initialSimulationContext: SimulationContextType = {
  humanPlaying: false,
  setHumanPlaying: () => {},

  populationSize: 100,
  setPopulationSize: () => {},

  speed: 80,
  setSpeed: () => {},

  gameStatus: GameStatus.Idle,
  setGameStatus: () => {},

  targetGeneration: 20,
  setTargetGeneration: () => {},

  currentGeneration: 0,
  setCurrentGeneration: () => {},

  trainedGenerations: 0,
  setTrainedGenerations: () => {},

  aliveCount: 0,
  setAliveCount: () => {},

  score: 0,
  setScore: () => {},

  bestScore: 0,
  setBestScore: () => {},

  networkPlayer: null,
  setNetworkPlayer: () => {},

  selectedSimulation: Simulations.Snake,
  setSelectedSimulation: () => {},

  isPlayerAlive: true,
  setIsPlayerAlive: () => {},

  resetAndStartGame: () => {},
  setResetAndStartGame: () => {},
};

const SimulationContext = createContext<SimulationContextType>(
  initialSimulationContext
);

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getSimulationFromPath = (pathname: string): Simulations => {
    if (pathname === '/flappybird') {
      return Simulations.FlappyBird;
    }
    return Simulations.Snake;
  };

  const [humanPlaying, setHumanPlaying] = useState(
    initialSimulationContext.humanPlaying
  );
  const [populationSize, setPopulationSize] = useState(
    initialSimulationContext.populationSize
  );
  const [speed, setSpeed] = useState(initialSimulationContext.speed);

  const [gameStatus, setGameStatus] = useState<GameStatus>(
    initialSimulationContext.gameStatus
  );
  const [targetGeneration, setTargetGeneration] = useState(
    initialSimulationContext.targetGeneration
  );
  const [currentGeneration, setCurrentGeneration] = useState(
    initialSimulationContext.currentGeneration
  );
  const [trainedGenerations, setTrainedGenerations] = useState(
    initialSimulationContext.trainedGenerations
  );

  const [aliveCount, setAliveCount] = useState(
    initialSimulationContext.aliveCount
  );
  const [score, setScore] = useState(initialSimulationContext.score);
  const [bestScore, setBestScore] = useState(
    initialSimulationContext.bestScore
  );
  const [networkPlayer, setNetworkPlayer] = useState<INeatPlayer | null>(
    initialSimulationContext.networkPlayer
  );
  const [selectedSimulation, setSelectedSimulation] = useState(
    getSimulationFromPath(location.pathname)
  );

  const [isPlayerAlive, setIsPlayerAlive] = useState(
    initialSimulationContext.isPlayerAlive
  );
  const [resetAndStartGame, setResetAndStartGame] = useState<() => void>(
    () => initialSimulationContext.resetAndStartGame
  );

  useEffect(() => {
    const simulationFromPath = getSimulationFromPath(location.pathname);
    if (simulationFromPath !== selectedSimulation) {
      setSelectedSimulation(simulationFromPath);
    }
  }, [location.pathname]);

  const handleSetSelectedSimulation = (simulation: Simulations) => {
    setSelectedSimulation(simulation);
    const path =
      simulation === Simulations.FlappyBird ? '/flappybird' : '/snake';
    navigate(path);
  };

  return (
    <SimulationContext.Provider
      value={{
        humanPlaying,
        setHumanPlaying,
        populationSize,
        setPopulationSize,
        speed,
        setSpeed,
        gameStatus,
        setGameStatus,
        targetGeneration,
        setTargetGeneration,
        currentGeneration,
        setCurrentGeneration,
        trainedGenerations,
        setTrainedGenerations,
        aliveCount,
        setAliveCount,
        score,
        setScore,
        bestScore,
        setBestScore,
        networkPlayer,
        setNetworkPlayer,
        selectedSimulation,
        setSelectedSimulation: handleSetSelectedSimulation,
        isPlayerAlive,
        setIsPlayerAlive,
        resetAndStartGame,
        setResetAndStartGame,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
