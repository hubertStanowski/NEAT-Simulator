import { useState, useEffect } from "react";

const Canvas = () => {
  const [grid, setGrid] = useState<number[][]>([]);
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  useEffect(() => {
    const createGrid = () => {
      const rows = 25;
      const cols = 25;
      const newGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
      setGrid(newGrid);
    };

    createGrid();
  }, []);

  const updateCell = (rowIndex: number, cellIndex: number, value: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          rIdx === rowIndex && cIdx === cellIndex ? value : cell,
        ),
      );
      return newGrid;
    });
  };

  const handleCellMouseDown = (rowIndex: number, cellIndex: number) => {
    setIsMouseDown(true);
    updateCell(rowIndex, cellIndex, 1);
  };

  const handleCellMouseEnter = (rowIndex: number, cellIndex: number) => {
    if (isMouseDown) {
      updateCell(rowIndex, cellIndex, 1);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div
      onMouseUp={handleMouseUp}
      className="grid-cols-25 grid-rows-25 grid h-full w-full"
    >
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="col-span-25 row-span-1 flex">
          {row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              onMouseDown={() => handleCellMouseDown(rowIndex, cellIndex)}
              onMouseEnter={() => handleCellMouseEnter(rowIndex, cellIndex)}
              className={`aspect-1 col-span-1 row-span-1 flex-1 border-[0.01px] border-neutral-400 ${cell === 1 ? "bg-red-500" : "bg-transparent"}`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
