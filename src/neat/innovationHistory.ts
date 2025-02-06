import { NodeGene } from "./nodeGene";

class InnovationHistory {
  input: number;
  output: number;
  innovationNumber: number;
  connectedInnovationNumbers: number[];

  constructor(
    input: number,
    output: number,
    innovationNumber: number,
    connectedInnovationNumbers: number[],
  ) {
    this.input = input;
    this.output = output;
    this.innovationNumber = innovationNumber;
    this.connectedInnovationNumbers = [...connectedInnovationNumbers];
  }

  matches(genome: any, input: NodeGene, output: NodeGene): boolean {
    if (input.id !== this.input || output.id !== this.output) {
      return false;
    }
    if (genome.connections.length !== this.connectedInnovationNumbers.length) {
      return false;
    }

    for (let i = 0; i < genome.connections.length; i++) {
      if (
        !this.connectedInnovationNumbers.includes(
          genome.connections[i].innovationNumber,
        )
      ) {
        return false;
      }
    }

    return true;
  }
}

export { InnovationHistory };
