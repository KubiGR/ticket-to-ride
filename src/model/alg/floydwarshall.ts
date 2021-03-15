import { permutator } from './permute';
import { Edge } from './edge';
import { kruskal } from './kruskal';
import { Graph } from './graph';

/**
 * https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
export class FloydWarshall {
  graph: Graph<number>;

  distance: number[][] = [];
  next: number[][] = [];

  constructor(numNodes: number, edges: Edge<number>[]) {
    this.graph = new Graph(numNodes, edges);
    for (let i = 0; i < this.graph.numNodes; i++) {
      this.distance.push([]);
      this.next.push([]);
      for (let j = 0; j < this.graph.numNodes; j++) {
        if (i == j) {
          this.distance[i].push(0);
          this.next[i].push(i);
        } else {
          this.distance[i].push(Infinity);
          this.next[i].push(Infinity); // null
        }
      }
    }
    this.graph.edges.forEach((e) => {
      this.distance[e.from][e.to] = e.distance;
      this.next[e.from][e.to] = e.to;
      // symmetrical
      this.distance[e.to][e.from] = e.distance;
      this.next[e.to][e.from] = e.from;
    });
  }

  floydWarshall(): void {
    for (let k = 0; k < this.graph.numNodes; k++) {
      for (let i = 0; i < this.graph.numNodes; i++) {
        for (let j = 0; j < this.graph.numNodes; j++) {
          if (this.distance[i][j] > this.distance[i][k] + this.distance[k][j]) {
            this.distance[i][j] = this.distance[i][k] + this.distance[k][j];
            this.next[i][j] = this.next[i][k];
          }
        }
      }
    }
  }

  shortestPath(u: number, v: number): number[] {
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

  pathArray(nodeArray: number[]): number[] {
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

  /**
   * Returns edges of the minimum spanning tree connecting shortest paths.
   * Shortest paths between nodes are found using the Floyd-Warshall algorithm.
   * Kruskal's algorighm is used for the minimum spanning tree using the distances calculated by Floyd-Warshall.
   *
   * @param nodeArray
   * @returns
   */
  spanningTreeOfShortestPaths(nodeArray: number[]): Edge<number>[] {
    const kruskalEdges: Edge<number>[] = [];
    for (let i = 0; i < nodeArray.length; i++) {
      for (let j = i + 1; j < nodeArray.length; j++) {
        kruskalEdges.push({
          from: nodeArray[i],
          to: nodeArray[j],
          distance: this.distance[nodeArray[i]][nodeArray[j]],
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
          distance: this.distance[shortestPath[i]][shortestPath[i + 1]],
        });
      }
    });

    return connections;
  }
}
