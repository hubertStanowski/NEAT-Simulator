import { IPlayer } from './types';
import {
  PLAYER_X_RATIO,
  PLAYER_Y_RATIO,
  GRAVITY,
  FLAP_SPEED,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
} from './constants';

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

  constructor(
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth * PLAYER_X_RATIO;
    this.y = canvasHeight * PLAYER_Y_RATIO;
    this.velocity = 0;
    this.isAlive = true;
    this.isFlying = true;
    this.score = 0;
    this.lifespan = 0;
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
    // Bird is drawn centered at (player.x - 25, player.y - 18) with dimensions 51x36 (scaled up 1.5x)
    // Using slightly smaller hitbox for better gameplay feel
    return {
      x: this.x - 22, // Visual center - small buffer
      y: this.y - 15, // Visual center - small buffer
      width: 44, // Slightly smaller than visual (51)
      height: 30, // Slightly smaller than visual (36)
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
  }

  kill(): void {
    this.isAlive = false;
    this.isFlying = false;
  }
}
