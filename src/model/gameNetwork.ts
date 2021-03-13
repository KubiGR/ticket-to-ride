import data from '../data/usaConnections.json';
import { Edge, Graph } from './alg/floydwarshall';

export class GameNetwork {
  connections: Map<string, Map<string, number>> = new Map();

  cityIndex: Map<string, number> = new Map();
  indexToCity: Map<number, string> = new Map();
  distance: number[][] = [];
  graph: Graph | undefined;

  getDataFromJSON(): void {
    const edges: Edge[] = [];
    let numNodes = 0;
    data.forEach((d) => {
      if (!this.connections.has(d.from)) {
        this.connections.set(d.from, new Map());
        this.cityIndex.set(d.from, numNodes);
        this.indexToCity.set(numNodes, d.from);
        numNodes++;
      }
      const fromMap = this.connections.get(d.from);
      fromMap?.set(d.to, d.length);

      if (!this.connections.has(d.to)) {
        this.connections.set(d.to, new Map());
        this.cityIndex.set(d.to, numNodes);
        this.indexToCity.set(numNodes, d.to);
        numNodes++;
      }
      const toMap = this.connections.get(d.to);
      toMap?.set(d.from, d.length);

      edges.push({
        from: this.cityIndex.get(d.from) || 0,
        to: this.cityIndex.get(d.to) || 0,
        distance: d.length,
      });
    });
    this.graph = new Graph(numNodes, edges);

    this.graph.floydWarshall();
  }

  getShortestPath(from: string, to: string): string[] {
    if (this.graph && this.cityIndex.has(from) && this.cityIndex.has(to)) {
      const path = this.graph.path(
        this.cityIndex.get(from) || -1,
        this.cityIndex.get(to) || -1,
      );
      return path.map((p) => this.indexToCity.get(p) || '');
    } else {
      return [];
    }
  }
}
