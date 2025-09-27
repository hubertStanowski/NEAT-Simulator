import { Player, Grid, getGridSize } from '@/snake';
import SnakeBody from './SnakeBody';

interface SnakeGridProps {
  grid: Grid;
  player: Player;
}

const SnakeGrid = ({ grid, player }: SnakeGridProps) => {
  return (
    <div
      id="snake"
      className={`grid-cols-${getGridSize(grid)} grid-rows-${getGridSize(grid)} border-neutral-40 grid h-full w-full border-[0.01px]`}
    >
      {grid.map((row, r) => (
        <div
          key={r}
          className={`col-span-${getGridSize(grid)} row-span-1 flex`}
        >
          {row.map((cell, c) => (
            <SnakeBody
              key={`${r}-${c}`}
              cell={cell}
              row={r}
              col={c}
              player={player}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SnakeGrid;
