import { Link } from 'react-router-dom';
import { useSimulation } from '@/contexts';
import { Simulations } from '@/types';

const NavItems = () => {
  const { selectedSimulation } = useSimulation();

  return (
    <ul className="nav-ul ml-1 gap-[clamp(1rem,3vw,3.5rem)] sm:ml-2">
      <Link
        to="/snake"
        className={`nav-li_a cursor-pointer text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === Simulations.Snake ? 'text-purple-700' : 'text-gray_gradient'}`}
      >
        Snake
      </Link>
      <Link
        to="/flappybird"
        className={`nav-li_a cursor-pointer text-[clamp(1rem,2.5vh,1.5rem)] ${selectedSimulation === Simulations.FlappyBird ? 'text-purple-700' : 'text-gray_gradient'}`}
      >
        FlappyBird
      </Link>
    </ul>
  );
};

export default NavItems;
