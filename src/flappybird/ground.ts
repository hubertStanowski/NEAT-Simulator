import { IGround } from './types';
import { Player } from './player';
import {
  SCROLL_SPEED,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
} from './constants';

export class Ground implements IGround {
  x: number;
  y: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = canvasWidth; // Match canvas width
    this.height = canvasHeight * 0.172; // Ground height as ratio (165/960 = 0.172)
    this.x = 0;
    this.y = canvasHeight - this.height;
  }

  update(): void {
    this.x -= SCROLL_SPEED;
    // Reset position to create seamless scrolling effect
    // Use width-based threshold for seamless scrolling
    if (Math.abs(this.x) >= this.width) {
      this.x = this.x + this.width; // Move by exactly one width to maintain seamless scrolling
    }
  }

  updateCanvasSize(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = canvasWidth;
    this.height = canvasHeight * 0.172;
    this.y = canvasHeight - this.height;
  }

  collidesWithPlayer(player: Player): boolean {
    const playerBox = player.getBoundingBox();
    // Simple ground collision: check if player's bottom edge touches ground top
    return playerBox.y + playerBox.height >= this.y;
  }

  getBoundingBox() {
    return {
      x: 0,
      y: this.y,
      width: this.canvasWidth,
      height: this.height,
    };
  }
}
