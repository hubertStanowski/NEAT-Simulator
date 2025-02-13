import { useState } from "react";
import { portfolioURL } from "../../constants";
import NavItems from "./NavItems";

const Navbar = () => {
  const [selectedSimulation, setSelectedSimulation] = useState("Snake");
  return (
    <header className="relative flex h-auto w-full items-center justify-center border-b border-black-300 bg-black/90">
      <div className="mx-10 grid w-full grid-cols-12 gap-x-5 py-2">
        <div className="col-span-3 flex items-center justify-center border-white">
          <a
            href="/"
            className="highlight text-purple_gradient text-center text-4xl font-bold"
          >
            NEAT SIMULATOR
          </a>
          <img
            src={
              selectedSimulation === "Snake"
                ? "/assets/logo-snake.png"
                : "/assets/logo-flappybird.png"
            }
            alt="Logo"
            className="ml-10 h-10 w-10"
          />
        </div>
        <div className="center col-span-6 flex items-center justify-center">
          <NavItems
            selectedSimulation={selectedSimulation}
            setSelectedSimulation={setSelectedSimulation}
          />
        </div>
        <div className="col-span-3 mx-10 flex items-center justify-end">
          <a
            href={portfolioURL}
            className="highlight text-2xl font-bold text-neutral-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            MY PORTFOLIO
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
