import { useState, useEffect } from "react";
import Parameters from "./Parameters";
import Canvas from "./Canvas";

const Playground = () => {
  const [humanPlaying, setHumanPlaying] = useState(true);
  const [populationSize, setPopulationSize] = useState(50);
  const [FPS, setFPS] = useState(60);
  const [gameStatus, setGameStatus] = useState<"running" | "paused" | "done">(
    "done",
  );

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
              FPS={FPS}
              setFPS={setFPS}
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
            />
          </div>
        </div>
        <div className="col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-5 w-full">
              <Canvas />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid-container"></div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
