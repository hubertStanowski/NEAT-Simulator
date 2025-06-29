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
      ? 15 * trainingGridSize
      : 15 * simulationGridSize;
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
    const foodBonus = score * score * 100;

    // Survival bonus - encourage longer games but not excessively
    const survivalBonus = Math.min(this.lifespan * 0.02, 100); // Cap survival bonus
    // Efficiency bonus - reward quick food collection
    const efficiency = score > 0 ? score / this.lifespan : 0;
    const efficiencyBonus = efficiency * 500; // Increased to encourage faster eating

    // Distance to food bonus - encourage moving towards food
    const headRow = this.snake[0].row;
    const headCol = this.snake[0].col;
    const distanceToFood =
      Math.abs(headRow - this.food.row) + Math.abs(headCol - this.food.col);
    const maxDistance = this.gridSize * 2;
    const normalizedDistance = 1 - distanceToFood / maxDistance;
    const distanceBonus = normalizedDistance * 10; // Increased weight

    // Movement penalty - discourage excessive turning
    const movementPenalty =
      this.lifespan > 0 && score === 0 ? this.lifespan * 0.05 : 0;

    // Step penalty - only apply when being overly cautious
    const stepPenalty =
      this.steps > this.stepLimit * 0.8 && score === 0
        ? Math.pow(
            (this.steps - this.stepLimit * 0.8) / (this.stepLimit * 0.2),
            2,
          ) * 20
        : 0;

    // Death penalties
    let deathModifier = 0;
    if (!this.isAlive) {
      const diedFromSteps = this.steps >= this.stepLimit;
      if (diedFromSteps && score === 0) {
        // Heavy penalty only if died from steps without eating
        deathModifier = -50;
      } else if (diedFromSteps && score > 0) {
        // Light penalty if ate something but ran out of steps
        deathModifier = -10;
      }
      // No penalty for collision deaths - they tried!
    }

    // Calculate final fitness with minimum base fitness
    this.fitness = Math.max(
      1,
      10 + // Base fitness to ensure positive values
        foodBonus +
        survivalBonus +
        efficiencyBonus +
        distanceBonus -
        movementPenalty -
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

    // 1. Direct food direction (clearer signals)
    const foodDeltaRow = foodRow - headRow;
    const foodDeltaCol = foodCol - headCol;
    const foodAngle = Math.atan2(foodDeltaRow, foodDeltaCol);

    // Convert angle to directional indicators based on current snake direction
    let foodForward = 0,
      foodLeft = 0,
      foodRight = 0;

    if (this.direction === Direction.UP) {
      if (foodDeltaRow < 0) foodForward = 1;
      if (foodDeltaCol < 0) foodLeft = 1;
      if (foodDeltaCol > 0) foodRight = 1;
    } else if (this.direction === Direction.DOWN) {
      if (foodDeltaRow > 0) foodForward = 1;
      if (foodDeltaCol > 0) foodLeft = 1;
      if (foodDeltaCol < 0) foodRight = 1;
    } else if (this.direction === Direction.LEFT) {
      if (foodDeltaCol < 0) foodForward = 1;
      if (foodDeltaRow > 0) foodLeft = 1;
      if (foodDeltaRow < 0) foodRight = 1;
    } else if (this.direction === Direction.RIGHT) {
      if (foodDeltaCol > 0) foodForward = 1;
      if (foodDeltaRow < 0) foodLeft = 1;
      if (foodDeltaRow > 0) foodRight = 1;
    }

    // 2. Distance to obstacles in relative directions
    const checkDistance = (rowDelta: number, colDelta: number): number => {
      let distance = 0;
      let checkRow = headRow + rowDelta;
      let checkCol = headCol + colDelta;

      while (
        checkRow >= 0 &&
        checkRow < this.gridSize &&
        checkCol >= 0 &&
        checkCol < this.gridSize &&
        !this.isSnake(checkRow, checkCol)
      ) {
        distance++;
        checkRow += rowDelta;
        checkCol += colDelta;
      }

      return remap(distance, 0, this.gridSize - 1, 0, 1);
    };

    // Get distances based on current direction
    let distanceForward = 0,
      distanceLeft = 0,
      distanceRight = 0;

    if (this.direction === Direction.UP) {
      distanceForward = checkDistance(-1, 0);
      distanceLeft = checkDistance(0, -1);
      distanceRight = checkDistance(0, 1);
    } else if (this.direction === Direction.DOWN) {
      distanceForward = checkDistance(1, 0);
      distanceLeft = checkDistance(0, 1);
      distanceRight = checkDistance(0, -1);
    } else if (this.direction === Direction.LEFT) {
      distanceForward = checkDistance(0, -1);
      distanceLeft = checkDistance(1, 0);
      distanceRight = checkDistance(-1, 0);
    } else if (this.direction === Direction.RIGHT) {
      distanceForward = checkDistance(0, 1);
      distanceLeft = checkDistance(-1, 0);
      distanceRight = checkDistance(1, 0);
    }

    // 3. Danger indicators (immediate threats)
    const isDanger = (row: number, col: number): boolean => {
      return (
        row < 0 ||
        row >= this.gridSize ||
        col < 0 ||
        col >= this.gridSize ||
        this.isSnake(row, col)
      );
    };

    let dangerForward = 0,
      dangerLeft = 0,
      dangerRight = 0;

    if (this.direction === Direction.UP) {
      dangerForward = isDanger(headRow - 1, headCol) ? 1 : 0;
      dangerLeft = isDanger(headRow, headCol - 1) ? 1 : 0;
      dangerRight = isDanger(headRow, headCol + 1) ? 1 : 0;
    } else if (this.direction === Direction.DOWN) {
      dangerForward = isDanger(headRow + 1, headCol) ? 1 : 0;
      dangerLeft = isDanger(headRow, headCol + 1) ? 1 : 0;
      dangerRight = isDanger(headRow, headCol - 1) ? 1 : 0;
    } else if (this.direction === Direction.LEFT) {
      dangerForward = isDanger(headRow, headCol - 1) ? 1 : 0;
      dangerLeft = isDanger(headRow + 1, headCol) ? 1 : 0;
      dangerRight = isDanger(headRow - 1, headCol) ? 1 : 0;
    } else if (this.direction === Direction.RIGHT) {
      dangerForward = isDanger(headRow, headCol + 1) ? 1 : 0;
      dangerLeft = isDanger(headRow - 1, headCol) ? 1 : 0;
      dangerRight = isDanger(headRow + 1, headCol) ? 1 : 0;
    }

    // 4. Additional useful parameters
    const distanceToFood =
      Math.abs(headRow - foodRow) + Math.abs(headCol - foodCol);
    const normalizedFoodDistance = remap(
      distanceToFood,
      0,
      this.gridSize * 2,
      1,
      0,
    );

    // Snake length normalized
    const snakeLength = remap(
      this.snake.length,
      3,
      this.gridSize * this.gridSize,
      0,
      1,
    );

    // Hunger level
    const hungerLevel = remap(this.steps, 0, this.stepLimit, 0, 1);

    // Build vision array - simplified and more intuitive
    this.vision = [
      // Food direction (3 inputs)
      foodForward,
      foodLeft,
      foodRight,

      // Distance to obstacles (3 inputs)
      distanceForward,
      distanceLeft,
      distanceRight,

      // Immediate danger (3 inputs)
      dangerForward,
      dangerLeft,
      dangerRight,

      // Global info (5 inputs)
      normalizedFoodDistance,
      foodAngle / Math.PI, // Normalized angle to food
      snakeLength,
      hungerLevel,
      1, // Bias
    ];
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
