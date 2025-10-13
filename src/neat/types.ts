import { Genome } from './genome';

// Base interface for all NEAT-enabled players
export interface INeatPlayer {
  isAlive: boolean;
  fitness: number;
  lifespan: number;
  genome_inputs: number;
  genome_outputs: number;
  genome: Genome;
  vision: number[];
  generation: number;

  // Common methods
  clone(): INeatPlayer;
  updateFitness(): void;
  look(...args: unknown[]): void;
  decide(...args: unknown[]): void;
  getScore(): number;
}

export interface INeatConfig {
  nextInnovationNumber: number;
  weightMutationProbability: number;
  addConnectionMutationProbability: number;
  addNodeMutationProbability: number;
  bigWeightMutationProbability: number;
  crossoverConnectionDisableProbability: number;
  noCrossoverProbability: number;
  speciesStalenessLimit: number;
  populationStalenessLimit: number;
  excessDisjointCoefficient: number;
  weightDifferenceCoefficient: number;
  compatibilityThreshold: number;
}

export interface INodeGene {
  id: number;
  layer: number;
  outputConnections: IConnectionGene[];
  inputSum: number;
  outputValue: number;
}

export interface IConnectionGene {
  input: INodeGene;
  output: INodeGene;
  weight: number;
  innovationNumber: number;
  enabled: boolean;
}

export interface IGenome {
  nodes: INodeGene[];
  connections: IConnectionGene[];
  inputs: number;
  outputs: number;
  biasNode: number | null;
  layerCount: number;
  nextNodeId: number;
  network: INodeGene[];
}

export interface IInnovationHistory {
  input: number;
  output: number;
  innovationNumber: number;
  connectedInnovationNumbers: number[];
}

export interface ISpecies<T extends INeatPlayer> {
  players: T[];
  representative: T;
  bestFitness: number;
  averageFitness: number;
  staleness: number;
}

export interface IPopulation<T extends INeatPlayer> {
  config: INeatConfig;
  size: number;
  innovationHistory: IInnovationHistory[];
  players: T[];
  species: ISpecies<T>[];
  currBestPlayer: T | null;
  prevBestPlayer: T | null;
  bestEverPlayer: T | null;
  generation: number;
  staleness: number;
  genBestPlayers: T[];
}
