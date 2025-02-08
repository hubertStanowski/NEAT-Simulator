import { GameStatus } from "../../constants";

type Props = {
  humanPlaying: boolean;
  setHumanPlaying: (value: boolean) => void;
  populationSize: number;
  setPopulationSize: (value: number) => void;
  speed: number;
  setSpeed: (value: number) => void;
  gameStatus: GameStatus;
  setGameStatus: (value: GameStatus) => void;
  targetGeneration: number;
  setTargetGeneration: (value: number) => void;
};

const Parameters = (props: Props) => {
  return (
    <div className="flex h-full flex-col items-center gap-5 py-20 text-center text-white">
      <button
        className={`parameter-button mb-4 ${
          props.humanPlaying
            ? "bg-green-600 hover:bg-green-700"
            : "bg-purple-700 hover:bg-purple-800"
        } `}
        onClick={(e) => {
          e.currentTarget.blur();
          if (props.humanPlaying) {
            props.setGameStatus(GameStatus.Training);
          } else {
            props.setGameStatus(GameStatus.Idle);
          }
          props.setHumanPlaying(!props.humanPlaying);
          console.log(props.humanPlaying);
        }}
      >
        {props.humanPlaying ? "Human Playing" : "AI Playing"}
      </button>
      <div className="w-full items-center px-4">
        <p className="mb-2">Population Size: {props.populationSize}</p>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={props.populationSize}
          onChange={(e) => {
            props.setPopulationSize(Number(e.target.value));
          }}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>
      <div className="w-full items-center px-4">
        <p className="mb-2">Speed: {props.speed}</p>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={props.speed}
          onChange={(e) => {
            props.setSpeed(Number(e.target.value));
          }}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>
      <div className="w-full items-center px-4">
        <p className="mb-2">Generation: {props.targetGeneration}</p>
        <input
          type="range"
          min="1"
          max="40"
          step="1"
          value={props.targetGeneration}
          onChange={(e) => {
            props.setTargetGeneration(Number(e.target.value));
          }}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>
      <div className="mt-auto flex flex-col gap-4 align-bottom text-2xl">
        <button
          className="parameter-button bg-green-600 hover:bg-green-700"
          onClick={(e) => {
            props.setGameStatus(GameStatus.Running);
            e.currentTarget.blur();
          }}
        >
          Start
        </button>
        <button
          className={`parameter-button bg-yellow-600 hover:bg-yellow-700 ${
            props.gameStatus === GameStatus.Paused
              ? "highlighted-parameter-button"
              : ""
          }`}
          onClick={(e) => {
            props.setGameStatus(GameStatus.Paused);
            e.currentTarget.blur();
          }}
        >
          Pause
        </button>
        <button
          className="parameter-button bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            props.setGameStatus(GameStatus.Reset);
            e.currentTarget.blur();
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Parameters;
