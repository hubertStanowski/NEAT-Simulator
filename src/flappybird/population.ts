import { NeatConfig } from '@/neat/neatConfig';
import { Population } from '@/neat/population';
import { Player } from './player';
import { FlappyBirdSpecies } from './species';
import { Ground } from './ground';
import { DoublePipeSet } from './pipes';

export class FlappyBirdPopulation extends Population<Player> {
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    config: NeatConfig,
    size: number,
    canvasWidth: number,
    canvasHeight: number
  ) {
    super(config, size, true);

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.initializePopulation();
  }

  protected createPlayer(): Player {
    return new Player(this.canvasWidth, this.canvasHeight);
  }

  protected createSpecies(representative: Player): FlappyBirdSpecies {
    return new FlappyBirdSpecies(representative);
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

          if (pipes.collidesWithPlayer(player)) {
            player.kill();
          }
          if (ground.collidesWithPlayer(player)) {
            player.kill();
          }

          player.score = pipes.score;
        }
      }
    }

    this.updateBestPlayers();
  }

  finished(): boolean {
    for (const player of this.players) {
      if (player && (player.isAlive || player.isFlying)) {
        return false;
      }
    }
    return true;
  }
}
