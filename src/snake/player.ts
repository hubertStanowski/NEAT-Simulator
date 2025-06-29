import { createGrid } from "./grid";
import { updateColor } from "./visuals";
import {
  trainingGridSize,
  simulationGridSize,
  startingPlayerSize,
  trainingPlayerSize,
} from "../constants";
import { Genome, NeatConfig } from "@/neat";
import { IPlayer, Direction, Grid } from "./types";

export class Player implements IPlayer {
  snake: { row: number; col: number }[];
  grid: Grid;
  food: { row: number; col: number };
  lifespan: number;
  direction: Direction;
  isAlive: boolean;
  fitness: number;
  genome_inputs: number;
  genome_outputs: number;
  genome: Genome;
  vision: number[];
  sensor_view_data: number[];
  steps: number;
  generation: number;
  inTraining: boolean = true;
  gridSize: number;
  stepLimit: number;

  constructor(inTraining: boolean = true) {
    this.inTraining = inTraining;
    this.gridSize = inTraining ? trainingGridSize : simulationGridSize;
    this.stepLimit = inTraining
      ? 10 * trainingGridSize
      : 10 * simulationGridSize;
    const middle = Math.floor(this.gridSize / 2);
    this.snake = Array.from(
      { length: inTraining ? trainingPlayerSize : startingPlayerSize },
      (_, i) => ({
        row: middle,
        col: middle - i,
      }),
    );

    this.grid = createGrid(this.gridSize, this.gridSize);
    this.food = { row: 5, col: 5 };
    this.generateFood();
    this.lifespan = 0;
    this.direction = Direction.RIGHT;
    this.isAlive = true;
    this.fitness = 0;
    this.genome_inputs = 14;
    this.genome_outputs = 3;
    this.genome = new Genome(this.genome_inputs, this.genome_outputs);
    this.vision = [];
    this.sensor_view_data = [];
    this.steps = 0;
    this.generation = 1;
    this.updateGrid();
  }

  moveSnake(ignoreSteps: boolean = false) {
    if (!this.isAlive) return;

    if (!ignoreSteps && this.steps >= this.stepLimit) {
      this.isAlive = false;
      return;
    }

    const newSnake = [...this.snake];
    const head = newSnake[0];
    let newHead;

    switch (this.direction) {
      case Direction.UP:
        newHead = { row: head.row - 1, col: head.col };
        break;
      case Direction.DOWN:
        newHead = { row: head.row + 1, col: head.col };
        break;
      case Direction.LEFT:
        newHead = { row: head.row, col: head.col - 1 };
        break;
      case Direction.RIGHT:
        newHead = { row: head.row, col: head.col + 1 };
        break;
      default:
        newHead = { row: head.row, col: head.col + 1 }; // Default to RIGHT
        break;
    }

    this.checkCollisions(newHead, newSnake);

    if (!this.isAlive) return;

    newSnake.unshift(newHead);
    if (newHead.row === this.food.row && newHead.col === this.food.col) {
      this.generateFood();
      this.steps = 0;
    } else {
      newSnake.pop();
    }

    this.snake = newSnake;
    this.lifespan += 1;
    this.steps += 1;
  }

  generateFood() {
    do {
      this.food = {
        row: Math.floor(Math.random() * this.gridSize),
        col: Math.floor(Math.random() * this.gridSize),
      };
    } while (
      this.snake.some(
        (segment) =>
          segment.row === this.food.row && segment.col === this.food.col,
      )
    );
  }

  checkCollisions(
    newHead: { row: number; col: number },
    newSnake: { row: number; col: number }[],
  ) {
    // Border collisions
    if (
      newHead.row < 0 ||
      newHead.row >= this.gridSize ||
      newHead.col < 0 ||
      newHead.col >= this.gridSize
    ) {
      this.isAlive = false;
      return;
    }

    // Body collisions
    for (const segment of newSnake) {
      if (segment.row === newHead.row && segment.col === newHead.col) {
        this.isAlive = false;
        return;
      }
    }
  }

  updateGrid() {
    const newGrid = createGrid(this.gridSize, this.gridSize);
    this.snake.forEach((segment, index) => {
      newGrid[segment.row][segment.col] = updateColor(
        index,
        this.snake.length,
        this.lifespan,
      );
    });
    newGrid[this.food.row][this.food.col] = [255, 0, 0];
    this.grid = newGrid;
  }

  setDirection(direction: Direction) {
    this.direction = direction;
  }

  getGrid() {
    return this.grid;
  }

  getSnake() {
    return this.snake;
  }

  getFood() {
    return this.food;
  }

  getScore(): number {
    return this.snake.length - startingPlayerSize;
  }

  isFood(row: number, col: number): boolean {
    const color = this.grid[row][col];
    return color[0] === 255 && color[1] === 0 && color[2] === 0;
  }

  isFree(row: number, col: number): boolean {
    const color = this.grid[row][col];
    return color[0] === 0 && color[1] === 0 && color[2] === 0;
  }

  isSnake(row: number, col: number): boolean {
    const color = this.grid[row][col];
    return color[0] !== 0 || color[1] !== 0 || color[2] !== 0;
  }

  // NEAT

  turnLeft() {
    if (this.direction === Direction.UP) {
      this.direction = Direction.LEFT;
    } else if (this.direction === Direction.DOWN) {
      this.direction = Direction.RIGHT;
    } else if (this.direction === Direction.LEFT) {
      this.direction = Direction.DOWN;
    } else if (this.direction === Direction.RIGHT) {
      this.direction = Direction.UP;
    }
  }

  turnRight() {
    if (this.direction === Direction.UP) {
      this.direction = Direction.RIGHT;
    } else if (this.direction === Direction.DOWN) {
      this.direction = Direction.LEFT;
    } else if (this.direction === Direction.LEFT) {
      this.direction = Direction.UP;
    } else if (this.direction === Direction.RIGHT) {
      this.direction = Direction.DOWN;
    }
  }

  clone(inTraining: boolean = true): Player {
    const clone = new Player(inTraining);
    clone.genome = this.genome.clone();
    clone.fitness = this.fitness;
    clone.generation = this.generation;
    clone.genome.generateNetwork();
    return clone;
  }

  transplant(otherPlayer: Player) {
    this.genome = otherPlayer.genome.clone();
    this.generation = otherPlayer.generation;
    this.genome.generateNetwork();
  }

  toggleMode() {
    this.steps = 0;
  }

  raiseFromDead() {
    this.isAlive = true;
  }

  crossover(config: NeatConfig, otherParent: Player): Player {
    const child = new Player();
    child.genome = this.genome.crossover(config, otherParent.genome);
    child.genome.generateNetwork();
    return child;
  }

  updateFitness() {
    // Base score from food eaten
    const score = this.getScore();
    const foodBonus = Math.pow(score, 2) * 10; // Reduced from power 5 to 2 for more balanced growth

    // Survival bonus - encourage longer games
    const survivalBonus = this.lifespan * 0.02;

    // Efficiency bonus - reward quick food collection
    const efficiency = score > 0 ? score / this.lifespan : 0;
    const efficiencyBonus = efficiency * 50;

    // Distance to food bonus - encourage moving towards food
    const headRow = this.snake[0].row;
    const headCol = this.snake[0].col;
    const distanceToFood =
      Math.abs(headRow - this.food.row) + Math.abs(headCol - this.food.col);
    const maxDistance = this.gridSize * 2;
    const distanceBonus = (1 - distanceToFood / maxDistance) * 2;

    // Determine cause of death
    const diedFromSteps = !this.isAlive && this.steps >= this.stepLimit;
    const diedFromCollision = !this.isAlive && this.steps < this.stepLimit;

    // Heavy step penalty for being overly cautious (90% of step limit)
    const stepThreshold = this.stepLimit * 0.9;
    const stepPenalty =
      this.steps > stepThreshold
        ? Math.pow(
            (this.steps - stepThreshold) / (this.stepLimit - stepThreshold),
            2,
          ) * 50
        : 0;

    // Death penalties and bonuses
    let deathModifier = 0;
    if (diedFromSteps) {
      // Heavy penalty for dying from steps (being too afraid)
      deathModifier = -25;
    } else if (diedFromCollision) {
      // Reward for dying from collision (shows aggression, not fear)
      deathModifier = 5;
    }
    // console.log("########################");
    // console.log("Food Bonus:", foodBonus);
    // console.log("Survival Bonus:", survivalBonus);
    // console.log("Efficiency Bonus:", efficiencyBonus);
    // console.log("Distance Bonus:", distanceBonus);
    // console.log("Step Penalty:", stepPenalty);
    // console.log("Death Modifier:", deathModifier);
    // console.log("Final Fitness:", this.fitness);
    // console.log("########################");
    // Calculate final fitness
    this.fitness = Math.max(
      0,
      1 +
        foodBonus +
        survivalBonus +
        efficiencyBonus +
        distanceBonus -
        stepPenalty +
        deathModifier,
    );
  }

  look() {
    const remap = (
      value: number,
      start1: number,
      stop1: number,
      start2: number,
      stop2: number,
    ): number => {
      return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
    };

    this.vision = [];

    const headRow = this.snake[0].row;
    const headCol = this.snake[0].col;
    const foodRow = this.food.row;
    const foodCol = this.food.col;

    // Food direction indicators
    const topFood = foodRow < headRow ? 1 : 0;
    const bottomFood = foodRow > headRow ? 1 : 0;
    const leftFood = foodCol < headCol ? 1 : 0;
    const rightFood = foodCol > headCol ? 1 : 0;

    // Wall distances
    const topWall = remap(headRow, 0, this.gridSize - 1, 1, 0);
    const bottomWall = remap(
      this.gridSize - headRow - 1,
      0,
      this.gridSize - 1,
      1,
      0,
    );
    const leftWall = remap(headCol, 0, this.gridSize - 1, 1, 0);
    const rightWall = remap(
      this.gridSize - headCol - 1,
      0,
      this.gridSize - 1,
      1,
      0,
    );

    // Body distances (excluding backward check)
    let topBody = this.gridSize - 1;
    for (let i = headRow - 1; i >= 0; i--) {
      if (this.isSnake(i, headCol)) {
        topBody = Math.abs(headRow - i);
        break;
      }
    }

    let bottomBody = this.gridSize - 1;
    for (let i = headRow + 1; i < this.gridSize; i++) {
      if (this.isSnake(i, headCol)) {
        bottomBody = Math.abs(headRow - i);
        break;
      }
    }

    let leftBody = this.gridSize - 1;
    for (let j = headCol - 1; j >= 0; j--) {
      if (this.isSnake(headRow, j)) {
        leftBody = Math.abs(headCol - j);
        break;
      }
    }

    let rightBody = this.gridSize - 1;
    for (let j = headCol + 1; j < this.gridSize; j++) {
      if (this.isSnake(headRow, j)) {
        rightBody = Math.abs(headCol - j);
        break;
      }
    }

    topBody = remap(topBody, 0, this.gridSize - 1, 1, 0);
    bottomBody = remap(bottomBody, 0, this.gridSize - 1, 1, 0);
    leftBody = remap(leftBody, 0, this.gridSize - 1, 1, 0);
    rightBody = remap(rightBody, 0, this.gridSize - 1, 1, 0);

    // New parameters
    // 1. Distance to food (Manhattan distance, normalized)
    const distanceToFood =
      Math.abs(headRow - foodRow) + Math.abs(headCol - foodCol);
    const normalizedDistance = remap(
      distanceToFood,
      0,
      this.gridSize * 2,
      1,
      0,
    );

    // 2. Relative angle to food (simplified: diagonal indicator)
    const foodDiagonal = foodRow !== headRow && foodCol !== headCol ? 1 : 0;

    // 3. Hunger level (steps since last food, normalized)
    const hungerLevel = remap(this.steps, 0, this.stepLimit, 0, 1);

    // Build vision array based on direction (removing backward body check)
    if (this.direction === "UP") {
      this.vision.push(
        // Food directions
        topFood,
        bottomFood,
        leftFood,
        rightFood,

        // Body distances (no bottomBody as it's behind)
        topBody,
        leftBody,
        rightBody,

        // Wall distances
        topWall,
        bottomWall,
        leftWall,
        rightWall,

        // New parameters
        normalizedDistance,
        foodDiagonal,
        hungerLevel,
      );
    } else if (this.direction === "DOWN") {
      this.vision.push(
        // Food directions
        bottomFood,
        topFood,
        rightFood,
        leftFood,

        // Body distances (no topBody as it's behind)
        bottomBody,
        rightBody,
        leftBody,

        // Wall distances
        bottomWall,
        topWall,
        rightWall,
        leftWall,

        // New parameters
        normalizedDistance,
        foodDiagonal,
        hungerLevel,
      );
    } else if (this.direction === "LEFT") {
      this.vision.push(
        // Food directions
        leftFood,
        rightFood,
        bottomFood,
        topFood,

        // Body distances (no rightBody as it's behind)
        leftBody,
        bottomBody,
        topBody,

        // Wall distances
        leftWall,
        rightWall,
        bottomWall,
        topWall,

        // New parameters
        normalizedDistance,
        foodDiagonal,
        hungerLevel,
      );
    } else if (this.direction === "RIGHT") {
      this.vision.push(
        // Food directions
        rightFood,
        leftFood,
        topFood,
        bottomFood,

        // Body distances (no leftBody as it's behind)
        rightBody,
        topBody,
        bottomBody,

        // Wall distances
        rightWall,
        leftWall,
        topWall,
        bottomWall,

        // New parameters
        normalizedDistance,
        foodDiagonal,
        hungerLevel,
      );
    }
  }

  decide(show = false) {
    if (!this.vision.length) return;
    const outputs = this.genome.feedForward(this.vision);
    if (show) {
      console.log(outputs);
    }
    const decision = Math.max(...outputs);

    if (outputs[0] === decision) {
      this.turnLeft();
    } else if (outputs[1] === decision) {
      this.turnRight();
    }
  }
}
