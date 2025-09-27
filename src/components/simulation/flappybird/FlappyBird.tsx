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
import { GameStatus } from '@/types';

const FlappyBird = () => {
  const {
    humanPlaying,
    speed,
    gameStatus,
    setGameStatus,
    setScore,
    bestScore,
    setBestScore,
  } = useSimulation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player] = useState(new Player());
  const [pipes] = useState(new DoublePipeSet());
  const [ground] = useState(new Ground());
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  });

  // Image objects
  const backgroundImg = useRef<HTMLImageElement>(new Image());
  const birdImg = useRef<HTMLImageElement>(new Image());
  const groundImg = useRef<HTMLImageElement>(new Image());
  const pipeImg = useRef<HTMLImageElement>(new Image());

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
  }, [canvasDimensions, player, pipes, ground]);

  // Keyboard Control Handlers
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();

      if (gameStatus === GameStatus.Idle) {
        // Start new game
        handleGameStart();
      } else if (gameStatus === GameStatus.Running) {
        // Flap during game
        player.flap();
      }
    }
  };

  const setupKeyboardControls = () => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  };

  // Game Loop Handlers
  const handleGameStep = () => {
    if (player.isFlying || gameStatus === GameStatus.Running) {
      pipes.update(player.x);
    }

    if (player.isAlive || gameStatus === GameStatus.Running) {
      ground.update();
    }

    if (gameStatus === GameStatus.Running) {
      player.update();
      checkCollisions();
      setScore(pipes.score);

      // Check if player died
      if (!player.isAlive) {
        setGameStatus(GameStatus.Idle);
        // Update best score if current score is better
        if (pipes.score > bestScore) {
          setBestScore(pipes.score);
        }
      }
    }

    draw();
  };

  const setupGameLoop = () => {
    // Use speed from context: higher speed = faster game = shorter interval
    const interval = setInterval(handleGameStep, Math.max(10, 1000 / speed));
    return () => clearInterval(interval);
  };

  // Game Reset Handlers
  const handleGameStart = () => {
    player.reset();
    pipes.reset();
    setScore(0);
    setGameStatus(GameStatus.Running);
  };

  const handleGameReset = () => {
    player.reset();
    pipes.reset();
    setScore(0);
    setGameStatus(GameStatus.Idle);
  };

  // Mode Switching Handlers
  const handleModeSwitch = () => {
    if (humanPlaying) {
      // Switch to human mode
      setGameStatus(GameStatus.Idle);
    } else {
      // Switch to AI mode - for now just go to idle
      // TODO: Implement AI training mode when NEAT is integrated
      setGameStatus(GameStatus.Idle);
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
    player.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
    pipes.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
    ground.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
  };

  const checkCollisions = () => {
    if (!player.isAlive) return;

    // Check pipe collisions
    if (pipes.collidesWithPlayer(player)) {
      player.kill();
      return;
    }

    // Check ground collision
    if (ground.collidesWithPlayer(player)) {
      player.kill();
      return;
    }

    // Update player score
    player.score = pipes.score;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#010103';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    if (!imagesLoaded) return;

    // Draw background
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

    // Draw pipes
    for (const pipeSet of pipes.pipeSets) {
      // Top pipe (flipped) - show top part of source image, cut off bottom
      const topPipe = pipeSet.topPipe.getBoundingBox();
      ctx.save();
      ctx.scale(1, -1);
      ctx.drawImage(
        pipeImg.current,
        0,
        0, // Source x, y (start from top of image)
        pipeImg.current.width,
        topPipe.height, // Source width, height (show top portion)
        topPipe.x,
        -topPipe.y - topPipe.height,
        topPipe.width,
        topPipe.height
      );
      ctx.restore();

      // Bottom pipe (normal) - show top part of source image, cut off bottom
      const bottomPipe = pipeSet.bottomPipe.getBoundingBox();
      ctx.drawImage(
        pipeImg.current,
        0,
        0, // Source x, y (start from top of image)
        pipeImg.current.width,
        bottomPipe.height, // Source width, height (show top portion)
        bottomPipe.x,
        bottomPipe.y,
        bottomPipe.width,
        bottomPipe.height
      );
    }

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

    ctx.save();
    ctx.translate(player.x, player.y);

    if (player.isFlying || !player.isAlive) {
      let angle;
      if (player.velocity <= 0) {
        // Bird is jumping/ascending - face upward at 30 degrees
        angle = -30;
      } else {
        // Falling down - gradually face downward based on velocity
        angle = Math.min(player.velocity * 3, 45);
      }
      ctx.rotate((angle * Math.PI) / 180);
    }

    ctx.drawImage(birdImg.current, -38, -27, 77, 54);
    ctx.restore();
  };

  // Main game loop - handles bird movement and game state
  useEffect(() => {
    if (gameStatus !== GameStatus.Running || !imagesLoaded) return;
    return setupGameLoop();
  }, [gameStatus, imagesLoaded, speed]);

  // Setup keyboard controls when human is playing
  useEffect(() => {
    if (!humanPlaying) return;
    if (gameStatus !== GameStatus.Running && gameStatus !== GameStatus.Idle)
      return;
    return setupKeyboardControls();
  }, [gameStatus, humanPlaying]);

  // Handle game reset
  useEffect(() => {
    if (gameStatus !== GameStatus.Reset) return;
    handleGameReset();
  }, [gameStatus]);

  // Switch between human and AI modes
  useEffect(() => {
    if (gameStatus === GameStatus.Idle) return;
    handleModeSwitch();
  }, [humanPlaying]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [imagesLoaded]);

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

export default FlappyBird;
