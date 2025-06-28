import { INeatConfig } from "./types";

export class NeatConfig implements INeatConfig {
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

  constructor() {
    this.nextInnovationNumber = 1;
    this.weightMutationProbability = 0.8;
    this.addConnectionMutationProbability = 0.3;
    this.addNodeMutationProbability = 0.3;
    this.bigWeightMutationProbability = 0.05;
    this.crossoverConnectionDisableProbability = 0.75;
    this.noCrossoverProbability = 0.25;
    this.speciesStalenessLimit = 5;
    this.populationStalenessLimit = 10;
    this.excessDisjointCoefficient = 1;
    this.weightDifferenceCoefficient = 0.4;
    this.compatibilityThreshold = 3;
  }

  getNextInnovationNumber(): number {
    return this.nextInnovationNumber;
  }

  updateNextInnovationNumber(): void {
    this.nextInnovationNumber += 1;
  }

  getWeightMutationProbability(): number {
    return this.weightMutationProbability;
  }

  getAddConnectionMutationProbability(): number {
    return this.addConnectionMutationProbability;
  }

  getAddNodeMutationProbability(): number {
    return this.addNodeMutationProbability;
  }

  getBigWeightMutationProbability(): number {
    return this.bigWeightMutationProbability;
  }

  getCrossoverConnectionDisableProbability(): number {
    return this.crossoverConnectionDisableProbability;
  }

  getNoCrossoverProbability(): number {
    return this.noCrossoverProbability;
  }

  getSpeciesStalenessLimit(): number {
    return this.speciesStalenessLimit;
  }

  getPopulationStalenessLimit(): number {
    return this.populationStalenessLimit;
  }

  getExcessDisjointCoefficient(): number {
    return this.excessDisjointCoefficient;
  }

  getWeightDifferenceCoefficient(): number {
    return this.weightDifferenceCoefficient;
  }

  getCompatibilityThreshold(): number {
    return this.compatibilityThreshold;
  }
}
