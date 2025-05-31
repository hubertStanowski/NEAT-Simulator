import { GameStatus } from "../../constants";
import { useSimulation } from "../../contexts/SimulationContext";

const Parameters = () => {
  const {
    humanPlaying,
    setHumanPlaying,
    populationSize,
    setPopulationSize,
    speed,
    setSpeed,
    gameStatus,
    setGameStatus,
    targetGeneration,
    setTargetGeneration,
    trainedGenerations,
  } = useSimulation();

  return (
    <div className="flex h-full flex-col items-center gap-5 py-20 text-center text-white">
      <button
        className={`parameter-button highlighted-parameter-button mb-4 ${
          humanPlaying
            ? "bg-green-600 hover:bg-green-700"
            : "bg-purple-700 hover:bg-purple-800"
        }`}
        onClick={(e) => {
          e.currentTarget.blur();
          setHumanPlaying(!humanPlaying);
        }}
      >
        {humanPlaying ? "Human Playing" : "AI Playing"}
      </button>

      <div className="w-full items-center px-4">
        <p className="mb-2">Population Size: {populationSize}</p>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={populationSize}
          onChange={(e) => setPopulationSize(Number(e.target.value))}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>

      <div className="w-full items-center px-4">
        <p className="mb-2">Speed: {speed}</p>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          onClick={(e) => e.currentTarget.blur()}
          className={`mb-4 h-8 w-full ${
            humanPlaying && speed >= 80 ? "accent-red-700" : "accent-purple-700"
          }`}
        />
      </div>

      <div className="w-full items-center px-4">
        <p className="mb-2">Generation: {targetGeneration}</p>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={targetGeneration}
          onChange={(e) => setTargetGeneration(Number(e.target.value))}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>

      <div className="mt-10 flex flex-col gap-4 text-2xl">
        {!humanPlaying &&
          (gameStatus === GameStatus.Idle ||
            gameStatus === GameStatus.Stopped ||
            gameStatus === GameStatus.Reset) && (
            <button
              className={`parameter-button ${
                targetGeneration <= trainedGenerations
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={(e) => {
                e.currentTarget.blur();
                setGameStatus(GameStatus.Training);
              }}
            >
              {targetGeneration <= trainedGenerations
                ? "Start Simulation"
                : "Start Training"}
            </button>
          )}

        {!humanPlaying && gameStatus === GameStatus.Training && (
          <button
            className="parameter-button bg-yellow-600 hover:bg-yellow-700"
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Stopped);
            }}
          >
            Stop Training
          </button>
        )}

        {(gameStatus === GameStatus.Paused ||
          (gameStatus === GameStatus.Idle && humanPlaying)) && (
          <button
            className="parameter-button bg-green-600 hover:bg-green-700"
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Running);
            }}
          >
            Start
          </button>
        )}

        {gameStatus === GameStatus.Running && (
          <button
            className="parameter-button bg-yellow-600 hover:bg-yellow-700"
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Paused);
            }}
          >
            Pause
          </button>
        )}

        <button
          className="parameter-button bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            e.currentTarget.blur();
            setGameStatus(GameStatus.Reset);
          }}
        >
          {humanPlaying ? "Reset" : "Population Reset"}
        </button>
      </div>
    </div>
  );
};

export default Parameters;
