import React, { createContext, useContext, useState } from 'react';
import { GameStatus, SimulationContextType, Simulations } from '@/types';
import { Player } from '@/snake';

const noop = () => {};

const initialSimulationContext: SimulationContextType = {
  humanPlaying: false,
  setHumanPlaying: noop,

  populationSize: 300,
  setPopulationSize: noop,

  speed: 50,
  setSpeed: noop,

  gameStatus: GameStatus.Idle,
  setGameStatus: noop,

  targetGeneration: 10,
  setTargetGeneration: noop,

  currentGeneration: 0,
  setCurrentGeneration: noop,

  trainedGenerations: 0,
  setTrainedGenerations: noop,

  aliveCount: 0,
  setAliveCount: noop,

  score: 0,
  setScore: noop,

  bestScore: 0,
  setBestScore: noop,

  networkPlayer: new Player(false),
  setNetworkPlayer: noop,

  selectedSimulation: Simulations.Snake,
  setSelectedSimulation: noop,

  isPlayerAlive: true,
  setIsPlayerAlive: noop,

  resetAndStartGame: noop,
  setResetAndStartGame: noop,
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
  const [networkPlayer, setNetworkPlayer] = useState<Player>(
    initialSimulationContext.networkPlayer
  );
  const [selectedSimulation, setSelectedSimulation] = useState(
    initialSimulationContext.selectedSimulation
  );

  const [isPlayerAlive, setIsPlayerAlive] = useState(
    initialSimulationContext.isPlayerAlive
  );
  const [resetAndStartGame, setResetAndStartGame] = useState<() => void>(
    () => initialSimulationContext.resetAndStartGame
  );

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
        setSelectedSimulation,
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
