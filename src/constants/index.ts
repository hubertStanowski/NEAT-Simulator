export const emailAddress = "hubert.stanowski@gmail.com";
export const githubURL = "https://github.com/hubertStanowski";
export const linkedinURL =
  "https://www.linkedin.com/in/hubert-stanowski-b76413279/";
export const portfolioURL = "https://hubertstanowski.netlify.app/";

export const gridSize = 30;

export enum GameStatus {
  Running = "running",
  Paused = "paused",
  Idle = "idle",
  Reset = "reset",
  Training = "training",
  Stopped = "stopped",
}

export const stepLimit = 8 * gridSize;
export const startingPlayerSize = 2;
export const trainingPlayerSize = 10;
