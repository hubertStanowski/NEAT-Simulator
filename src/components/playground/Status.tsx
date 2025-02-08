import Player from "src/snake/player";

type StatusProps = {
  currentGeneration: number;
  aliveCount: number;
  populationSize: number;
  networkPlayer: Player;
  score: number;
};

const Status: React.FC<StatusProps> = ({
  currentGeneration,
  aliveCount,
  populationSize,
  networkPlayer,
  score,
}) => {
  return (
    <div className="text-3xl text-white">
      <div>Score: {score}</div>
      <div>Current Generation: {currentGeneration}</div>
      <div>
        Alive: {aliveCount} / {populationSize}
      </div>
    </div>
  );
};

export default Status;
