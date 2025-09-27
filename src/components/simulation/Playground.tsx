import { useEffect } from 'react';
import Parameters from './Parameters';
import Snake from './snake/SnakeSimulation';
import FlappyBird from './FlappyBird';
import Status from './Status';
import { useSimulation } from '@/contexts';
import { Simulations } from '@/types';

const Playground = () => {
  const { humanPlaying, setHumanPlaying, selectedSimulation } = useSimulation();

  useEffect(() => {
    if (window.innerWidth < 768) {
      alert('This project is not suitable for small screens');
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setHumanPlaying(!humanPlaying);
      }
    };

    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [humanPlaying, setHumanPlaying]);

  return (
    <section
      className="relative flex h-full w-full items-center justify-center"
      id="home"
    >
      <div className="mx-2 grid h-full w-full grid-cols-1 gap-x-2 gap-y-2 sm:mx-3 sm:gap-x-3 sm:gap-y-3 md:mx-4 md:grid-cols-12 md:gap-x-4 lg:mx-5 lg:gap-x-5">
        <div className="flex md:col-span-3">
          <div className="grid-container">
            <Parameters />
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative w-full py-2">
              {selectedSimulation === Simulations.Snake && <Snake />}
              {selectedSimulation === Simulations.FlappyBird && <FlappyBird />}
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
