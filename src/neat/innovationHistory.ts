import { NodeGene } from './nodeGene';
import { IInnovationHistory } from './types';
import type { Genome } from './genome';

export class InnovationHistory implements IInnovationHistory {
  input: number;
  output: number;
  innovationNumber: number;
  connectedInnovationNumbers: number[];

  constructor(
    input: number,
    output: number,
    innovationNumber: number,
    connectedInnovationNumbers: number[]
  ) {
    this.input = input;
    this.output = output;
    this.innovationNumber = innovationNumber;
    this.connectedInnovationNumbers = [...connectedInnovationNumbers];
  }

  matches(genome: Genome, input: NodeGene, output: NodeGene): boolean {
    if (input.id !== this.input || output.id !== this.output) {
      return false;
    }
    if (genome.connections.length !== this.connectedInnovationNumbers.length) {
      return false;
    }

    for (let i = 0; i < genome.connections.length; i++) {
      if (
        !this.connectedInnovationNumbers.includes(
          genome.connections[i].innovationNumber
        )
      ) {
        return false;
      }
    }

    return true;
  }
}
