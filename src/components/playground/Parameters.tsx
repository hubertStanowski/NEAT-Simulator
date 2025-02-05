type Props = {
  humanPlaying: boolean;
  setHumanPlaying: (value: boolean) => void;
  populationSize: number;
  setPopulationSize: (value: number) => void;
  FPS: number;
  setFPS: (value: number) => void;
};

const Parameters = (props: Props) => {
  return (
    <div className="text-white">
      <p>Human Playing: {props.humanPlaying ? "Yes" : "No"}</p>
      <button onClick={() => props.setHumanPlaying(!props.humanPlaying)}>
        Toggle Human Playing
      </button>
      <p>Population Size: {props.populationSize}</p>
      <input
        type="range"
        min="10"
        max="200"
        value={props.populationSize}
        onChange={(e) => props.setPopulationSize(Number(e.target.value))}
      />
      <p>FPS: {props.FPS}</p>
      <input
        type="range"
        min="10"
        max="200"
        value={props.FPS}
        onChange={(e) => props.setFPS(Number(e.target.value))}
      />
    </div>
  );
};

export default Parameters;
