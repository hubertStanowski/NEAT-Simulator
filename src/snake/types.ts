import { IGenome } from '@/neat';

export type GridCell = [number, number, number];
export type Grid = GridCell[][];

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface IPlayer {
  snake: { row: number; col: number }[];
  grid: Grid;
  food: { row: number; col: number };
  lifespan: number;
  direction: Direction;
  isAlive: boolean;
  fitness: number;
  genome_inputs: number;
  genome_outputs: number;
  genome: IGenome;
  vision: number[];
  sensor_view_data: number[];
  steps: number;
  generation: number;
}
