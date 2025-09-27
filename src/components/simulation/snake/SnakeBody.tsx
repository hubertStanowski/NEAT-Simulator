import { Player, styleEyes } from '@/snake';

interface SnakeBodyProps {
  cell: [number, number, number]; // RGB color values
  row: number;
  col: number;
  player: Player;
}

const SnakeBody = ({ cell, row, col, player }: SnakeBodyProps) => {
  const isHead = row === player.snake[0].row && col === player.snake[0].col;
  const { eye1Style, eye2Style } = styleEyes(player.direction);

  return (
    <div
      key={`${row}-${col}`}
      style={{
        backgroundColor: `rgb(${cell[0]},${cell[1]},${cell[2]})`,
        position: 'relative',
      }}
      className="aspect-1 col-span-1 row-span-1 flex-1 border-[0.01px] border-neutral-400"
    >
      {isHead && (
        <>
          <div style={eye1Style} />
          <div style={eye2Style} />
        </>
      )}
    </div>
  );
};

export default SnakeBody;
