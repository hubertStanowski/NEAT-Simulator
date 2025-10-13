import { useState, useEffect, useRef } from 'react';
import { useSimulation } from '@/contexts';
import {
  Player,
  DoublePipeSet,
  Ground,
  BACKGROUND_Y_OFFSET_RATIO,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  BACKGROUND_IMG,
  BIRD_IMG,
  GROUND_IMG,
  PIPE_IMG,
} from '@/flappybird';
import { FlappyBirdPopulation } from '@/flappybird/population';
import { NeatConfig } from '@/neat';
import { GameStatus } from '@/types';

const FlappyBirdSimulation = () => {
  const {
    humanPlaying,
    populationSize,
    speed,
    gameStatus,
    setGameStatus,
    targetGeneration,
    setCurrentGeneration,
    setTrainedGenerations,
    setAliveCount,
    setScore,
    setBestScore,
    setNetworkPlayer,
    setIsPlayerAlive,
    setResetAndStartGame,
  } = useSimulation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [humanPlayer, setHumanPlayer] = useState<Player | null>(null);
  const [pipes] = useState(new DoublePipeSet());
  const [ground] = useState(new Ground());
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  });
  const config = new NeatConfig();
  const [population, setPopulation] = useState<FlappyBirdPopulation | null>(
    null
  );

  // Image objects
  const backgroundImg = useRef<HTMLImageElement>(new Image());
  const birdImg = useRef<HTMLImageElement>(new Image());
  const groundImg = useRef<HTMLImageElement>(new Image());
  const pipeImg = useRef<HTMLImageElement>(new Image());

  // Initialize population once canvas dimensions are known
  useEffect(() => {
    if (canvasDimensions.width > 0 && canvasDimensions.height > 0) {
      const newPopulation = new FlappyBirdPopulation(
        config,
        populationSize,
        canvasDimensions.width,
        canvasDimensions.height
      );
      setPopulation(newPopulation);
      if (newPopulation.currBestPlayer) {
        setNetworkPlayer(newPopulation.currBestPlayer);
      }
      setAliveCount(populationSize);
    }
  }, [canvasDimensions.width, canvasDimensions.height]);

  // Training Loop Handlers
  const handleTrainingStep = () => {
    if (!population) return;

    if (population.generation - 1 >= targetGeneration) {
      handleTargetGenerationReached();
    } else {
      handlePopulationEvolution();
    }
  };

  const handleTargetGenerationReached = () => {
    if (!population) return;

    if (population.genBestPlayers[targetGeneration - 1]) {
      const targetPlayer =
        population.genBestPlayers[targetGeneration - 1].clone();
      targetPlayer.isFlying = true;
      targetPlayer.reset();
      setHumanPlayer(targetPlayer);
      pipes.reset();
      setGameStatus(GameStatus.Running);
    }
  };

  const handlePopulationEvolution = () => {
    if (!population) return;

    if (!population.finished()) {
      population.updateSurvivors(ground, pipes);
    } else {
      logGenerationStats();
      population.naturalSelection();
      pipes.reset();
    }
    updateSimulationState();
  };

  const logGenerationStats = () => {
    if (!population) return;

    const avg =
      population.players.reduce((a, p) => a + p.getScore(), 0) /
      population.players.length;
    console.log(
      `Gen:${population.generation} CurrBest:${
        population.currBestPlayer?.getScore() ?? 'N/A'
      } / BestEver:${
        population.bestEverPlayer?.getScore() ?? 'N/A'
      } Avg:${avg.toFixed(2)}`
    );
  };

  const updateSimulationState = () => {
    if (!population) return;

    if (population.currBestPlayer) {
      setNetworkPlayer(population.currBestPlayer);
    }
    setCurrentGeneration(population.generation);
    setAliveCount(population.getAliveCount());
    setScore(population.currBestPlayer?.getScore() ?? 0);
    setBestScore(population.bestEverPlayer?.getScore() ?? 0);
    setTrainedGenerations(population.generation - 1);
  };

  // Keyboard Control Handlers
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();

      if (gameStatus === GameStatus.Running && humanPlayer) {
        humanPlayer.flap();
      }
    }
  };

  const setupKeyboardControls = () => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  };

  // Game Loop Handlers
  const handleHumanGameStep = () => {
    if (!humanPlayer) return;

    pipes.update(humanPlayer.x);
    ground.update();

    if (gameStatus === GameStatus.Running) {
      humanPlayer.update();

      if (pipes.collidesWithPlayer(humanPlayer)) {
        humanPlayer.kill();
      }
      if (ground.collidesWithPlayer(humanPlayer)) {
        humanPlayer.kill();
      }

      humanPlayer.score = pipes.score;
      setScore(humanPlayer.score);

      if (!humanPlayer.isAlive) {
        setGameStatus(GameStatus.Idle);
        setIsPlayerAlive(false);
      }
    }

    draw();
  };

  const handleAIGameStep = () => {
    if (!humanPlayer) return;

    pipes.update(humanPlayer.x);
    ground.update();

    if (gameStatus === GameStatus.Running) {
      humanPlayer.update();
      humanPlayer.look(ground, pipes);
      humanPlayer.decide();

      if (pipes.collidesWithPlayer(humanPlayer)) {
        humanPlayer.kill();
      }
      if (ground.collidesWithPlayer(humanPlayer)) {
        humanPlayer.kill();
      }

      humanPlayer.score = pipes.score;
      setScore(humanPlayer.score);
      setNetworkPlayer(humanPlayer.clone());
      setCurrentGeneration(humanPlayer.generation);

      if (!humanPlayer.isAlive) {
        setGameStatus(
          targetGeneration >= (population?.generation ?? 0)
            ? GameStatus.Training
            : GameStatus.Idle
        );
        setIsPlayerAlive(false);
      }
    }

    draw();
  };

  const setupHumanGameLoop = () => {
    const interval = setInterval(
      handleHumanGameStep,
      Math.max(10, 1000 / speed)
    );
    return () => clearInterval(interval);
  };

  const setupAIGameLoop = () => {
    const interval = setInterval(handleAIGameStep, Math.max(10, 1000 / speed));
    return () => clearInterval(interval);
  };

  const setupTrainingVisualLoop = () => {
    if (!population) return;

    pipes.update(population.players[0]?.x || 0);
    ground.update();

    draw();
  };

  // Game Reset Handlers
  const resetHumanPlayer = () => {
    const fresh = new Player(
      canvasDimensions.width,
      canvasDimensions.height,
      false
    );
    setHumanPlayer(fresh);
    setNetworkPlayer(fresh);
    pipes.reset();
    setScore(0);
  };

  const resetPopulation = () => {
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) return;

    const newPopulation = new FlappyBirdPopulation(
      config,
      populationSize,
      canvasDimensions.width,
      canvasDimensions.height
    );
    setPopulation(newPopulation);
    pipes.reset();

    // Reset all simulation state values
    if (newPopulation.currBestPlayer) {
      setNetworkPlayer(newPopulation.currBestPlayer);
    }
    setCurrentGeneration(0);
    setAliveCount(populationSize);
    setScore(0);
    setBestScore(0);
    setTrainedGenerations(0);
  };

  const handleGameReset = () => {
    if (humanPlaying) {
      resetHumanPlayer();
    } else {
      resetPopulation();
    }

    setGameStatus(GameStatus.Idle);
    setIsPlayerAlive(true);
    draw();
  };

  const handleResetAndStart = () => {
    if (humanPlaying) {
      resetHumanPlayer();
    }
    pipes.reset();
    setGameStatus(GameStatus.Running);
    setIsPlayerAlive(true);
  };

  // Population Management Handlers
  const handleNewPopulation = () => {
    resetPopulation();
    if (
      gameStatus !== GameStatus.Idle &&
      gameStatus !== GameStatus.Stopped &&
      !humanPlaying
    ) {
      setGameStatus(GameStatus.Training);
    }
    console.log('NEW POPULATION');
  };

  // Mode Switching Handlers
  const switchToHumanMode = () => {
    const fresh = new Player(
      canvasDimensions.width,
      canvasDimensions.height,
      false
    );
    setHumanPlayer(fresh);
    pipes.reset();
    setGameStatus(GameStatus.Idle);
    setScore(0);
  };

  const switchToAIMode = () => {
    setHumanPlayer(null);
    resetPopulation();
    setGameStatus(GameStatus.Idle);
  };

  const handleModeSwitch = () => {
    if (humanPlaying) {
      switchToHumanMode();
    } else {
      switchToAIMode();
    }
  };

  // Generation Switching Handlers
  const switchToTargetGeneration = () => {
    if (!population) return;

    if (population.generation - 1 >= targetGeneration) {
      if (population.genBestPlayers[targetGeneration - 1]) {
        const targetPlayer =
          population.genBestPlayers[targetGeneration - 1].clone();
        targetPlayer.isFlying = true;
        targetPlayer.reset();
        setHumanPlayer(targetPlayer);
        pipes.reset();
      }
    }
  };

  const handleGenerationSwitch = () => {
    if (!population) return;

    if (population.generation - 1 >= targetGeneration) {
      switchToTargetGeneration();
    } else {
      setGameStatus(GameStatus.Training);
    }
  };

  // Canvas Setup Handlers
  const updateCanvasDimensions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    setCanvasDimensions({
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  };

  const setupCanvasDimensions = () => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  };

  // Image Loading Handlers
  const handleImageLoad = () => {
    let loadedCount = 0;
    const totalImages = 4;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };

    backgroundImg.current.onload = onImageLoad;
    birdImg.current.onload = onImageLoad;
    groundImg.current.onload = onImageLoad;
    pipeImg.current.onload = onImageLoad;

    backgroundImg.current.src = BACKGROUND_IMG;
    birdImg.current.src = BIRD_IMG;
    groundImg.current.src = GROUND_IMG;
    pipeImg.current.src = PIPE_IMG;
  };

  // Game Objects Update Handlers
  const updateGameObjectsDimensions = () => {
    if (humanPlayer) {
      humanPlayer.updateCanvasSize(
        canvasDimensions.width,
        canvasDimensions.height
      );
    }
    if (population) {
      for (const player of population.players) {
        player.updateCanvasSize(
          canvasDimensions.width,
          canvasDimensions.height
        );
      }
    }
    pipes.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
    ground.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const backgroundYOffset =
      canvasDimensions.height * BACKGROUND_Y_OFFSET_RATIO;
    const scaledWidth = canvasDimensions.width;
    const scaledHeight = canvasDimensions.height;
    const offsetX = (scaledWidth - canvasDimensions.width) / -2;
    const offsetY =
      backgroundYOffset - (scaledHeight - canvasDimensions.height) / 2;

    ctx.drawImage(
      backgroundImg.current,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight
    );
  };

  const drawPipes = (ctx: CanvasRenderingContext2D) => {
    for (const pipeSet of pipes.pipeSets) {
      const topPipe = pipeSet.topPipe.getBoundingBox();
      ctx.save();
      ctx.scale(1, -1);
      ctx.drawImage(
        pipeImg.current,
        0,
        0,
        pipeImg.current.width,
        topPipe.height,
        topPipe.x,
        -topPipe.y - topPipe.height,
        topPipe.width,
        topPipe.height
      );
      ctx.restore();

      const bottomPipe = pipeSet.bottomPipe.getBoundingBox();
      ctx.drawImage(
        pipeImg.current,
        0,
        0,
        pipeImg.current.width,
        bottomPipe.height,
        bottomPipe.x,
        bottomPipe.y,
        bottomPipe.width,
        bottomPipe.height
      );
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    const groundBox = ground.getBoundingBox();
    const groundOverlap = 2;
    const numSegments = Math.ceil(canvasDimensions.width / groundBox.width) + 2;
    for (let i = 0; i < numSegments; i++) {
      ctx.drawImage(
        groundImg.current,
        groundBox.x + i * groundBox.width - groundOverlap,
        groundBox.y,
        groundBox.width + groundOverlap * 2,
        groundBox.height
      );
    }
  };

  const drawBird = (ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.isFlying || !player.isAlive) {
      let angle;
      if (player.velocity <= 0) {
        angle = -30;
      } else {
        angle = Math.min(player.velocity * 3, 45);
      }
      ctx.rotate((angle * Math.PI) / 180);
    }

    ctx.drawImage(birdImg.current, -38, -27, 77, 54);
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#010103';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    if (!imagesLoaded) return;

    drawBackground(ctx);

    drawPipes(ctx);

    drawGround(ctx);

    // Draw single player (human or AI viewing past generation) or all alive birds during training
    if (humanPlayer && gameStatus === GameStatus.Running) {
      drawBird(ctx, humanPlayer);
    } else if (population && gameStatus === GameStatus.Training) {
      const drawLimit = 100; // Limit drawn birds for performance
      let drawnCount = 0;

      for (const player of population.players) {
        if ((player.isAlive || player.isFlying) && drawnCount < drawLimit) {
          drawBird(ctx, player);
          drawnCount++;
        }
      }
    }
  };

  // Set up canvas dimensions dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      return setupCanvasDimensions();
    }
  }, []);

  // Load images
  useEffect(() => {
    handleImageLoad();
  }, []);

  // Update game objects when canvas dimensions change
  useEffect(() => {
    updateGameObjectsDimensions();
  }, [canvasDimensions, humanPlayer, population, pipes, ground]);

  // Main training loop - evolve population and switch to best player when target reached
  useEffect(() => {
    if (gameStatus !== GameStatus.Training || !population) return;
    const interval = setInterval(
      handleTrainingStep,
      Math.max(10, 1000 / speed)
    );
    return () => clearInterval(interval);
  }, [population, gameStatus, targetGeneration, speed]);

  // Main game loop - handles bird movement for both human and AI players
  useEffect(() => {
    if (gameStatus !== GameStatus.Running || !imagesLoaded || !humanPlayer)
      return;
    return humanPlaying ? setupHumanGameLoop() : setupAIGameLoop();
  }, [gameStatus, imagesLoaded, speed, humanPlayer]);

  // AI training visual update loop
  useEffect(() => {
    if (gameStatus !== GameStatus.Training || !imagesLoaded || !population)
      return;
    const interval = setInterval(
      setupTrainingVisualLoop,
      Math.max(5, 600 / speed)
    );
    return () => clearInterval(interval);
  }, [gameStatus, imagesLoaded, speed, population]);

  // Create a new population when population size changes
  useEffect(() => {
    if (!humanPlaying) {
      handleNewPopulation();
    }
  }, [populationSize]);

  // Handle game reset
  useEffect(() => {
    if (gameStatus !== GameStatus.Reset) return;
    handleGameReset();
  }, [gameStatus]);

  // Switch to specific generation player when target generation changes
  useEffect(() => {
    if (humanPlaying || gameStatus === GameStatus.Idle) return;
    handleGenerationSwitch();
  }, [targetGeneration]);

  // Switch between human and AI modes
  useEffect(() => {
    if (gameStatus === GameStatus.Idle) return;
    handleModeSwitch();
  }, [humanPlaying]);

  // Setup keyboard controls when human is playing
  useEffect(() => {
    if (!humanPlaying) return;
    if (gameStatus !== GameStatus.Running && gameStatus !== GameStatus.Idle)
      return;
    return setupKeyboardControls();
  }, [gameStatus, humanPlaying]);

  // Initial draw
  useEffect(() => {
    if (imagesLoaded && canvasDimensions.width > 0) {
      draw();
    }
  }, [imagesLoaded, canvasDimensions, population, humanPlayer]);

  // Set up reset and start function for the Parameters component to use
  useEffect(() => {
    setResetAndStartGame(() => handleResetAndStart);
  }, [humanPlaying]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-sky-200">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="h-[clamp(460px,81vh,920px)] w-full border border-gray-400 bg-sky-300"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default FlappyBirdSimulation;
