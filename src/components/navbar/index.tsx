import { useState } from "react";
import { portfolioURL } from "../../constants";
import NavItems from "./NavItems";

const Navbar = () => {
  const [selectedSimulation, setSelectedSimulation] = useState("Snake");
  return (
    <header className="relative flex h-auto w-full items-center justify-center border-b border-black-300 bg-black/90">
      <div className="mx-2 grid w-full grid-cols-1 gap-y-4 py-2 sm:mx-5 sm:grid-cols-12 sm:gap-x-5 md:mx-10">
        <div className="flex items-center justify-center border-white sm:col-span-3">
          <a
            href="/"
            className="highlight text-purple_gradient text-center text-2xl font-bold md:text-4xl"
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
            className="ml-4 h-8 w-8 sm:ml-10 sm:h-10 sm:w-10"
          />
        </div>
        <div className="flex items-center justify-center sm:col-span-6">
          <NavItems
            selectedSimulation={selectedSimulation}
            setSelectedSimulation={setSelectedSimulation}
          />
        </div>
        <div className="mx-2 flex items-center justify-center sm:col-span-3 sm:mx-10 sm:justify-end">
          <a
            href={portfolioURL}
            className="highlight text-xl font-bold text-neutral-400 sm:text-2xl"
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
