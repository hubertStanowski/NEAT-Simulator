import { IPlayer } from './types';
import {
  PLAYER_X_RATIO,
  PLAYER_Y_RATIO,
  GRAVITY,
  FLAP_SPEED,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
} from './constants';
import { Genome, NeatConfig } from '@/neat';
import { DoublePipeSet } from './pipes';
import { Ground } from './ground';

export class Player implements IPlayer {
  x: number;
  y: number;
  velocity: number;
  isAlive: boolean;
  isFlying: boolean;
  score: number;
  lifespan: number;
  canvasWidth: number;
  canvasHeight: number;
  // NEAT properties
  fitness: number;
  genome_inputs: number;
  genome_outputs: number;
  genome: Genome;
  vision: number[];
  generation: number;

  constructor(
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT,
    isAi: boolean = true
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth * PLAYER_X_RATIO;
    this.y = canvasHeight * PLAYER_Y_RATIO;
    this.velocity = 0;
    this.isAlive = true;
    this.isFlying = isAi;
    this.score = 0;
    this.lifespan = 0;
    // NEAT initialization
    this.fitness = 0;
    this.genome_inputs = 4;
    this.genome_outputs = 1;
    this.genome = new Genome(this.genome_inputs, this.genome_outputs);
    this.vision = [];
    this.generation = 1;
  }

  update(): void {
    if (!this.isFlying) {
      return;
    }

    this.velocity = Math.min(this.velocity + GRAVITY, FLAP_SPEED * 2);
    this.y += this.velocity;

    if (this.isAlive) {
      this.lifespan++;
    }
  }

  flap(): void {
    if (this.isAlive) {
      this.isFlying = true;
      this.velocity = -FLAP_SPEED;
    }
  }

  getBoundingBox() {
    // Return bounding box that matches the actual visual representation
    // Bird is drawn centered at (player.x - 38, player.y - 27) with dimensions 77x54 (scaled up 2.25x)
    // Using slightly smaller hitbox for better gameplay feel
    return {
      x: this.x - 33, // Visual center - small buffer
      y: this.y - 23, // Visual center - small buffer
      width: 66, // Slightly smaller than visual (77)
      height: 45, // Slightly smaller than visual (54)
    };
  }

  reset(): void {
    this.x = this.canvasWidth * PLAYER_X_RATIO;
    this.y = this.canvasHeight * PLAYER_Y_RATIO;
    this.velocity = 0;
    this.isAlive = true;
    this.isFlying = false; // Start with bird not flying until first input
    this.score = 0;
    this.lifespan = 0;
  }

  updateCanvasSize(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth * PLAYER_X_RATIO;
    this.y = canvasHeight * PLAYER_Y_RATIO;
  }

  kill(): void {
    this.isAlive = false;
    this.isFlying = false;
  }

  // NEAT methods
  clone(): Player {
    const clone = new Player(this.canvasWidth, this.canvasHeight);
    clone.genome = this.genome.clone();
    clone.fitness = this.fitness;
    clone.generation = this.generation;
    clone.genome.generateNetwork();
    return clone;
  }

  crossover(config: NeatConfig, otherParent: Player): Player {
    const child = new Player(this.canvasWidth, this.canvasHeight);
    child.genome = this.genome.crossover(config, otherParent.genome);
    child.genome.generateNetwork();
    return child;
  }

  updateFitness(): void {
    // Fitness based on score and lifespan
    // Score is heavily weighted, lifespan provides base fitness
    this.fitness = 1 + Math.pow(this.score, 2) + this.lifespan / 10;
  }

  look(ground: Ground, pipes: DoublePipeSet): void {
    const remap = (
      value: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number
    ): number => {
      return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    };

    this.vision = [];
    const closestPipeSet = pipes.getClosestPipeSet();
    const heightCap =
      this.canvasHeight -
      ground.getBoundingBox().height -
      this.getBoundingBox().height;

    // 1. Bird's velocity (normalized)
    this.vision.push(remap(this.velocity, -FLAP_SPEED, 2 * FLAP_SPEED, -1, 1));

    // 2. Horizontal distance to next pipe (normalized)
    const closestPipeX = closestPipeSet.topPipe.getBoundingBox().x;
    this.vision.push(
      remap(closestPipeX - this.x, 0, this.canvasWidth - this.x, 0, 1)
    );

    // 3. Vertical distance to bottom pipe opening (normalized)
    const bottomPipeY = closestPipeSet.bottomPipe.getBoundingBox().y;
    this.vision.push(remap(bottomPipeY - this.y, 0, heightCap, 0, 1));

    // 4. Vertical distance from top pipe opening (normalized)
    const topPipeBottom =
      closestPipeSet.topPipe.getBoundingBox().y +
      closestPipeSet.topPipe.getBoundingBox().height;
    this.vision.push(remap(this.y - topPipeBottom, 0, heightCap, 0, 1));
  }

  decide(): void {
    if (!this.vision.length) return;

    const decision = this.genome.feedForward(this.vision)[0];
    // Flap if output is above threshold
    if (decision > 0.6) {
      this.flap();
    }
  }

  getScore(): number {
    return this.score;
  }
}
