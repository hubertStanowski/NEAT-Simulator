import { portfolioURL } from "../../constants";
import NavItems from "./NavItems";
const Navbar = () => {
  return (
    <header className="relative left-1/2 top-0 flex w-3/5 -translate-x-1/2 transform justify-center bg-black/90">
      <div className="c-space mx-auto flex w-full items-center justify-between gap-x-10 py-5">
        <a
          href="/"
          className="highlight mr-auto text-2xl font-bold text-neutral-400"
        >
          NEAT SIMULATOR
        </a>
        <NavItems />
        <a
          href={portfolioURL}
          className="highlight ml-auto text-2xl font-bold text-neutral-400"
        >
          MY PORTFOLIO
        </a>
      </div>
    </header>
  );
};

export default Navbar;
