import { connections } from 'model/usaMap';
import { Edge, Graph } from './alg/floydwarshall';

const usaConnections = connections;

export class GameNetwork {
  cityIndex: Map<string, number> = new Map();
  indexToCity: Map<number, string> = new Map();
  graph: Graph | undefined;

  parseConnections(): void {
    const connections: Map<string, Map<string, number>> = new Map();
    const edges: Edge[] = [];
    let numNodes = 0;
    usaConnections.forEach((d) => {
      if (!connections.has(d.from.name)) {
        connections.set(d.from.name, new Map());
        this.cityIndex.set(d.from.name, numNodes);
        this.indexToCity.set(numNodes, d.from.name);
        numNodes++;
      }
      const fromMap = connections.get(d.from.name);
      fromMap?.set(d.to.name, d.length);

      if (!connections.has(d.to.name)) {
        connections.set(d.to.name, new Map());
        this.cityIndex.set(d.to.name, numNodes);
        this.indexToCity.set(numNodes, d.to.name);
        numNodes++;
      }
      const toMap = connections.get(d.to.name);
      toMap?.set(d.from.name, d.length);

      edges.push({
        from: this.cityIndex.get(d.from.name) || 0,
        to: this.cityIndex.get(d.to.name) || 0,
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
