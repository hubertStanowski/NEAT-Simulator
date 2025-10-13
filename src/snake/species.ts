import { Species } from '@/neat/species';
import { NeatConfig } from '@/neat/neatConfig';
import { Player } from './player';

export class SnakeSpecies extends Species<Player> {
  constructor(representative: Player) {
    super(representative);
  }

  protected crossover(
    parent1: Player,
    parent2: Player,
    config: NeatConfig
  ): Player {
    return parent1.crossover(config, parent2);
  }
}
