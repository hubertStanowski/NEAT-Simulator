import { createGrid } from "./graph";
import { updateColor } from "./visuals";
import { gridSize } from "../constants";

class Player {
  snake: { row: number; col: number }[];
  grid: [number, number, number][][];
  food: { row: number; col: number };
  step: number;
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  isAlive: boolean;

  constructor() {
    this.snake = [{ row: 12, col: 12 }];
    this.grid = createGrid(gridSize, gridSize);
    this.food = { row: 5, col: 5 };
    this.step = 0;
    this.direction = "RIGHT";
    this.isAlive = true;
  }

  moveSnake() {
    if (!this.isAlive) return;

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

    // Check if the new head position is out of bounds
    if (
      newHead.row < 0 ||
      newHead.row >= gridSize ||
      newHead.col < 0 ||
      newHead.col >= gridSize
    ) {
      this.isAlive = false;
      return;
    }

    // Check if the new head position collides with the snake's body
    for (const segment of newSnake) {
      if (segment.row === newHead.row && segment.col === newHead.col) {
        this.isAlive = false;
        return;
      }
    }

    newSnake.unshift(newHead);
    if (newHead.row === this.food.row && newHead.col === this.food.col) {
      this.food = {
        row: Math.floor(Math.random() * gridSize),
        col: Math.floor(Math.random() * gridSize),
      };
    } else {
      newSnake.pop();
    }

    this.snake = newSnake;
    this.step += 1;
  }

  updateGrid() {
    const newGrid = createGrid(gridSize, gridSize);
    this.snake.forEach((segment, index) => {
      newGrid[segment.row][segment.col] = updateColor(
        index,
        this.snake.length,
        this.step,
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
}

export default Player;
