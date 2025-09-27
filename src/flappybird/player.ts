import { IPlayer } from './types';
import { PLAYER_X, PLAYER_Y, GRAVITY, FLAP_SPEED } from './constants';

export class Player implements IPlayer {
  x: number;
  y: number;
  velocity: number;
  isAlive: boolean;
  isFlying: boolean;
  score: number;
  lifespan: number;

  constructor() {
    this.x = PLAYER_X;
    this.y = PLAYER_Y;
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
    // Return a simple bounding box for collision detection
    // Adjustments based on the Python collision detection
    return {
      x: this.x + 5,
      y: this.y + 10,
      width: 25, // Approximate bird width
      height: 15, // Approximate bird height
    };
  }

  reset(): void {
    this.x = PLAYER_X;
    this.y = PLAYER_Y;
    this.velocity = 0;
    this.isAlive = true;
    this.isFlying = false; // Start with bird not flying until first input
    this.score = 0;
    this.lifespan = 0;
  }

  kill(): void {
    this.isAlive = false;
    this.isFlying = false;
  }
}
