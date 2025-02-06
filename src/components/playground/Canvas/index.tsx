import { useState, useEffect } from "react";
import { createGrid, updateGridCell } from "../../../snake/Graph";

const Canvas = () => {
  const [grid, setGrid] = useState<[number, number, number][][]>([]);

  useEffect(() => {
    const newGrid = createGrid(25, 25);
    setGrid(newGrid);
    setGrid(updateGridCell(newGrid, 12, 12, [255, 255, 255]));
  }, []);

  return (
    <div className="grid-cols-25 grid-rows-25 grid h-full w-full">
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="col-span-25 row-span-1 flex">
          {row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              style={{
                backgroundColor: `rgb(${cell[0]}, ${cell[1]}, ${cell[2]})`,
              }}
              className="aspect-1 col-span-1 row-span-1 flex-1 border-[0.01px] border-neutral-400"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Canvas;
