import { Player } from "@/snake";

export enum GameStatus {
  Running = "running",
  Paused = "paused",
  Idle = "idle",
  Reset = "reset",
  Training = "training",
  Stopped = "stopped",
}

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
