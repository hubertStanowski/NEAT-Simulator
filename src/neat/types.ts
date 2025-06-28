import { IPlayer } from "@/snake";

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
  outputConnections: any[];
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

export interface ISpecies {
  players: IPlayer[];
  representative: IPlayer;
  bestFitness: number;
  averageFitness: number;
  staleness: number;
}

export interface IPopulation {
  config: INeatConfig;
  size: number;
  innovationHistory: IInnovationHistory[];
  players: IPlayer[];
  species: ISpecies[];
  currBestPlayer: IPlayer | null;
  prevBestPlayer: IPlayer | null;
  bestEverPlayer: IPlayer | null;
  generation: number;
  staleness: number;
  genBestPlayers: IPlayer[];
}
