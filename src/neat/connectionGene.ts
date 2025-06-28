import { NodeGene } from "./nodeGene";
import { NeatConfig } from "./neatConfig";
import { IConnectionGene } from "./types";

export class ConnectionGene implements IConnectionGene {
  input: NodeGene;
  output: NodeGene;
  weight: number;
  innovationNumber: number;
  enabled: boolean;

  constructor(
    input: NodeGene,
    output: NodeGene,
    weight: number,
    innovationNumber: number,
    enabled: boolean = true,
  ) {
    this.input = input;
    this.output = output;
    this.weight = weight;
    this.innovationNumber = innovationNumber;
    this.enabled = enabled;
  }

  disable(): void {
    this.enabled = false;
  }

  mutateWeight(config: NeatConfig): void {
    if (Math.random() < config.getBigWeightMutationProbability()) {
      this.weight = Math.random() * 2 - 1;
    } else {
      this.weight += this.randomGaussian() / 50;

      this.weight = Math.min(this.weight, 1);
      this.weight = Math.max(this.weight, -1);
    }
  }

  clone(input: NodeGene, output: NodeGene): ConnectionGene {
    return new ConnectionGene(
      input,
      output,
      this.weight,
      this.innovationNumber,
      this.enabled,
    );
  }

  private randomGaussian(): number {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
}
