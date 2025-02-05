import { portfolioURL } from "../../constants";
import NavItems from "./NavItems";

const Navbar = () => {
  return (
    <header className="relative left-0 right-0 top-0 bg-black/90">
      <div className="mx-auto max-w-7xl">
        <div className="c-space mx-auto flex items-center justify-between py-5">
          <a href="/" className="highlight text-2xl font-bold text-neutral-400">
            NEAT PLAYGROUND
          </a>
          <nav>
            <NavItems />
          </nav>
          <a
            href={portfolioURL}
            className="highlight text-xl font-bold text-neutral-400"
          >
            PORTFOLIO
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
