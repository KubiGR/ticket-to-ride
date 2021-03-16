import { permutator } from './permute';
import { kruskal, Edge } from 'kruskal-mst';

/**
 * https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
export class FloydWarshall<T> {
  private directed: boolean;
  private numNodes = 0;

  private distance: number[][] = [];
  private next: number[][] = [];

  private nodeIndex: Map<T, number> = new Map();
  private node: Map<number, T> = new Map();

  constructor(edges: Edge<T>[], directed = false) {
    this.directed = directed;
    const connections: Map<T, Map<T, number>> = new Map();
    const numericalEdges: Edge<number>[] = [];
    edges.forEach((d) => {
      if (!connections.has(d.from)) {
        connections.set(d.from, new Map());
        this.nodeIndex.set(d.from, this.numNodes);
        this.node.set(this.numNodes, d.from);
        this.numNodes++;
      }
      const fromMap = connections.get(d.from);
      fromMap?.set(d.to, d.weight);

      if (!connections.has(d.to)) {
        connections.set(d.to, new Map());
        this.nodeIndex.set(d.to, this.numNodes);
        this.node.set(this.numNodes, d.to);
        this.numNodes++;
      }
      const toMap = connections.get(d.to);
      toMap?.set(d.from, d.weight);

      numericalEdges.push({
        from: this.nodeIndex.get(d.from) || 0,
        to: this.nodeIndex.get(d.to) || 0,
        weight: d.weight,
      });
    });

    this.initDistanceMatrix(numericalEdges);
  }

  private initDistanceMatrix(edges: Edge<number>[]): void {
    for (let i = 0; i < this.numNodes; i++) {
      this.distance.push([]);
      this.next.push([]);
      for (let j = 0; j < this.numNodes; j++) {
        if (i == j) {
          this.distance[i].push(0);
          this.next[i].push(i);
        } else {
          this.distance[i].push(Infinity);
          this.next[i].push(Infinity); // null
        }
      }
    }
    edges.forEach((e) => {
      this.distance[e.from][e.to] = e.weight;
      this.next[e.from][e.to] = e.to;

      if (!this.directed) {
        this.distance[e.to][e.from] = e.weight;
        this.next[e.to][e.from] = e.from;
      }
    });
  }

  floydWarshall(): void {
    for (let k = 0; k < this.numNodes; k++) {
      for (let i = 0; i < this.numNodes; i++) {
        for (let j = 0; j < this.numNodes; j++) {
          if (this.distance[i][j] > this.distance[i][k] + this.distance[k][j]) {
            this.distance[i][j] = this.distance[i][k] + this.distance[k][j];
            this.next[i][j] = this.next[i][k];
          }
        }
      }
    }
  }

  private shortestPath(u: number, v: number): number[] {
    if (this.next[u][v] == Infinity) {
      return [];
    }
    const path: number[] = [u];
    while (u != v) {
      u = this.next[u][v];
      path.push(u);
    }
    return path;
  }

  getShortestPath(from: T, to: T): T[] {
    const fromNode = this.nodeIndex.get(from);
    const toNode = this.nodeIndex.get(to);
    if (fromNode !== undefined && toNode !== undefined) {
      const path = this.shortestPath(fromNode, toNode);
      const nodes: T[] = [];
      path.forEach((p) => {
        const node = this.node.get(p);
        if (node !== undefined) nodes.push(node);
      });
      return nodes;
    } else {
      return [];
    }
  }

  private shortestVisitingPath(nodeArray: number[]): number[] {
    const permutations = permutator(nodeArray);
    let bestPermutation: number[] = [];
    let bestDistance = Infinity;
    permutations.forEach((permutation) => {
      let permutationDistance = 0;
      for (let i = 0; i < permutation.length - 1; i++) {
        permutationDistance += this.distance[permutation[i]][
          permutation[i + 1]
        ];
      }
      if (permutationDistance < bestDistance) {
        bestDistance = permutationDistance;
        bestPermutation = permutation;
      }
    });
    let path: number[] = [];
    if (bestPermutation.length > 0) {
      path.push(bestPermutation[0]);
    }
    for (let i = 0; i < bestPermutation.length - 1; i++) {
      path = path.concat(
        this.shortestPath(bestPermutation[i], bestPermutation[i + 1]).slice(1),
      );
    }

    return path;
  }

  getShortestVisitingPath(visiting: T[]): T[] {
    const numberArray = visiting.map((c) => {
      const num = this.nodeIndex.get(c);
      if (num !== undefined) return num;
      return -1;
    });
    if (numberArray.includes(-1)) {
      throw new Error('Unknown city');
    }
    const path = this.shortestVisitingPath(numberArray);
    const nodes: T[] = [];
    path.forEach((p) => {
      const node = this.node.get(p);
      if (node !== undefined) nodes.push(node);
    });
    return nodes;
  }

  private spanningTreeOfShortestPaths(nodeArray: number[]): Edge<number>[] {
    if (this.directed) {
      throw new Error(
        'Spanning tree can be generated only for undirected graphs!',
      );
    }
    const kruskalEdges: Edge<number>[] = [];
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        kruskalEdges.push({
          from: nodeArray[i],
          to: nodeArray[j],
          weight: this.distance[nodeArray[i]][nodeArray[j]],
        });
      }
    }
    const connections: Edge<number>[] = [];
    kruskal(kruskalEdges).forEach((solutionEdge) => {
      const shortestPath = this.shortestPath(
        solutionEdge.from,
        solutionEdge.to,
      );
      for (let i = 0; i < shortestPath.length - 1; i++) {
        connections.push({
          from: shortestPath[i],
          to: shortestPath[i + 1],
          weight: this.distance[shortestPath[i]][shortestPath[i + 1]],
        });
      }
    });

    return connections;
  }

  /**
   * Returns edges of the minimum spanning tree connecting shortest paths.
   * Shortest paths between nodes are found using the Floyd-Warshall algorithm.
   * Kruskal's algorighm is used for the minimum spanning tree using the distances calculated by Floyd-Warshall.
   *
   * @param visiting
   * @returns
   */
  getMinSpanningTreeOfShortestRoutes(visiting: T[]): Edge<T>[] {
    const numberArray = visiting.map((c) => {
      const num = this.nodeIndex.get(c);
      if (num !== undefined) return num;
      return -1;
    });
    if (numberArray.includes(-1)) {
      throw new Error('Unknown city');
    }
    const connections = this.spanningTreeOfShortestPaths(numberArray);
    const edges: Edge<T>[] = [];
    connections.forEach((p) => {
      const from = this.node.get(p.from);
      const to = this.node.get(p.to);
      if (from !== undefined && to !== undefined) {
        edges.push({
          from: from,
          to: to,
          weight: p.weight,
        });
      }
    });
    return edges;
  }
}
