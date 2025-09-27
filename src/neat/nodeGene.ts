import { INodeGene } from './types';
import type { ConnectionGene } from './connectionGene';

export class NodeGene implements INodeGene {
  id: number;
  layer: number;
  outputConnections: ConnectionGene[];
  inputSum: number;
  outputValue: number;

  constructor(id: number, layer: number = 0) {
    this.id = id;
    this.layer = layer;
    this.outputConnections = [];
    this.inputSum = 0;
    this.outputValue = 0;
  }

  isConnectedTo(other: NodeGene): boolean {
    if (other.layer! < this.layer!) {
      for (let i = 0; i < other.outputConnections.length; i++) {
        if (other.outputConnections[i].output === this) {
          return true;
        }
      }
    } else if (other.layer! > this.layer!) {
      for (let i = 0; i < this.outputConnections.length; i++) {
        if (this.outputConnections[i].output === other) {
          return true;
        }
      }
    }

    return false;
  }

  sigmoid(x: number): number {
    // Modified formula from creators of NEAT
    return 1.0 / (1.0 + Math.exp(-4.9 * x));
  }

  engage(): void {
    if (this.layer !== 0) {
      this.outputValue = this.sigmoid(this.inputSum);
    }

    for (const current_connection of this.outputConnections) {
      if (current_connection.enabled) {
        current_connection.output.inputSum +=
          current_connection.weight * this.outputValue;
      }
    }
  }

  clone(): NodeGene {
    return new NodeGene(this.id, this.layer);
  }
}
