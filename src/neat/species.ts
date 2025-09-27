import { Player } from '@/snake';
import { Genome } from './genome';
import { InnovationHistory } from './innovationHistory';
import { NeatConfig } from './neatConfig';
import { ISpecies } from './types';

export class Species implements ISpecies {
  players: Player[];
  representative: Player;
  bestFitness: number;
  averageFitness: number;
  staleness: number;

  constructor(representative: Player) {
    this.players = [representative];
    this.representative = representative;
    this.bestFitness = 0;
    this.averageFitness = this.bestFitness;
    this.staleness = 0;
  }

  reproduce(
    config: NeatConfig,
    innovationHistory: InnovationHistory[]
  ): Player | undefined {
    if (this.players.length < 1) {
      return;
    }

    let child: Player;
    if (Math.random() < config.getNoCrossoverProbability()) {
      child = this.selectPlayer().clone();
    } else {
      if (this.players.length < 2) {
        return;
      }
      const parent1 = this.selectPlayer();
      const parent2 = this.selectPlayer();

      if (parent1.fitness > parent2.fitness) {
        child = parent1.crossover(config, parent2);
      } else {
        child = parent2.crossover(config, parent1);
      }
    }

    child.genome.mutate(config, innovationHistory);

    if (!child) {
      return new Player();
    }

    return child;
  }

  isThisSpecies(config: NeatConfig, testedGenome: Genome): boolean {
    const largeGenomeNormalizer = Math.max(
      testedGenome.connections.length - 20,
      1
    );

    const averageWeightDifference = this.getAverageWeightDifference(
      testedGenome,
      this.representative.genome
    );
    const excessDisjointCount = this.getExcessDisjointCount(
      testedGenome,
      this.representative.genome
    );

    const compatibility =
      (config.getExcessDisjointCoefficient() * excessDisjointCount) /
        largeGenomeNormalizer +
      config.getWeightDifferenceCoefficient() * averageWeightDifference;

    return compatibility < config.getCompatibilityThreshold();
  }

  sort(): void {
    if (!this.players.length) {
      this.staleness = Infinity;
      return;
    }

    this.players.sort((a, b) => b.fitness - a.fitness);

    if (this.players[0].fitness > this.bestFitness) {
      this.staleness = 0;
      this.bestFitness = this.players[0].fitness;
      this.representative = this.players[0];
    } else {
      this.staleness += 1;
    }
  }

  removeLowPerformers(): void {
    if (this.players.length <= 2) {
      return;
    }

    const keepCount = Math.max(2, Math.ceil(this.players.length * 0.6));
    this.players.splice(keepCount);
  }

  getAverageWeightDifference(genome1: Genome, genome2: Genome): number {
    if (!genome1.connections.length || !genome2.connections.length) {
      return 0;
    }

    let matchCount = 0;
    let diffSum = 0;

    for (const conn1 of genome1.connections) {
      for (const conn2 of genome2.connections) {
        if (conn1.innovationNumber === conn2.innovationNumber) {
          matchCount += 1;
          diffSum += Math.abs(conn1.weight - conn2.weight);
          break;
        }
      }
    }

    if (matchCount === 0) {
      return Infinity;
    }

    return diffSum / matchCount;
  }

  getExcessDisjointCount(genome1: Genome, genome2: Genome): number {
    let matchCount = 0;
    for (const conn1 of genome1.connections) {
      for (const conn2 of genome2.connections) {
        if (conn1.innovationNumber === conn2.innovationNumber) {
          matchCount += 1;
          break;
        }
      }
    }

    return (
      genome1.connections.length + genome2.connections.length - 2 * matchCount
    );
  }

  selectPlayer(): Player {
    const fitnessSum = this.players.reduce(
      (sum, player) => sum + player.fitness,
      0
    );
    const randomThreshold = Math.random() * fitnessSum;

    let runningSum = 0;
    for (const player of this.players) {
      runningSum += player.fitness;
      if (runningSum >= randomThreshold) {
        return player;
      }
    }
    return this.players[0];
  }

  updateAverageFitness(): void {
    if (!this.players.length) {
      return;
    }

    this.averageFitness =
      this.players.reduce((sum, player) => sum + player.fitness, 0) /
      this.players.length;
  }

  shareFitness(): void {
    const adjustedSize = Math.sqrt(this.players.length);
    for (const player of this.players) {
      player.fitness /= adjustedSize;
    }
  }

  add(newPlayer: Player): void {
    this.players.push(newPlayer);
  }
}
