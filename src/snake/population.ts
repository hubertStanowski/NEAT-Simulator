import { Population } from '@/neat/population';
import { NeatConfig } from '@/neat/neatConfig';
import { Player } from './player';
import { SnakeSpecies } from './species';

export class SnakePopulation extends Population<Player> {
  constructor(config: NeatConfig, size: number) {
    super(config, size);
  }

  protected createPlayer(): Player {
    return new Player();
  }

  protected createSpecies(representative: Player): SnakeSpecies {
    return new SnakeSpecies(representative);
  }

  updateSurvivors(): void {
    for (const player of this.players) {
      if (player) {
        player.generation = this.generation;
        if (player.isAlive) {
          player.look();
          player.decide();
          player.moveSnake();
          player.updateGrid();
        }
      }
    }

    this.updateBestPlayers();
  }
}
