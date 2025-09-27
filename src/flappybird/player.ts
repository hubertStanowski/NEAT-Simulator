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
    // Return bounding box that matches the actual visual representation
    // Bird is drawn centered at (player.x - 17, player.y - 12) with dimensions 34x24
    // Using slightly smaller hitbox for better gameplay feel
    return {
      x: this.x - 15, // Visual center - small buffer
      y: this.y - 10, // Visual center - small buffer
      width: 30, // Slightly smaller than visual (34)
      height: 20, // Slightly smaller than visual (24)
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
