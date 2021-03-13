export class DisjointSet {
  parent: number[] = [];

  constructor(numNodes: number) {
    for (let i = 0; i < numNodes; i++) this.parent.push(i);
  }

  find(x: number): number {
    if (this.parent[x] != x) {
      this.parent[x] = this.find(this.parent[x]);
      return this.parent[x];
    } else {
      return x;
    }
  }

  union(x: number, y: number): void {
    x = this.find(x);
    y = this.find(y);

    if (x == y) return;

    this.parent[y] = x;
  }
}
