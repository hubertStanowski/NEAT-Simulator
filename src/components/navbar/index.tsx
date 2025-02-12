import { portfolioURL } from "../../constants";
import NavItems from "./NavItems";

const Navbar = () => {
  return (
    <header className="relative flex h-auto w-full items-center justify-center border-b border-black-300 bg-black/90">
      <div className="mx-10 grid w-full grid-cols-12 gap-x-5 py-2">
        <div className="col-span-3 flex items-center justify-center border-white">
          <a
            href="/"
            className="highlight text-center text-4xl font-bold text-neutral-400"
          >
            NEAT SIMULATOR
          </a>
        </div>
        <div className="center col-span-6 flex items-center justify-center">
          <NavItems />
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
