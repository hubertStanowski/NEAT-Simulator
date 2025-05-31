import { useEffect } from "react";
import Parameters from "./Parameters";
import Snake from "./Snake";
import Status from "./Status";
import { useSimulation } from "../../contexts/SimulationContext";

const Playground = () => {
  const { humanPlaying, setHumanPlaying } = useSimulation();

  useEffect(() => {
    if (window.innerWidth < 768) {
      alert("This project is not suitable for small screens");
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        setHumanPlaying(!humanPlaying);
      }
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [humanPlaying, setHumanPlaying]);

  return (
    <section
      className="relative flex h-auto w-full items-center justify-center"
      id="home"
    >
      <div className="mx-10 grid w-full grid-cols-12 gap-x-5">
        <div className="col-span-3 flex">
          <div className="grid-container">
            <Parameters />
          </div>
        </div>
        <div className="col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-5 w-full">
              <Snake />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid-container flex items-center justify-center">
            <Status />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
