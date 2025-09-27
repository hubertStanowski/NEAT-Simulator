import { useState, useEffect, useRef } from 'react';
import {
  Player,
  DoublePipeSet,
  Ground,
  GameState,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
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

  // Image objects
  const backgroundImg = useRef<HTMLImageElement>(new Image());
  const birdImg = useRef<HTMLImageElement>(new Image());
  const groundImg = useRef<HTMLImageElement>(new Image());
  const pipeImg = useRef<HTMLImageElement>(new Image());

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

    // Clear canvas
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    if (!imagesLoaded) {
      // Show loading screen
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Loading...', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
      return;
    }

    // Draw background
    ctx.drawImage(backgroundImg.current, 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

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

    // Draw ground (repeat to fill screen for scrolling effect)
    const groundBox = ground.getBoundingBox();
    ctx.drawImage(
      groundImg.current,
      groundBox.x,
      groundBox.y,
      groundBox.width,
      groundBox.height
    );
    // Draw second ground image for seamless scrolling
    ctx.drawImage(
      groundImg.current,
      groundBox.x + groundBox.width,
      groundBox.y,
      groundBox.width,
      groundBox.height
    );

    // Draw player (bird) with rotation based on velocity
    ctx.save();
    ctx.translate(player.x, player.y);

    if (!player.isFlying && player.isAlive) {
      // Bird not flying, no rotation
    } else if (player.velocity < 10) {
      ctx.rotate((30 * Math.PI) / 180); // 30 degrees up
    } else {
      const angle = Math.max(30 - (player.velocity - 10) * 12, -90);
      ctx.rotate((angle * Math.PI) / 180);
    }

    ctx.drawImage(birdImg.current, -17, -12, 34, 24); // Center the bird
    ctx.restore();

    // Draw score
    ctx.fillStyle = '#000000';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), WINDOW_WIDTH / 2, 50);

    // Draw game state text
    if (gameState === GameState.IDLE) {
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to start', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2);
    } else if (gameState === GameState.GAME_OVER) {
      ctx.fillStyle = '#ff0000';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', WINDOW_WIDTH / 2, WINDOW_HEIGHT / 2 - 50);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.fillText(
        'Press SPACE to restart',
        WINDOW_WIDTH / 2,
        WINDOW_HEIGHT / 2
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
          width={WINDOW_WIDTH}
          height={WINDOW_HEIGHT}
          className="border border-gray-400 bg-sky-300"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    </div>
  );
};

export default FlappyBird;
