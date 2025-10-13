import { NeatConfig } from './neatConfig';
import { InnovationHistory } from './innovationHistory';
import { Species } from './species';
import { IPopulation, INeatPlayer } from './types';

export abstract class Population<T extends INeatPlayer>
  implements IPopulation<T>
{
  config: NeatConfig;
  size: number;
  innovationHistory: InnovationHistory[] = [];
  players: T[] = [];
  species: Species<T>[] = [];
  currBestPlayer: T | null = null;
  prevBestPlayer: T | null = null;
  bestEverPlayer: T | null = null;
  generation: number = 1;
  staleness: number = 0;
  genBestPlayers: T[] = [];

  constructor(config: NeatConfig, size: number, skipInit: boolean = false) {
    this.config = config;
    this.size = size;
    if (!skipInit) {
      this.initializePopulation();
    }
  }

  protected initializePopulation(): void {
    for (let i = 0; i < this.size; i++) {
      const player = this.createPlayer();

      // Start with partially connected networks instead of fully connected
      if (i < this.size * 0.15) {
        // 15% start fully connected for diversity
        player.genome.fullyConnect(this.config, this.innovationHistory);
      } else {
        // 85% start with just a few random connections
        const numInitialConnections = Math.floor(Math.random() * 6) + 1; // 1-6 connections
        for (let j = 0; j < numInitialConnections; j++) {
          player.genome.addConnection(this.config, this.innovationHistory);
        }
      }

      player.genome.mutate(this.config, this.innovationHistory);
      player.genome.generateNetwork();
      this.players.push(player);

      if (
        !this.currBestPlayer ||
        player.genome.nodes.length > this.currBestPlayer.genome.nodes.length
      ) {
        this.currBestPlayer = player;
      }

      this.bestEverPlayer = this.currBestPlayer;
    }

    this.prevBestPlayer = this.currBestPlayer;
  }

  protected abstract createPlayer(): T;

  // Abstract method to create species - needs to be overridden because Population constructor needs specific player type
  protected abstract createSpecies(representative: T): Species<T>;

  // Helper method to create a new random player with fully connected genome
  protected createNewRandomPlayer(): T {
    const newPlayer = this.createPlayer();
    newPlayer.genome.fullyConnect(this.config, this.innovationHistory);
    newPlayer.genome.mutate(this.config, this.innovationHistory);
    newPlayer.genome.generateNetwork();
    return newPlayer;
  }

  getAliveCount(): number {
    return this.players.filter((player) => player.isAlive).length;
  }

  abstract updateSurvivors(...args: unknown[]): void;

  protected updateBestPlayers(): void {
    for (const player of this.players) {
      if (player) {
        if (player.getScore() > (this.currBestPlayer?.getScore() || 0)) {
          this.currBestPlayer = player;
        }

        if (
          (this.bestEverPlayer?.getScore() || 0) <=
          (this.currBestPlayer?.getScore() || 0)
        ) {
          this.bestEverPlayer = this.currBestPlayer;
        }
      }
    }
  }

  naturalSelection(): void {
    if (
      (this.prevBestPlayer?.getScore() || 0) >=
      (this.currBestPlayer?.getScore() || 0)
    ) {
      this.staleness += 1;
    } else {
      this.staleness = 0;
    }
    this.genBestPlayers.push(this.currBestPlayer!.clone() as T);

    this.prevBestPlayer = this.currBestPlayer;

    this.speciate();
    this.updateFitness();
    this.sort();
    this.removeLowPerformersFromSpecies();
    this.killLowPerformingSpecies();
    this.killStaleSpecies();

    const averageFitnessSum = this.getAvgFitnessSum();
    this.players = [];

    // Always keep the best player from current generation
    if (this.currBestPlayer) {
      this.players.push(this.currBestPlayer.clone() as T);
    }

    // Keep best player ever if different from current best
    if (this.bestEverPlayer && this.bestEverPlayer !== this.currBestPlayer) {
      this.players.push(this.bestEverPlayer.clone() as T);
    }

    for (const s of this.species) {
      this.players.push(s.representative.clone() as T);
      const childrenCount = Math.floor(
        (s.averageFitness / averageFitnessSum) * this.size - 1
      );

      for (let i = 0; i < childrenCount; i++) {
        const child = s.reproduce(this.config, this.innovationHistory);
        if (child) {
          this.players.push(child);
        }
      }
    }

    // Fill remaining slots
    while (this.players.length < this.size) {
      if (this.species.length > 0) {
        const reproduced = this.species[0].reproduce(
          this.config,
          this.innovationHistory
        );
        if (reproduced) {
          this.players.push(reproduced);
        } else {
          this.players.push(this.createNewRandomPlayer());
        }
      } else {
        this.players.push(this.createNewRandomPlayer());
      }
    }

    this.generation += 1;
    this.currBestPlayer = this.players[0];
    for (const player of this.players) {
      if (player) {
        player.genome.generateNetwork();
      }
    }
  }

  finished(): boolean {
    for (const player of this.players) {
      if (player && player.isAlive) {
        return false;
      }
    }
    return true;
  }

  speciate(): void {
    for (const s of this.species) {
      s.players = [];
    }

    for (const player of this.players) {
      if (!player) continue;
      let assigned = false;
      for (const s of this.species) {
        if (s.isThisSpecies(this.config, player.genome)) {
          s.add(player);
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        this.species.push(this.createSpecies(player));
      }
    }
  }

  killLowPerformingSpecies(): void {
    const averageFitnessSum = this.getAvgFitnessSum();
    const killList: number[] = [];

    for (let i = 0; i < this.species.length; i++) {
      if (
        (this.species[i].averageFitness / averageFitnessSum) * this.size <
        1
      ) {
        killList.push(i);
      }
    }

    for (const i of killList) {
      this.species.splice(i, 1);
    }
  }

  removeLowPerformersFromSpecies(): void {
    for (const species of this.species) {
      species.removeLowPerformers();
      species.shareFitness();
      species.updateAverageFitness();
    }
  }

  killStaleSpecies(): void {
    const killList: number[] = [];
    for (let i = 2; i < this.species.length; i++) {
      if (this.species[i].staleness >= this.config.getSpeciesStalenessLimit()) {
        killList.push(i);
      }
    }

    for (const i of killList) {
      this.species.splice(i, 1);
    }
  }

  sort(): void {
    for (const s of this.species) {
      s.sort();
    }

    this.species.sort((a, b) => b.bestFitness - a.bestFitness);
  }

  updateFitness(): void {
    for (const player of this.players) {
      if (player) {
        player.updateFitness();
      }
    }
  }

  getAvgFitnessSum(): number {
    return this.species.reduce(
      (sum, species) => sum + species.averageFitness,
      0
    );
  }
}
