import { INeatPlayer } from '@/neat';

export type GridCell = [number, number, number];
export type Grid = GridCell[][];

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface ISnakePlayer extends INeatPlayer {
  snake: { row: number; col: number }[];
  grid: Grid;
  food: { row: number; col: number };
  direction: Direction;
  sensor_view_data: number[];
  steps: number;
  inTraining: boolean;
  gridSize: number;
  stepLimit: number;
}
