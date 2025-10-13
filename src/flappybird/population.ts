import { NeatConfig } from '@/neat/neatConfig';
import { InnovationHistory } from '@/neat/innovationHistory';
import { Player } from './player';
import { FlappyBirdSpecies } from './species';
import { Ground } from './ground';
import { DoublePipeSet } from './pipes';

export class FlappyBirdPopulation {
  config: NeatConfig;
  size: number;
  innovationHistory: InnovationHistory[] = [];
  players: Player[] = [];
  species: FlappyBirdSpecies[] = [];
  currBestPlayer: Player | null = null;
  prevBestPlayer: Player | null = null;
  bestEverPlayer: Player | null = null;
  generation: number = 1;
  staleness: number = 0;
  genBestPlayers: Player[] = [];
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    config: NeatConfig,
    size: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.config = config;
    this.size = size;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    for (let i = 0; i < size; i++) {
      const player = new Player(canvasWidth, canvasHeight);

      // Start with partially connected networks instead of fully connected
      if (i < size * 0.15) {
        // 15% start fully connected for diversity
        player.genome.fullyConnect(config, this.innovationHistory);
      } else {
        // 85% start with just a few random connections
        const numInitialConnections = Math.floor(Math.random() * 6) + 1;
        for (let j = 0; j < numInitialConnections; j++) {
          player.genome.addConnection(config, this.innovationHistory);
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

  getAliveCount(): number {
    return this.players.filter((player) => player.isAlive).length;
  }

  updateSurvivors(ground: Ground, pipes: DoublePipeSet): void {
    for (const player of this.players) {
      if (player) {
        player.generation = this.generation;
        if (player.isAlive) {
          player.look(ground, pipes);
          player.decide();
        }

        if (player.isFlying) {
          player.update();

          // Check collisions
          if (pipes.collidesWithPlayer(player)) {
            player.kill();
          }
          if (ground.collidesWithPlayer(player)) {
            player.kill();
          }

          // Update score
          player.score = pipes.score;
        }

        if (
          player.getScore() > (this.currBestPlayer?.getScore() || 0) ||
          (player.getScore() === (this.currBestPlayer?.getScore() || 0) &&
            player.genome.connections.length >
              (this.currBestPlayer?.genome.connections.length || 0))
        ) {
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
    if (this.currBestPlayer) {
      this.genBestPlayers.push(this.currBestPlayer.clone());
    }

    this.prevBestPlayer = this.currBestPlayer;

    this.speciate();
    this.updateFitness();
    this.sort();
    this.removeLowPerformersFromSpecies();
    this.killLowPerformingSpecies();
    this.killStaleSpecies();

    const averageFitnessSum = this.getAvgFitnessSum();
    this.players = [];

    // Elitism: Always keep the best player from current generation
    if (this.currBestPlayer) {
      this.players.push(this.currBestPlayer.clone());
    }

    // Keep best player ever if different from current best
    if (this.bestEverPlayer && this.bestEverPlayer !== this.currBestPlayer) {
      this.players.push(this.bestEverPlayer.clone());
    }

    for (const s of this.species) {
      // Representative is already the best of the species
      this.players.push(s.representative.clone());
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
        this.players.push(
          reproduced || new Player(this.canvasWidth, this.canvasHeight)
        );
      } else {
        // If no species exist, create new random player
        const newPlayer = new Player(this.canvasWidth, this.canvasHeight);
        newPlayer.genome.fullyConnect(this.config, this.innovationHistory);
        newPlayer.genome.mutate(this.config, this.innovationHistory);
        this.players.push(newPlayer);
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
      if (player && (player.isAlive || player.isFlying)) {
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
        this.species.push(new FlappyBirdSpecies(player));
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

    // Remove in reverse order to maintain indices
    for (let i = killList.length - 1; i >= 0; i--) {
      this.species.splice(killList[i], 1);
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

    // Remove in reverse order to maintain indices
    for (let i = killList.length - 1; i >= 0; i--) {
      this.species.splice(killList[i], 1);
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
