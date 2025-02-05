type Props = {
  humanPlaying: boolean;
  setHumanPlaying: (value: boolean) => void;
  populationSize: number;
  setPopulationSize: (value: number) => void;
  FPS: number;
  setFPS: (value: number) => void;
  gameStatus: "running" | "paused" | "done";
  setGameStatus: (value: "running" | "paused" | "done") => void;
};
const Parameters = (props: Props) => {
  return (
    <div className="flex h-full flex-col items-center gap-5 py-20 text-center text-xl text-white">
      <button
        className={`mb-4 rounded-full px-4 py-2 ${
          props.humanPlaying
            ? "bg-green-600 hover:bg-green-700"
            : "bg-purple-700 hover:bg-purple-800"
        } `}
        onClick={() => props.setHumanPlaying(!props.humanPlaying)}
      >
        {props.humanPlaying ? "Human Playing" : "AI Playing"}
      </button>
      <div className="w-full items-center px-4">
        <p className="mb-2">Population Size: {props.populationSize}</p>
        <input
          type="range"
          min="10"
          max="1000"
          step="10"
          value={props.populationSize}
          onChange={(e) => props.setPopulationSize(Number(e.target.value))}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>
      <div className="w-full items-center px-4">
        <p className="mb-2">FPS: {props.FPS}</p>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={props.FPS}
          onChange={(e) => props.setFPS(Number(e.target.value))}
          className="mb-4 h-8 w-full accent-purple-700"
        />
      </div>
      <div className="mt-auto flex flex-col gap-4 align-bottom text-2xl">
        <button
          className="rounded-full bg-green-600 px-4 py-2 hover:bg-green-700"
          onClick={() => props.setGameStatus("running")}
        >
          Start
        </button>
        <button
          className="rounded-full bg-yellow-600 px-4 py-2 hover:bg-yellow-700"
          onClick={() => props.setGameStatus("paused")}
        >
          Pause
        </button>
        <button
          className="rounded-full bg-red-600 px-4 py-2 hover:bg-red-700"
          onClick={() => props.setGameStatus("done")}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default Parameters;
