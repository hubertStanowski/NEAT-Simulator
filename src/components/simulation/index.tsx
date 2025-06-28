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
      className="relative flex h-full w-full items-center justify-center"
      id="home"
    >
      <div className="mx-2 grid h-full w-full grid-cols-1 gap-y-5 sm:mx-5 md:mx-10 md:grid-cols-12 md:gap-x-5">
        <div className="flex md:col-span-3">
          <div className="grid-container">
            <Parameters />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-2 w-full sm:my-5">
              <Snake />
            </div>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="grid-container flex items-center justify-center">
            <Status />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
