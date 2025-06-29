export const emailAddress = "hubert.stanowski@gmail.com";
export const githubURL = "https://github.com/hubertStanowski";
export const linkedinURL = "https://www.linkedin.com/in/hubert-stanowski/";
export const portfolioURL = "https://hubertstanowski.netlify.app/";

export const trainingGridSize = 10;
export const simulationGridSize = 30;

export enum GameStatus {
  Running = "running",
  Paused = "paused",
  Idle = "idle",
  Reset = "reset",
  Training = "training",
  Stopped = "stopped",
}

export const stepLimit = 10 * simulationGridSize;
export const startingPlayerSize = 2;
export const trainingPlayerSize = 2;
