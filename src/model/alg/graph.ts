import { Edge } from './edge';

export class Graph<T> {
  numNodes: number;
  edges: Edge<T>[];

  constructor(numNodes: number, edges: Edge<T>[]) {
    this.numNodes = numNodes;
    this.edges = edges;
  }
}
