import { IGround } from './types';
import { Player } from './player';
import { WINDOW_HEIGHT, SCROLL_SPEED } from './constants';

export class Ground implements IGround {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor() {
    this.width = 480; // Match window width
    this.height = 110; // Ground height from Python assets
    this.x = 0;
    this.y = WINDOW_HEIGHT - this.height;
  }

  update(): void {
    this.x -= SCROLL_SPEED;
    // Reset position to create scrolling effect
    if (Math.abs(this.x) > 50) {
      this.x = 0;
    }
  }

  collidesWithPlayer(player: Player): boolean {
    const playerBox = player.getBoundingBox();
    const groundBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    return (
      playerBox.x < groundBox.x + groundBox.width &&
      playerBox.x + playerBox.width > groundBox.x &&
      playerBox.y < groundBox.y + groundBox.height &&
      playerBox.y + playerBox.height > groundBox.y
    );
  }

  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}
