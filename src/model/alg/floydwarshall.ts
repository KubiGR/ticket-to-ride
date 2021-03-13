import { permutator } from './permute';

export interface Edge {
  from: number;
  to: number;
  distance: number;
}

export class Graph {
  numNodes: number;
  edges: Edge[];
  distance: number[][] = [];
  next: number[][] = [];

  constructor(numNodes: number, edges: Edge[]) {
    this.numNodes = numNodes;
    this.edges = edges;
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
    this.edges.forEach((e) => {
      this.distance[e.from][e.to] = e.distance;
      this.next[e.from][e.to] = e.to;
      // symmetrical
      this.distance[e.to][e.from] = e.distance;
      this.next[e.to][e.from] = e.from;
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

  path(u: number, v: number): number[] {
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
        this.path(bestPermutation[i], bestPermutation[i + 1]).slice(1),
      );
    }

    return path;
  }
}
