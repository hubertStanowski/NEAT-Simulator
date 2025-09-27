import { IPipe, IPipeSet } from './types';
import { Player } from './player';
import {
  SCROLL_SPEED,
  PIPE_GAP_RATIO,
  PIPE_SEPARATION_RATIO,
  PIPE_WIDTH_RATIO,
  PIPE_MIN_HEIGHT_RATIO,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
} from './constants';

export class Pipe implements IPipe {
  x: number;
  y: number;
  width: number;
  height: number;
  isTop: boolean;
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    x: number,
    y: number,
    isTop: boolean,
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = x;
    this.width = canvasWidth * PIPE_WIDTH_RATIO;
    this.isTop = isTop;

    const pipeGap = canvasHeight * PIPE_GAP_RATIO;
    const groundHeight = canvasHeight * 0.172; // Same ratio as ground

    if (isTop) {
      this.height = y - pipeGap / 2;
      this.y = 0;
    } else {
      this.height = canvasHeight - (y + pipeGap / 2) - groundHeight;
      this.y = y + pipeGap / 2;
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
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    xOffset: number = 0,
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Calculate pipe gap and minimum height
    const pipeGap = canvasHeight * PIPE_GAP_RATIO;
    const groundHeight = canvasHeight * 0.172; // Same ratio as ground
    const minHeight = canvasHeight * PIPE_MIN_HEIGHT_RATIO;

    // Calculate valid range for centerY to ensure minimum pipe heights
    const minCenterY = minHeight + pipeGap / 2;
    const maxCenterY = canvasHeight - minHeight - pipeGap / 2 - groundHeight;

    // Generate random centerY within valid range
    const centerY = minCenterY + Math.random() * (maxCenterY - minCenterY);

    this.topPipe = new Pipe(
      canvasWidth + xOffset,
      centerY,
      true,
      canvasWidth,
      canvasHeight
    );
    this.bottomPipe = new Pipe(
      canvasWidth + xOffset,
      centerY,
      false,
      canvasWidth,
      canvasHeight
    );
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
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    canvasWidth: number = DEFAULT_CANVAS_WIDTH,
    canvasHeight: number = DEFAULT_CANVAS_HEIGHT
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    const pipeSeparation = canvasWidth * PIPE_SEPARATION_RATIO;
    const initialOffset = -canvasWidth * 0.2;
    this.pipeSets = [
      new PipeSet(initialOffset, canvasWidth, canvasHeight),
      new PipeSet(initialOffset + pipeSeparation, canvasWidth, canvasHeight),
    ];
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
      this.pipeSets.push(new PipeSet(0, this.canvasWidth, this.canvasHeight));
    }
  }

  collidesWithPlayer(player: Player): boolean {
    return this.pipeSets.some((pipeSet) => pipeSet.collidesWith(player));
  }

  getClosestPipeSet(): PipeSet {
    return this.pipeSets[0].passed ? this.pipeSets[1] : this.pipeSets[0];
  }

  reset(): void {
    const pipeSeparation = this.canvasWidth * PIPE_SEPARATION_RATIO;
    const initialOffset = -this.canvasWidth * 0.2;
    this.pipeSets = [
      new PipeSet(initialOffset, this.canvasWidth, this.canvasHeight),
      new PipeSet(
        initialOffset + pipeSeparation,
        this.canvasWidth,
        this.canvasHeight
      ),
    ];
    this.score = 0;
  }

  updateCanvasSize(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Recreate pipes with new dimensions and proper positioning
    const pipeSeparation = canvasWidth * PIPE_SEPARATION_RATIO;
    const initialOffset = -canvasWidth * 0.2;
    this.pipeSets = [
      new PipeSet(initialOffset, canvasWidth, canvasHeight),
      new PipeSet(initialOffset + pipeSeparation, canvasWidth, canvasHeight),
    ];
  }
}
