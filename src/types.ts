import { INeatPlayer } from '@/neat';

export enum GameStatus {
  Running = 'running',
  Paused = 'paused',
  Idle = 'idle',
  Reset = 'reset',
  Training = 'training',
  Stopped = 'stopped',
}

export enum Simulations {
  Snake = 'Snake',
  FlappyBird = 'FlappyBird',
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

  networkPlayer: INeatPlayer | null;
  setNetworkPlayer: (player: INeatPlayer | null) => void;

  selectedSimulation: Simulations;
  setSelectedSimulation: (simulation: Simulations) => void;

  isPlayerAlive: boolean;
  setIsPlayerAlive: (value: boolean) => void;

  resetAndStartGame: () => void;
  setResetAndStartGame: (fn: () => void) => void;

  selectedPretrainedModel: string | null;
  setSelectedPretrainedModel: (model: string | null) => void;
};
