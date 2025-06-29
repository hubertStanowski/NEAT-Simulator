import { Grid, GridCell } from "./types";

export const createGrid = (rows: number, cols: number): Grid => {
  return Array.from({ length: rows }, () => Array(cols).fill([0, 0, 0]));
};

export const updateGridCell = (
  grid: Grid,
  rowIndex: number,
  cellIndex: number,
  value: GridCell,
): Grid => {
  return grid.map((row, rIdx) =>
    row.map((cell, cIdx) =>
      rIdx === rowIndex && cIdx === cellIndex ? value : cell,
    ),
  );
};

export const getGridSize = (grid: Grid): number => {
  return grid.length;
};
