import { Link } from 'react-router-dom';
import { portfolioURL } from '@/constants';
import { useSimulation } from '@/contexts';
import { Simulations } from '@/types';
import NavItems from './NavItems';

const Navbar = () => {
  const { selectedSimulation } = useSimulation();

  return (
    <header className="border-black-300 relative flex h-auto w-full items-center justify-center border-b bg-black/90">
      <div className="mx-2 grid w-full grid-cols-1 gap-y-[clamp(0.5rem,1vh,1rem)] py-[clamp(0.5rem,1vh,1rem)] sm:mx-3 sm:grid-cols-12 sm:gap-x-3 md:mx-4 md:gap-x-4 lg:mx-5 lg:gap-x-5">
        <div className="flex items-center justify-center border-white sm:col-span-3">
          <Link
            to="/"
            className="highlight text-purple_gradient text-center text-[clamp(1.25rem,3vh,2rem)] font-bold"
          >
            NEAT SIMULATOR
          </Link>
          <img
            src={
              selectedSimulation === Simulations.Snake
                ? '/assets/logo-snake.png'
                : '/assets/logo-flappybird.png'
            }
            alt="Logo"
            className="ml-2 h-[clamp(2rem,4vh,3rem)] sm:ml-4"
          />
        </div>
        <div className="flex items-center justify-center sm:col-span-6">
          <NavItems />
        </div>
        <div className="mx-2 flex items-center justify-center sm:col-span-3 sm:mx-4 sm:justify-end">
          <a
            href={portfolioURL}
            className="highlight text-gray_gradient text-[clamp(1rem,2.5vh,1.5rem)] font-bold"
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
