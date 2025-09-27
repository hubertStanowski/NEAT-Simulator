import { IPipe, IPipeSet } from './types';
import { Player } from './player';
import {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  SCROLL_SPEED,
  PIPE_GAP,
  PIPE_SEPARATION,
  PIPE_WIDTH,
} from './constants';

export class Pipe implements IPipe {
  x: number;
  y: number;
  width: number;
  height: number;
  isTop: boolean;

  constructor(x: number, y: number, isTop: boolean) {
    this.x = x;
    this.width = PIPE_WIDTH;
    this.isTop = isTop;

    if (isTop) {
      this.height = y - PIPE_GAP / 2;
      this.y = 0;
    } else {
      this.height = WINDOW_HEIGHT - (y + PIPE_GAP / 2) - 110; // Account for ground height
      this.y = y + PIPE_GAP / 2;
    }
  }

  update(): void {
    this.x -= SCROLL_SPEED;
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

export class PipeSet implements IPipeSet {
  topPipe: Pipe;
  bottomPipe: Pipe;
  passed: boolean;

  constructor(xOffset: number = 0) {
    // Random pipe height between -200 and 150 (similar to Python)
    const pipeHeight = Math.random() * 350 - 200;
    const centerY = WINDOW_HEIGHT / 2 + pipeHeight;

    this.topPipe = new Pipe(WINDOW_WIDTH + xOffset, centerY, true);
    this.bottomPipe = new Pipe(WINDOW_WIDTH + xOffset, centerY, false);
    this.passed = false;
  }

  update(): void {
    this.topPipe.update();
    this.bottomPipe.update();
  }

  isOffscreen(): boolean {
    return this.bottomPipe.x + this.bottomPipe.width < 0;
  }

  collidesWith(player: Player): boolean {
    const playerBox = player.getBoundingBox();
    const topPipeBox = this.topPipe.getBoundingBox();
    const bottomPipeBox = this.bottomPipe.getBoundingBox();

    // Check collision with top pipe
    const topCollision =
      playerBox.x < topPipeBox.x + topPipeBox.width &&
      playerBox.x + playerBox.width > topPipeBox.x &&
      playerBox.y < topPipeBox.y + topPipeBox.height &&
      playerBox.y + playerBox.height > topPipeBox.y;

    // Check collision with bottom pipe
    const bottomCollision =
      playerBox.x < bottomPipeBox.x + bottomPipeBox.width &&
      playerBox.x + playerBox.width > bottomPipeBox.x &&
      playerBox.y < bottomPipeBox.y + bottomPipeBox.height &&
      playerBox.y + playerBox.height > bottomPipeBox.y;

    // Check if player flew off the top of the screen
    const offScreenTop = player.y < 0;

    return topCollision || bottomCollision || offScreenTop;
  }

  checkPassed(playerX: number): boolean {
    if (this.topPipe.x + this.topPipe.width < playerX && !this.passed) {
      this.passed = true;
      return true;
    }
    return false;
  }
}

export class DoublePipeSet {
  pipeSets: PipeSet[];
  score: number;

  constructor() {
    this.pipeSets = [new PipeSet(), new PipeSet(PIPE_SEPARATION)];
    this.score = 0;
  }

  update(playerX: number): void {
    let needsNewPipe = false;

    for (const pipeSet of this.pipeSets) {
      pipeSet.update();

      if (pipeSet.isOffscreen()) {
        needsNewPipe = true;
      }

      if (pipeSet.checkPassed(playerX)) {
        this.score++;
      }
    }

    if (needsNewPipe) {
      // Remove the first pipe set and add a new one
      this.pipeSets.shift();
      this.pipeSets.push(new PipeSet());
    }
  }

  collidesWithPlayer(player: Player): boolean {
    return this.pipeSets.some((pipeSet) => pipeSet.collidesWith(player));
  }

  getClosestPipeSet(): PipeSet {
    return this.pipeSets[0].passed ? this.pipeSets[1] : this.pipeSets[0];
  }

  reset(): void {
    this.pipeSets = [new PipeSet(), new PipeSet(PIPE_SEPARATION)];
    this.score = 0;
  }
}
