import { DisjointSet } from './disjointSet';

export interface Edge {
  from: number;
  to: number;
  distance: number;
}

export class Graph {
  numNodes: number;
  edges: Edge[];

  constructor(numNodes: number, edges: Edge[]) {
    this.numNodes = numNodes;
    this.edges = edges;
  }

  /**
   * https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
   *
   * @returns
   */
  kruskal(): Edge[] {
    this.edges.sort(function (a, b) {
      return a.distance - b.distance;
    });
    const f: Edge[] = [];
    const ds = new DisjointSet(this.numNodes);

    this.edges.forEach((edge) => {
      const findFrom = ds.find(edge.from);
      const findTo = ds.find(edge.to);
      if (findFrom != findTo) {
        f.push(edge);
        ds.union(findFrom, findTo);
      }
    });

    return f;
  }
}
