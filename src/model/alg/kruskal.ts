import { DisjointSet } from './disjointSet';
import { Edge } from './edge';
import { Graph } from './graph';

export class Kruskal {
  graph: Graph<number>;

  constructor(numNodes: number, edges: Edge<number>[]) {
    this.graph = new Graph(numNodes, edges);
  }

  /**
   * https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
   *
   * @returns
   */
  kruskal(): Edge<number>[] {
    this.graph.edges.sort(function (a, b) {
      return a.distance - b.distance;
    });
    const f: Edge<number>[] = [];
    const ds = new DisjointSet(this.graph.numNodes);

    this.graph.edges.forEach((edge) => {
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
