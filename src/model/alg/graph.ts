import { Edge } from './edge';

export class Graph {
  numNodes: number;
  edges: Edge[];

  constructor(numNodes: number, edges: Edge[]) {
    this.numNodes = numNodes;
    this.edges = edges;
  }
}
