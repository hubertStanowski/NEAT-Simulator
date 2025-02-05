import { useState } from "react";
import Parameters from "./Parameters";

const Playground = () => {
  const [humanPlaying, setHumanPlaying] = useState(false);
  const [populationSize, setPopulationSize] = useState(0);
  const [FPS, setFPS] = useState(0);

  return (
    <section className="relative mb-20 flex h-full w-full flex-col" id="home">
      <div className="grid h-full grid-cols-12 gap-5">
        <div className="col-span-2 h-full">
          <div className="grid-container h-full">
            <Parameters
              humanPlaying={humanPlaying}
              setHumanPlaying={setHumanPlaying}
              populationSize={populationSize}
              setPopulationSize={setPopulationSize}
              FPS={FPS}
              setFPS={setFPS}
            />
          </div>
        </div>
        <div className="col-span-7 h-full">
          <div className="grid-container h-full">
            <h1 className="text-white">FPS: {FPS}</h1>
          </div>
        </div>
        <div className="col-span-3 h-full">
          <div className="grid-container h-full">Right Sidebar</div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
