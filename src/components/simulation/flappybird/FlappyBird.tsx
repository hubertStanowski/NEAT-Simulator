import { useState, useEffect, useRef } from 'react';
import {
  Player,
  DoublePipeSet,
  Ground,
  GameState,
  BACKGROUND_Y_OFFSET_RATIO,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  BACKGROUND_IMG,
  BIRD_IMG,
  GROUND_IMG,
  PIPE_IMG,
} from '@/flappybird';

const FlappyBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [player] = useState(new Player());
  const [pipes] = useState(new DoublePipeSet());
  const [ground] = useState(new Ground());
  const [score, setScore] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [showDebugHitboxes, setShowDebugHitboxes] = useState(false); // Set to true for debugging
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  }); // Default dimensions

  // Image objects
  const backgroundImg = useRef<HTMLImageElement>(new Image());
  const birdImg = useRef<HTMLImageElement>(new Image());
  const groundImg = useRef<HTMLImageElement>(new Image());
  const pipeImg = useRef<HTMLImageElement>(new Image());

  // Set up canvas dimensions dynamically
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const updateCanvasDimensions = () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        setCanvasDimensions({
          width: canvas.clientWidth,
          height: canvas.clientHeight,
        });
      };

      updateCanvasDimensions();
      window.addEventListener('resize', updateCanvasDimensions);

      return () => window.removeEventListener('resize', updateCanvasDimensions);
    }
  }, []);

  // Load images
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = 4;

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
      }
    };

    backgroundImg.current.onload = handleImageLoad;
    birdImg.current.onload = handleImageLoad;
    groundImg.current.onload = handleImageLoad;
    pipeImg.current.onload = handleImageLoad;

    backgroundImg.current.src = BACKGROUND_IMG;
    birdImg.current.src = BIRD_IMG;
    groundImg.current.src = GROUND_IMG;
    pipeImg.current.src = PIPE_IMG;
  }, []);

  // Update game objects when canvas dimensions change
  useEffect(() => {
    player.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
    pipes.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
    ground.updateCanvasSize(canvasDimensions.width, canvasDimensions.height);
  }, [canvasDimensions, player, pipes, ground]);

  // Game loop
  useEffect(() => {
    if (gameState !== GameState.RUNNING || !imagesLoaded) return;

    const gameLoop = () => {
      if (player.isFlying || gameState === GameState.RUNNING) {
        pipes.update(player.x);
      }

      if (player.isAlive || gameState === GameState.RUNNING) {
        ground.update();
      }

      if (gameState === GameState.RUNNING) {
        player.update();
        checkCollisions();
        setScore(pipes.score);
      }

      draw();
    };

    const interval = setInterval(gameLoop, 1000 / 60); // 60 FPS
    return () => clearInterval(interval);
  }, [gameState, player, pipes, ground, imagesLoaded]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();

        if (gameState === GameState.IDLE || gameState === GameState.GAME_OVER) {
          // Start new game
          player.reset();
          pipes.reset();
          setScore(0);
          setGameState(GameState.RUNNING);
        }

        if (gameState === GameState.RUNNING) {
          player.flap();
        }
      }

      if (event.code === 'KeyD') {
        // Toggle debug hitboxes with 'D' key
        setShowDebugHitboxes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, player, pipes]);

  const checkCollisions = () => {
    if (!player.isAlive) return;

    // Check pipe collisions
    if (pipes.collidesWithPlayer(player)) {
      player.kill();
      setGameState(GameState.GAME_OVER);
      return;
    }

    // Check ground collision
    if (ground.collidesWithPlayer(player)) {
      player.kill();
      setGameState(GameState.GAME_OVER);
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

    // Fill canvas with background color to prevent edge gaps
    ctx.fillStyle = '#010103';
    ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

    if (!imagesLoaded) {
      // Show loading screen
      ctx.fillStyle = '#010103';
      ctx.font = `${canvasDimensions.height * 0.0375}px Arial`; // Responsive font size
      ctx.textAlign = 'center';
      ctx.fillText(
        'Loading...',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2
      );
      return;
    }
    // Draw background (moved up to show bottom portion, with slight overscaling to prevent gaps)
    const backgroundYOffset =
      canvasDimensions.height * BACKGROUND_Y_OFFSET_RATIO;
    const backgroundScale = 1.02; // Slight overscale to prevent edge gaps
    const scaledWidth = canvasDimensions.width * backgroundScale;
    const scaledHeight = canvasDimensions.height * backgroundScale;
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
      // Top pipe (flipped)
      const topPipe = pipeSet.topPipe.getBoundingBox();
      ctx.save();
      ctx.scale(1, -1);
      ctx.drawImage(
        pipeImg.current,
        topPipe.x,
        -topPipe.y - topPipe.height,
        topPipe.width,
        topPipe.height
      );
      ctx.restore();

      // Bottom pipe (normal)
      const bottomPipe = pipeSet.bottomPipe.getBoundingBox();
      ctx.drawImage(
        pipeImg.current,
        bottomPipe.x,
        bottomPipe.y,
        bottomPipe.width,
        bottomPipe.height
      );
    }

    // Draw ground with seamless scrolling and overlap to prevent gaps
    const groundBox = ground.getBoundingBox();
    const groundOverlap = 2; // Small overlap to prevent gaps

    // Draw multiple ground segments to ensure full coverage
    const numSegments = Math.ceil(canvasDimensions.width / groundBox.width) + 2;
    for (let i = 0; i < numSegments; i++) {
      ctx.drawImage(
        groundImg.current,
        groundBox.x + i * groundBox.width - groundOverlap,
        groundBox.y,
        groundBox.width + groundOverlap * 2,
        groundBox.height + 2 // Slightly taller to prevent bottom gaps
      );
    }

    // Draw player (bird) with rotation based on velocity
    ctx.save();
    ctx.translate(player.x, player.y);

    if (!player.isFlying && player.isAlive) {
      // Bird not flying, no rotation (face straight)
      // No rotation needed - bird faces forward naturally
    } else {
      // Rotation based on velocity
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

    ctx.drawImage(birdImg.current, -38, -27, 77, 54); // Center the bird (scaled up 2.25x - 50% bigger than before)
    ctx.restore();

    // Debug: Draw hitboxes (toggle with 'D' key)
    if (showDebugHitboxes && gameState === GameState.RUNNING) {
      const playerBox = player.getBoundingBox();

      // Draw bird hitbox
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        playerBox.x,
        playerBox.y,
        playerBox.width,
        playerBox.height
      );

      // Draw pipe hitboxes
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      for (const pipeSet of pipes.pipeSets) {
        const topPipeBox = pipeSet.topPipe.getBoundingBox();
        const bottomPipeBox = pipeSet.bottomPipe.getBoundingBox();

        ctx.strokeRect(
          topPipeBox.x,
          topPipeBox.y,
          topPipeBox.width,
          topPipeBox.height
        );
        ctx.strokeRect(
          bottomPipeBox.x,
          bottomPipeBox.y,
          bottomPipeBox.width,
          bottomPipeBox.height
        );
      }

      // Draw ground hitbox
      ctx.strokeStyle = '#0000ff';
      ctx.lineWidth = 1;
      const groundBox = ground.getBoundingBox();
      ctx.strokeRect(
        groundBox.x,
        groundBox.y,
        groundBox.width,
        groundBox.height
      );
    }

    // Draw score (responsive size)
    ctx.fillStyle = '#000000';
    ctx.font = `${canvasDimensions.height * 0.075}px Arial`; // 0.075 = 72/960
    ctx.textAlign = 'center';
    ctx.fillText(
      score.toString(),
      canvasDimensions.width / 2,
      canvasDimensions.height * 0.078
    ); // 0.078 = 75/960

    // Draw game state text (responsive)
    if (gameState === GameState.IDLE) {
      ctx.fillStyle = '#000000';
      ctx.font = `${canvasDimensions.height * 0.0375}px Arial`; // 0.0375 = 36/960
      ctx.textAlign = 'center';
      ctx.fillText(
        'Press SPACE to start',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2
      );
      ctx.font = `${canvasDimensions.height * 0.025}px Arial`; // 0.025 = 24/960
      ctx.fillText(
        'Press D to toggle debug hitboxes',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2 + canvasDimensions.height * 0.047 // 0.047 = 45/960
      );
    } else if (gameState === GameState.GAME_OVER) {
      ctx.fillStyle = '#ff0000';
      ctx.font = `${canvasDimensions.height * 0.05}px Arial`; // 0.05 = 48/960
      ctx.textAlign = 'center';
      ctx.fillText(
        'GAME OVER',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2 - canvasDimensions.height * 0.078
      ); // 0.078 = 75/960
      ctx.fillStyle = '#000000';
      ctx.font = `${canvasDimensions.height * 0.0375}px Arial`;
      ctx.fillText(
        'Press SPACE to restart',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2
      );
      ctx.font = `${canvasDimensions.height * 0.025}px Arial`;
      ctx.fillText(
        'Press D to toggle debug hitboxes',
        canvasDimensions.width / 2,
        canvasDimensions.height / 2 + canvasDimensions.height * 0.047
      );
    }
  };

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
