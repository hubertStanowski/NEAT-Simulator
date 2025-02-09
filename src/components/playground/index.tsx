import { useState, useEffect } from "react";
import Parameters from "./Parameters";
import Canvas from "./Canvas";
import Status from "./Status";
import { GameStatus } from "../../constants";
import Player from "../../snake/player";

const Playground = () => {
  const [humanPlaying, setHumanPlaying] = useState(true);
  const [populationSize, setPopulationSize] = useState(300);
  const [speed, setSpeed] = useState(50);

  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Idle);
  const [targetGeneration, setTargetGeneration] = useState(20);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [aliveCount, setAliveCount] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [networkPlayer, setNetworkPlayer] = useState<Player>(
    new Player(2, true),
  );

  useEffect(() => {
    if (window.innerWidth < 768) {
      alert("This project is not suitable for small screens");
    }
  }, []);

  return (
    <section
      className="relative flex h-auto w-full items-center justify-center"
      id="home"
    >
      <div className="mx-10 grid w-full grid-cols-12 gap-x-5">
        <div className="col-span-3 flex">
          <div className="grid-container">
            <Parameters
              humanPlaying={humanPlaying}
              setHumanPlaying={setHumanPlaying}
              populationSize={populationSize}
              setPopulationSize={setPopulationSize}
              speed={speed}
              setSpeed={setSpeed}
              gameStatus={gameStatus}
              setGameStatus={setGameStatus}
              targetGeneration={targetGeneration}
              setTargetGeneration={setTargetGeneration}
            />
          </div>
        </div>
        <div className="col-span-6">
          <div className="grid-container flex items-center justify-center">
            <div className="relative my-5 w-full">
              <Canvas
                humanPlaying={humanPlaying}
                populationSize={populationSize}
                speed={speed}
                gameStatus={gameStatus}
                targetGeneration={targetGeneration}
                setGameStatus={setGameStatus}
                setCurrentGeneration={setCurrentGeneration}
                setAliveCount={setAliveCount}
                setNetworkPlayer={setNetworkPlayer}
                setScore={setScore}
                setBestScore={setBestScore}
              />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="grid-container flex items-center justify-center">
            <Status
              currentGeneration={currentGeneration}
              aliveCount={aliveCount}
              networkPlayer={networkPlayer}
              populationSize={populationSize}
              score={score}
              bestScore={bestScore}
              gameStatus={gameStatus}
              humanPlaying={humanPlaying}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Playground;
