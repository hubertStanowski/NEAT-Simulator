import { GameStatus, Simulations } from '@/types';
import { useSimulation } from '@/contexts';
import { useMemo, useEffect, useState } from 'react';

const Parameters = () => {
  const {
    humanPlaying,
    setHumanPlaying,
    populationSize,
    setPopulationSize,
    speed,
    setSpeed,
    gameStatus,
    setGameStatus,
    targetGeneration,
    setTargetGeneration,
    trainedGenerations,
    isPlayerAlive,
    resetAndStartGame,
    networkPlayer,
    selectedSimulation,
    selectedPretrainedModel,
    setSelectedPretrainedModel,
  } = useSimulation();

  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Load available pretrained models for Snake
  useEffect(() => {
    if (selectedSimulation === Simulations.Snake) {
      const loadModels = async () => {
        try {
          const response = await fetch('/assets/pretrained/snake/models.json');
          if (response.ok) {
            const data = await response.json();
            const modelNames = data.models.map(
              (model: { name: string }) => model.name
            );
            setAvailableModels(modelNames);
          }
        } catch (error) {
          console.error('Failed to load pretrained models:', error);
        }
      };
      loadModels();
    } else {
      setAvailableModels([]);
      setSelectedPretrainedModel(null);
    }
  }, [selectedSimulation]);

  useEffect(() => {
    if (targetGeneration > 0 && selectedPretrainedModel) {
      setSelectedPretrainedModel(null);
      setGameStatus(GameStatus.Training);
    }
  }, [targetGeneration]);

  // Helper function to map slider values to valid generation values
  const mapToValidGeneration = (value: number): number => {
    if (value <= 1) return 1;
    // For values > 1, round to nearest multiple of 5, minimum 5
    return Math.max(5, Math.round(value / 5) * 5);
  };

  // Helper function to map generation value back to slider value for display
  const mapToSliderValue = (generation: number): number => {
    if (generation === 1) return 1;
    return generation;
  };

  // Memoize button visibility to prevent flickering during rapid status changes
  const buttonStates = useMemo(() => {
    // Treat Reset status as equivalent to the previous stable state to prevent flicker
    const effectiveGameStatus =
      gameStatus === GameStatus.Reset ? GameStatus.Idle : gameStatus;

    return {
      showStartTraining:
        !humanPlaying &&
        (effectiveGameStatus === GameStatus.Idle ||
          effectiveGameStatus === GameStatus.Stopped),
      showStopTraining:
        !humanPlaying && effectiveGameStatus === GameStatus.Training,
      showStartButton:
        effectiveGameStatus === GameStatus.Paused ||
        (effectiveGameStatus === GameStatus.Idle && humanPlaying),
      showPauseButton: effectiveGameStatus === GameStatus.Running,
    };
  }, [humanPlaying, gameStatus]);

  // TODO remove this when finished gathering interesting models
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && networkPlayer && targetGeneration > 0) {
        console.log(`=== Genome for Generation ${targetGeneration} ===`);
        console.log(networkPlayer.exportGenome());
        console.log('===================================');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [targetGeneration, networkPlayer]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[clamp(0.5rem,2vh,1.5rem)] px-2 py-[clamp(1rem,3vh,2rem)] text-center text-white sm:px-3 md:px-4">
      <button
        className={`parameter-button highlighted-parameter-button text-[clamp(1rem,2.5vh,1.5rem)] ${
          humanPlaying
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-purple-700 hover:bg-purple-800'
        }`}
        onClick={(e) => {
          e.currentTarget.blur();
          setHumanPlaying(!humanPlaying);
        }}
      >
        {humanPlaying ? 'Human Playing' : 'AI Playing'}
      </button>

      <div className="w-full items-center px-1 sm:px-2">
        <p className="mb-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(0.875rem,2vh,1.25rem)]">
          Population Size: {populationSize}
        </p>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={populationSize}
          onChange={(e) => setPopulationSize(Number(e.target.value))}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-[clamp(0.5rem,1.5vh,1rem)] h-[clamp(1rem,2vh,1.5rem)] w-full accent-purple-700"
        />
      </div>

      <div className="w-full items-center px-1 sm:px-2">
        <p className="mb-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(0.875rem,2vh,1.25rem)]">
          Speed: {speed}
        </p>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          onClick={(e) => e.currentTarget.blur()}
          className={`mb-[clamp(0.5rem,1.5vh,1rem)] h-[clamp(1rem,2vh,1.5rem)] w-full ${
            humanPlaying && speed >= 80 ? 'accent-red-700' : 'accent-purple-700'
          }`}
        />
      </div>

      <div className="w-full items-center px-1 sm:px-2">
        <p className="mb-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(0.875rem,2vh,1.25rem)]">
          Generation: {targetGeneration}
        </p>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={mapToSliderValue(targetGeneration)}
          onChange={(e) => {
            const mappedValue = mapToValidGeneration(Number(e.target.value));
            setTargetGeneration(mappedValue);
          }}
          onClick={(e) => e.currentTarget.blur()}
          className="mb-[clamp(0.5rem,1.5vh,1rem)] h-[clamp(1rem,2vh,1.5rem)] w-full accent-purple-700"
        />
      </div>

      {selectedSimulation === Simulations.Snake &&
        availableModels.length > 0 && (
          <div className="w-full items-center px-1 sm:px-2">
            <p className="mb-[clamp(0.25rem,1vh,0.75rem)] text-[clamp(0.875rem,2vh,1.25rem)]">
              Pretrained Model
            </p>
            <select
              value={selectedPretrainedModel || ''}
              onChange={(e) => {
                const value = e.target.value || null;
                setSelectedPretrainedModel(value);
                if (value) {
                  setHumanPlaying(false);
                } else {
                  setGameStatus(GameStatus.Training);
                }
                e.currentTarget.blur();
              }}
              className="mb-[clamp(0.5rem,1.5vh,1rem)] h-[clamp(2rem,4vh,3rem)] w-full rounded-md bg-purple-900 px-2 text-[clamp(0.875rem,2vh,1.25rem)] text-white accent-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select a model...</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        )}

      <div className="mt-[clamp(0.5rem,2vh,2rem)] flex flex-col gap-[clamp(0.5rem,1.5vh,1rem)] text-[clamp(1rem,2.5vh,1.5rem)]">
        {buttonStates.showStartTraining && (
          <button
            className={`parameter-button ${
              targetGeneration <= trainedGenerations
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Training);
            }}
          >
            {targetGeneration <= trainedGenerations
              ? 'Start Simulation'
              : 'Start Training'}
          </button>
        )}

        {buttonStates.showStopTraining && (
          <button
            className="parameter-button bg-yellow-600 hover:bg-yellow-700"
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Stopped);
            }}
          >
            Stop Training
          </button>
        )}

        {buttonStates.showStartButton && (
          <button
            className="parameter-button bg-green-600 hover:bg-green-700"
            onClick={(e) => {
              e.currentTarget.blur();
              // If player is dead, reset and start the game
              if (humanPlaying && !isPlayerAlive) {
                resetAndStartGame();
              } else {
                // If player is alive (paused state), just start
                setGameStatus(GameStatus.Running);
              }
            }}
          >
            Start
          </button>
        )}

        {buttonStates.showPauseButton && (
          <button
            className="parameter-button bg-yellow-600 hover:bg-yellow-700"
            onClick={(e) => {
              e.currentTarget.blur();
              setGameStatus(GameStatus.Paused);
            }}
          >
            Pause
          </button>
        )}

        <button
          className="parameter-button bg-red-600 hover:bg-red-700"
          onClick={(e) => {
            e.currentTarget.blur();
            setGameStatus(GameStatus.Reset);
          }}
        >
          {humanPlaying ? 'Reset' : 'Population Reset'}
        </button>
      </div>
    </div>
  );
};

export default Parameters;
