import { NodeGene } from './nodeGene';
import { ConnectionGene } from './connectionGene';
import { InnovationHistory } from './innovationHistory';
import { NeatConfig } from './neatConfig';
import { IGenome } from './types';

export class Genome implements IGenome {
  nodes: NodeGene[];
  connections: ConnectionGene[];
  inputs: number;
  outputs: number;
  biasNode: number | null;
  layerCount: number;
  nextNodeId: number;
  network: NodeGene[];

  constructor(inputs: number, outputs: number, crossover: boolean = false) {
    this.nodes = [];
    this.connections = [];
    this.inputs = inputs;
    this.outputs = outputs;
    this.biasNode = null;
    this.layerCount = 2;
    this.nextNodeId = 0;
    this.network = [];

    if (crossover) {
      return;
    }

    for (let i = 0; i < this.inputs; i++) {
      this.nodes.push(new NodeGene(this.nextNodeId, 0));
      this.nextNodeId++;
    }

    for (let i = 0; i < this.outputs; i++) {
      this.nodes.push(new NodeGene(this.nextNodeId, 1));
      this.nextNodeId++;
    }

    this.nodes.push(new NodeGene(this.nextNodeId, 0));
    this.biasNode = this.nextNodeId;
    this.nextNodeId++;
  }

  mutate(config: NeatConfig, innovationHistory: InnovationHistory[]): void {
    if (this.connections.length === 0) {
      this.addConnection(config, innovationHistory);
      return;
    }

    // Always try weight mutation for fine-tuning
    if (Math.random() < config.getWeightMutationProbability()) {
      for (const connection of this.connections) {
        connection.mutateWeight(config);
      }
    }

    // Try to add connection
    if (Math.random() < config.getAddConnectionMutationProbability()) {
      this.addConnection(config, innovationHistory);
    }

    // Try to add node (independent of connection addition)
    if (Math.random() < config.getAddNodeMutationProbability()) {
      // Only add nodes if we have enough connections
      if (this.connections.length > 3) {
        this.addNode(config, innovationHistory);
      } else {
        // If not enough connections, add a connection instead
        this.addConnection(config, innovationHistory);
      }
    }
  }

  addConnection(
    config: NeatConfig,
    innovationHistory: InnovationHistory[]
  ): void {
    if (this.fullyConnected()) {
      return;
    }

    let node1 = Math.floor(Math.random() * this.nodes.length);
    let node2 = Math.floor(Math.random() * this.nodes.length);

    while (this.notUsefulConnection(node1, node2)) {
      node1 = Math.floor(Math.random() * this.nodes.length);
      node2 = Math.floor(Math.random() * this.nodes.length);
    }

    if (this.nodes[node1].layer > this.nodes[node2].layer) {
      [node1, node2] = [node2, node1];
    }

    const connectionInnovationNumber = this.getInnovationNumber(
      config,
      innovationHistory,
      this.nodes[node1],
      this.nodes[node2]
    );

    this.connections.push(
      new ConnectionGene(
        this.nodes[node1],
        this.nodes[node2],
        Math.random() * 2 - 1,
        connectionInnovationNumber
      )
    );

    this.connectNodes();
  }

  addNode(config: NeatConfig, innovationHistory: InnovationHistory[]): void {
    if (this.connections.length === 0) {
      this.addConnection(config, innovationHistory);
      return;
    }

    let chosenConnection = Math.floor(Math.random() * this.connections.length);
    let tries = 0;

    while (
      this.connections[chosenConnection].input === this.nodes[this.biasNode!] &&
      this.connections.length !== 1 &&
      tries < 3
    ) {
      chosenConnection = Math.floor(Math.random() * this.connections.length);
      tries++;
    }

    if (tries >= 3) {
      this.addConnection(config, innovationHistory);
      return;
    }

    this.connections[chosenConnection].disable();

    const newNodeId = this.nextNodeId;
    this.nextNodeId++;
    this.nodes.push(new NodeGene(newNodeId));

    let currentInnovationNumber = this.getInnovationNumber(
      config,
      innovationHistory,
      this.connections[chosenConnection].input,
      this.getNode(newNodeId)
    );
    this.connections.push(
      new ConnectionGene(
        this.connections[chosenConnection].input,
        this.getNode(newNodeId),
        1,
        currentInnovationNumber
      )
    );

    currentInnovationNumber = this.getInnovationNumber(
      config,
      innovationHistory,
      this.getNode(newNodeId),
      this.connections[chosenConnection].output
    );
    this.connections.push(
      new ConnectionGene(
        this.getNode(newNodeId),
        this.connections[chosenConnection].output,
        this.connections[chosenConnection].weight,
        currentInnovationNumber
      )
    );

    this.getNode(newNodeId).layer =
      this.connections[chosenConnection].input.layer + 1;

    currentInnovationNumber = this.getInnovationNumber(
      config,
      innovationHistory,
      this.nodes[this.biasNode!],
      this.getNode(newNodeId)
    );
    this.connections.push(
      new ConnectionGene(
        this.nodes[this.biasNode!],
        this.getNode(newNodeId),
        0,
        currentInnovationNumber
      )
    );

    if (
      this.getNode(newNodeId).layer ===
      this.connections[chosenConnection].output.layer
    ) {
      for (let i = 0; i < this.nodes.length - 1; i++) {
        if (this.nodes[i].layer >= this.getNode(newNodeId).layer) {
          this.nodes[i].layer++;
        }
      }
      this.layerCount++;
    }

    this.connectNodes();
  }

  crossover(config: NeatConfig, parent: Genome): Genome {
    const child = new Genome(this.inputs, this.outputs, true);
    child.layerCount = this.layerCount;
    child.nextNodeId = this.nextNodeId;
    child.biasNode = this.biasNode;

    const newChildConnections: [ConnectionGene, boolean][] = [];

    for (const node of this.nodes) {
      child.nodes.push(node.clone());
    }

    for (const connection of this.connections) {
      const parentConnection = this.getMatchingConnection(
        parent,
        connection.innovationNumber
      );
      let childEnable = true;

      if (parentConnection !== -1) {
        if (
          !connection.enabled ||
          !parent.connections[parentConnection].enabled
        ) {
          if (
            Math.random() < config.getCrossoverConnectionDisableProbability()
          ) {
            childEnable = false;
          }
        }

        if (Math.random() < 0.5) {
          newChildConnections.push([connection, childEnable]);
        } else {
          newChildConnections.push([
            parent.connections[parentConnection],
            childEnable,
          ]);
        }
      } else {
        newChildConnections.push([connection, connection.enabled]);
      }
    }

    for (const [newConnection, newEnable] of newChildConnections) {
      const childInput = child.getNode(newConnection.input.id);
      const childOutput = child.getNode(newConnection.output.id);
      child.connections.push(newConnection.clone(childInput, childOutput));
      child.connections[child.connections.length - 1].enabled = newEnable;
    }

    child.connectNodes();

    return child;
  }

  fullyConnect(
    config: NeatConfig,
    innovationHistory: InnovationHistory[]
  ): void {
    for (let i = 0; i < this.inputs; i++) {
      for (let j = 0; j < this.outputs; j++) {
        const currInnovationNumber = this.getInnovationNumber(
          config,
          innovationHistory,
          this.nodes[i],
          this.nodes[this.inputs + j]
        );
        this.connections.push(
          new ConnectionGene(
            this.nodes[i],
            this.nodes[this.inputs + j],
            Math.random() * 2 - 1,
            currInnovationNumber
          )
        );
        config.updateNextInnovationNumber();
      }
    }
    this.connectNodes();
  }

  getInnovationNumber(
    config: NeatConfig,
    innovationHistory: InnovationHistory[],
    input: NodeGene,
    output: NodeGene
  ): number {
    let newInnovation = true;
    let currentInnovationNumber = config.getNextInnovationNumber();

    for (const history of innovationHistory) {
      if (history.matches(this, input, output)) {
        newInnovation = false;
        currentInnovationNumber = history.innovationNumber;
        break;
      }
    }

    if (newInnovation) {
      const connectedInnovationNumbers: number[] = [];
      for (const connection of this.connections) {
        connectedInnovationNumbers.push(connection.innovationNumber);
      }

      innovationHistory.push(
        new InnovationHistory(
          input.id,
          output.id,
          currentInnovationNumber,
          connectedInnovationNumbers
        )
      );

      config.updateNextInnovationNumber();
    }

    return currentInnovationNumber;
  }

  notUsefulConnection(node1: number, node2: number): boolean {
    if (this.nodes[node1].layer === this.nodes[node2].layer) {
      return true;
    }
    if (this.nodes[node1].isConnectedTo(this.nodes[node2])) {
      return true;
    }
    return false;
  }

  fullyConnected(): boolean {
    let possibleConnections = 0;
    const nodesPerLayer: { [key: number]: number } = {};

    for (const node of this.nodes) {
      if (!nodesPerLayer[node.layer]) {
        nodesPerLayer[node.layer] = 0;
      }
      nodesPerLayer[node.layer]++;
    }

    for (let i = 0; i < this.layerCount - 1; i++) {
      let nodesInFront = 0;
      for (let j = i + 1; j < this.layerCount; j++) {
        nodesInFront += nodesPerLayer[j] || 0;
      }
      possibleConnections += (nodesPerLayer[i] || 0) * nodesInFront;
    }

    return possibleConnections <= this.connections.length;
  }

  connectNodes(): void {
    for (const node of this.nodes) {
      node.outputConnections = [];
    }

    for (const connection of this.connections) {
      connection.input.outputConnections.push(connection);
    }
  }

  getNode(targetId: number): NodeGene {
    for (const node of this.nodes) {
      if (node.id === targetId) {
        return node;
      }
    }
    throw new Error(`Node with id ${targetId} not found`);
  }

  getMatchingConnection(parent: Genome, innovationNumber: number): number {
    for (let i = 0; i < parent.connections.length; i++) {
      if (parent.connections[i].innovationNumber === innovationNumber) {
        return i;
      }
    }
    return -1;
  }

  generateNetwork(): void {
    this.connectNodes();
    this.network = [];
    for (let layer = 0; layer < this.layerCount; layer++) {
      for (const node of this.nodes) {
        if (node.layer === layer) {
          this.network.push(node);
        }
      }
    }
  }

  feedForward(inputValues: number[]): number[] {
    for (let i = 0; i < this.inputs; i++) {
      this.nodes[i].outputValue = inputValues[i];
    }
    this.nodes[this.biasNode!].outputValue = 1;

    for (const node of this.network) {
      node.engage();
    }

    const outputs: number[] = [];

    for (let i = 0; i < this.outputs; i++) {
      outputs.push(this.nodes[this.inputs + i].outputValue);
    }

    for (const node of this.nodes) {
      node.inputSum = 0;
    }

    return outputs;
  }

  clone(): Genome {
    const clone = new Genome(this.inputs, this.outputs, true);

    for (const node of this.nodes) {
      clone.nodes.push(node.clone());
    }

    for (const connection of this.connections) {
      clone.connections.push(
        connection.clone(
          clone.getNode(connection.input.id),
          clone.getNode(connection.output.id)
        )
      );
    }

    clone.layerCount = this.layerCount;
    clone.nextNodeId = this.nextNodeId;
    clone.biasNode = this.biasNode;
    clone.connectNodes();

    return clone;
  }
}
