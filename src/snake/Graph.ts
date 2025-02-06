export const createGrid = (
  rows: number,
  cols: number,
): [number, number, number][][] => {
  return Array.from({ length: rows }, () => Array(cols).fill([0, 0, 0]));
};

export const updateGridCell = (
  grid: [number, number, number][][],
  rowIndex: number,
  cellIndex: number,
  value: [number, number, number],
): [number, number, number][][] => {
  return grid.map((row, rIdx) =>
    row.map((cell, cIdx) =>
      rIdx === rowIndex && cIdx === cellIndex ? value : cell,
    ),
  );
};
