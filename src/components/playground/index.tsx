import { useState, useEffect } from "react";
import Parameters from "./Parameters";
import Canvas from "./Canvas";
import Network from "./Network";
import { GameStatus } from "../../constants";

const Playground = () => {
  const [humanPlaying, setHumanPlaying] = useState(true);
  const [populationSize, setPopulationSize] = useState(200);
  const [speed, setSpeed] = useState(100);

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Done);

  useEffect(() => {
    if (window.innerWidth < 768) {
      alert("This project is not suitable for small screens");
    }
  }, []);

  return (
    <section
      className="relative flex h-auto w-full items-center justify-center"
      id="home"
    >
      <div className="mx-10 grid w-full grid-cols-12 gap-x-5">
        <div className="col-span-3 flex">
          <div className="grid-container">
            <Parameters
              humanPlaying={humanPlaying}
              setHumanPlaying={setHumanPlaying}
              populationSize={populationSize}
              setPopulationSize={setPopulationSize}
              speed={speed}
              setSpeed={setSpeed}
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
            />
          </div>
        </div>
        <div className="col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-5 w-full">
              <Canvas
                humanPlaying={humanPlaying}
                populationSize={populationSize}
                speed={speed}
                gameStatus={gameStatus}
                setGameStatus={setGameStatus}
              />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid-container flex items-center justify-center">
            <Network />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
