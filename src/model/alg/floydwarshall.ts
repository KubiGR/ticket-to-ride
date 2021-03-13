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
}
