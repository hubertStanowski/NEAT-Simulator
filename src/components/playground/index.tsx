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
      className="relative flex h-full w-full items-center justify-center"
      id="home"
    >
      <div className="grid h-full grid-cols-12 flex-col gap-5 gap-x-10">
        <div className="col-span-2 flex h-full">
          <div className="grid-container h-full">
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
        <div className="col-span-7 h-full w-full">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-5 h-full w-full">
              <Canvas />
            </div>
          </div>
        </div>
        <div className="col-span-3 h-full">
          <div className="grid-container h-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
