import React, { createContext, useContext, useState } from "react";
import { GameStatus } from "@/constants";
import { Player } from "@/snake";

export type SimulationContextType = {
  humanPlaying: boolean;
  setHumanPlaying: (value: boolean) => void;

  populationSize: number;
  setPopulationSize: (value: number) => void;

  speed: number;
  setSpeed: (value: number) => void;

  gameStatus: GameStatus;
  setGameStatus: (value: GameStatus) => void;

  targetGeneration: number;
  setTargetGeneration: (value: number) => void;

  currentGeneration: number;
  setCurrentGeneration: (value: number) => void;

  trainedGenerations: number;
  setTrainedGenerations: (value: number) => void;

  aliveCount: number;
  setAliveCount: (value: number) => void;

  score: number;
  setScore: (value: number) => void;

  bestScore: number;
  setBestScore: (value: number) => void;

  networkPlayer: Player;
  setNetworkPlayer: (player: Player) => void;
};

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
};

const SimulationContext = createContext<SimulationContextType>(
  initialSimulationContext,
);

export const useSimulation = () => useContext(SimulationContext);

export const SimulationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [humanPlaying, setHumanPlaying] = useState(
    initialSimulationContext.humanPlaying,
  );
  const [populationSize, setPopulationSize] = useState(
    initialSimulationContext.populationSize,
  );
  const [speed, setSpeed] = useState(initialSimulationContext.speed);

  const [gameStatus, setGameStatus] = useState<GameStatus>(
    initialSimulationContext.gameStatus,
  );
  const [targetGeneration, setTargetGeneration] = useState(
    initialSimulationContext.targetGeneration,
  );
  const [currentGeneration, setCurrentGeneration] = useState(
    initialSimulationContext.currentGeneration,
  );
  const [trainedGenerations, setTrainedGenerations] = useState(
    initialSimulationContext.trainedGenerations,
  );

  const [aliveCount, setAliveCount] = useState(
    initialSimulationContext.aliveCount,
  );
  const [score, setScore] = useState(initialSimulationContext.score);
  const [bestScore, setBestScore] = useState(
    initialSimulationContext.bestScore,
  );
  const [networkPlayer, setNetworkPlayer] = useState<Player>(
    initialSimulationContext.networkPlayer,
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
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
