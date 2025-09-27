import { useSimulation } from '@/contexts';
import { Simulations } from '@/types';

const NavItems = () => {
  const { selectedSimulation, setSelectedSimulation } = useSimulation();

  return (
    <ul className="nav-ul ml-1 gap-[clamp(1rem,3vw,3.5rem)] sm:ml-2">
      <a
        className={`nav-li_a cursor-pointer text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === Simulations.Snake ? 'text-purple-700' : 'text-gray_gradient'}`}
        onClick={() => {
          setSelectedSimulation(Simulations.Snake);
        }}
      >
        Snake
      </a>
      <a
        className={`nav-li_a cursor-pointer text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === Simulations.FlappyBird ? 'text-purple-700' : 'text-gray_gradient'}`}
        onClick={() => {
          setSelectedSimulation(Simulations.FlappyBird);
        }}
      >
        FlappyBird
      </a>
    </ul>
  );
};

export default NavItems;
