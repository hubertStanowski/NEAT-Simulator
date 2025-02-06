import { createGrid } from "./grid";
import { updateColor } from "./visuals";
import { gridSize } from "../constants";
import { Genome } from "../neat/genome";
import { NeatConfig } from "../neat/neatConfig";
import { stepLimit } from "../constants";

class Player {
  snake: { row: number; col: number }[];
  grid: [number, number, number][][];
  food: { row: number; col: number };
  lifespan: number;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  isAlive: boolean;
  fitness: number;
  genome_inputs: number;
  genome_outputs: number;
  genome: Genome;
  vision: number[];
  sensor_view_data: number[];
  steps: number;
  generation: number;

  constructor() {
    this.snake = [
      { row: 12, col: 12 },
      { row: 12, col: 11 },
    ];
    this.grid = createGrid(gridSize, gridSize);
    this.food = { row: 5, col: 5 };
    this.lifespan = 0;
    this.direction = "RIGHT";
    this.isAlive = true;
    this.fitness = 0;
    this.genome_inputs = 12;
    this.genome_outputs = 3;
    this.genome = new Genome(this.genome_inputs, this.genome_outputs);
    this.vision = [];
    this.sensor_view_data = [];
    this.steps = 0;
    this.generation = 1;
    this.updateGrid();
  }

  moveSnake() {
    if (!this.isAlive) return;

    if (this.steps >= stepLimit) {
      this.isAlive = false;
      return;
    }

    const newSnake = [...this.snake];
    const head = newSnake[0];
    let newHead;

    switch (this.direction) {
      case "UP":
        newHead = { row: head.row - 1, col: head.col };
        break;
      case "DOWN":
        newHead = { row: head.row + 1, col: head.col };
        break;
      case "LEFT":
        newHead = { row: head.row, col: head.col - 1 };
        break;
      case "RIGHT":
        newHead = { row: head.row, col: head.col + 1 };
        break;
    }

    this.checkCollisions(newHead, newSnake);

    if (!this.isAlive) return;

    newSnake.unshift(newHead);
    if (newHead.row === this.food.row && newHead.col === this.food.col) {
      this.food = {
        row: Math.floor(Math.random() * gridSize),
        col: Math.floor(Math.random() * gridSize),
      };
      this.steps = 0;
    } else {
      newSnake.pop();
    }

    this.snake = newSnake;
    this.lifespan += 1;
    this.steps += 1;
  }

  checkCollisions(
    newHead: { row: number; col: number },
    newSnake: { row: number; col: number }[],
  ) {
    // Border collisions
    if (
      newHead.row < 0 ||
      newHead.row >= gridSize ||
      newHead.col < 0 ||
      newHead.col >= gridSize
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
    const newGrid = createGrid(gridSize, gridSize);
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

  setDirection(direction: "UP" | "DOWN" | "LEFT" | "RIGHT") {
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
    return this.snake.length - 2;
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

  // # Direction change for AI (for human they are relative to the user view not head)
  //   def turn_left(self) -> None:
  //       if self.row_vel != 0:
  //           self.col_vel = self.row_vel
  //           self.row_vel = 0
  //       else:
  //           self.row_vel = -self.col_vel
  //           self.col_vel = 0

  //   def turn_right(self) -> None:
  //       if self.row_vel != 0:
  //           self.col_vel = -self.row_vel
  //           self.row_vel = 0
  //       else:
  //           self.row_vel = self.col_vel
  //           self.col_vel = 0

  // switch (this.direction) {
  //   case "UP":
  //     newHead = { row: head.row - 1, col: head.col };
  //     break;
  //   case "DOWN":
  //     newHead = { row: head.row + 1, col: head.col };
  //     break;
  //   case "LEFT":
  //     newHead = { row: head.row, col: head.col - 1 };
  //     break;
  //   case "RIGHT":
  //     newHead = { row: head.row, col: head.col + 1 };
  //     break;
  // }

  turnLeft() {
    if (this.direction === "UP") {
      this.direction = "LEFT";
    } else if (this.direction === "DOWN") {
      this.direction = "RIGHT";
    } else if (this.direction === "LEFT") {
      this.direction = "DOWN";
    } else if (this.direction === "RIGHT") {
      this.direction = "UP";
    }
  }

  turnRight() {
    if (this.direction === "UP") {
      this.direction = "RIGHT";
    } else if (this.direction === "DOWN") {
      this.direction = "LEFT";
    } else if (this.direction === "LEFT") {
      this.direction = "UP";
    } else if (this.direction === "RIGHT") {
      this.direction = "DOWN";
    }
  }

  clone(): Player {
    const clone = new Player();
    clone.genome = this.genome.clone();
    clone.fitness = this.fitness;
    clone.generation = this.generation;
    clone.genome.generateNetwork();
    return clone;
  }

  crossover(config: NeatConfig, otherParent: Player): Player {
    const child = new Player();
    child.genome = this.genome.crossover(config, otherParent.genome);
    child.genome.generateNetwork();
    return child;
  }

  updateFitness() {
    const survivalBonus = 0; // this.lifespan / 100
    const foodBonus = Math.pow(this.getScore(), 3);
    const collisionPenalty = this.isAlive ? 1 : 0.8;
    this.fitness = (1 + foodBonus + survivalBonus) * collisionPenalty;
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

    const foodRow = this.food.row;
    const foodCol = this.food.col;

    const topFood = foodRow < this.snake[0].row ? 1 : 0;
    const bottomFood = foodRow > this.snake[0].row ? 1 : 0;
    const leftFood = foodCol < this.snake[0].col ? 1 : 0;
    const rightFood = foodCol > this.snake[0].col ? 1 : 0;

    const topWall = remap(this.snake[0].row, 0, gridSize - 1, 0, 1);
    const bottomWall = remap(
      gridSize - this.snake[0].row - 1,
      0,
      gridSize - 1,
      0,
      1,
    );
    const leftWall = remap(this.snake[0].col, 0, gridSize - 1, 0, 1);
    const rightWall = remap(
      gridSize - this.snake[0].col - 1,
      0,
      gridSize - 1,
      0,
      1,
    );

    let topBody = gridSize - 1;
    for (let i = this.snake[0].row - 1; i >= 0; i--) {
      if (this.isSnake(i, this.snake[0].col)) {
        topBody = i;
        break;
      }
    }

    let bottomBody = gridSize - 1;
    for (let i = this.snake[0].row + 1; i < gridSize; i++) {
      if (this.isSnake(i, this.snake[0].col)) {
        bottomBody = i;
        break;
      }
    }

    let leftBody = gridSize - 1;
    for (let j = this.snake[0].col - 1; j >= 0; j--) {
      if (this.isSnake(this.snake[0].row, j)) {
        leftBody = j;
        break;
      }
    }

    let rightBody = gridSize - 1;
    for (let j = this.snake[0].col + 1; j < gridSize; j++) {
      if (this.isSnake(this.snake[0].row, j)) {
        rightBody = j;
        break;
      }
    }

    topBody = remap(topBody, 0, gridSize - 1, 0, 1);
    bottomBody = remap(bottomBody, 0, gridSize - 1, 0, 1);
    leftBody = remap(leftBody, 0, gridSize - 1, 0, 1);
    rightBody = remap(rightBody, 0, gridSize - 1, 0, 1);

    if (this.direction === "UP") {
      this.vision.push(
        topFood,
        bottomFood,
        leftFood,
        rightFood,

        topBody,
        bottomBody,
        leftBody,
        rightBody,

        topWall,
        bottomWall,
        leftWall,
        rightWall,
      );
    } else if (this.direction === "DOWN") {
      this.vision.push(
        bottomFood,
        topFood,
        rightFood,
        leftFood,

        bottomBody,
        topBody,
        rightBody,
        leftBody,

        bottomWall,
        topWall,
        rightWall,
        leftWall,
      );
    } else if (this.direction === "LEFT") {
      this.vision.push(
        leftFood,
        rightFood,
        bottomFood,
        topFood,

        leftBody,
        rightBody,
        bottomBody,
        topBody,

        leftWall,
        rightWall,
        bottomWall,
        topWall,
      );
    } else if (this.direction === "RIGHT") {
      this.vision.push(
        rightFood,
        leftFood,
        topFood,
        bottomFood,

        rightBody,
        leftBody,
        topBody,
        bottomBody,

        rightWall,
        leftWall,
        topWall,
        bottomWall,
      );
    }

    // console.log(this.vision);
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
      // console.log("LEFT");
    } else if (outputs[1] === decision) {
      this.turnRight();
      // console.log("RIGHT");
    }
  }
}

export default Player;
