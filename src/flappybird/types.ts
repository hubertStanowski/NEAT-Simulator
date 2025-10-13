import { INeatPlayer } from '@/neat';

export interface IFlappyBirdPlayer extends INeatPlayer {
  x: number;
  y: number;
  velocity: number;
  isFlying: boolean;
  score: number;
  canvasWidth: number;
  canvasHeight: number;
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
