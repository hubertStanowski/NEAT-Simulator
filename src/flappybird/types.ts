export interface IPlayer {
  x: number;
  y: number;
  velocity: number;
  isAlive: boolean;
  isFlying: boolean;
  score: number;
  lifespan: number;
}

export interface IPipe {
  x: number;
  y: number;
  width: number;
  height: number;
  isTop: boolean;
}

export interface IPipeSet {
  topPipe: IPipe;
  bottomPipe: IPipe;
  passed: boolean;
}

export interface IGround {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum GameState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  GAME_OVER = 'GAME_OVER',
}
