// Canvas sizing (dynamic with default dimensions)
export const DEFAULT_CANVAS_WIDTH = 720;
export const DEFAULT_CANVAS_HEIGHT = 960;

// Player starting position (will be calculated dynamically)
export const PLAYER_X_RATIO = 1 / 3;
export const PLAYER_Y_RATIO = 1 / 2;

// Physics
export const SCROLL_SPEED = 4;
export const GRAVITY = 0.6;
export const FLAP_SPEED = 10;

// Pipes (responsive ratios instead of fixed sizes)
export const PIPE_GAP_RATIO = 0.2; // Gap as ratio of canvas height
export const PIPE_SEPARATION_RATIO = 0.583; // Distance between pipe sets as ratio of canvas width
export const PIPE_WIDTH_RATIO = 0.108; // Pipe width as ratio of canvas width
export const PIPE_MIN_HEIGHT_RATIO = 0.15; // Minimum pipe height as ratio of canvas height (ensures pipes are never too short)

// Visual adjustments (responsive)
export const BACKGROUND_Y_OFFSET_RATIO = -0.104; // Move background up as ratio of canvas height

// Assets
export const BACKGROUND_IMG = '/assets/flappybird/background.png';
export const BIRD_IMG = '/assets/flappybird/bird.png';
export const GROUND_IMG = '/assets/flappybird/ground.png';
export const PIPE_IMG = '/assets/flappybird/pipe.png';
