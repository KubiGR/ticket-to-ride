import { getUSAConnectionsFromJSON } from 'model/usaMap';
import { Edge } from './alg/edge';
import { FloydWarshall } from './alg/floydwarshall';

export class GameNetwork {
  cityIndex: Map<string, number> = new Map();
  indexToCity: Map<number, string> = new Map();
  graph: FloydWarshall | undefined;

  parseConnections(): void {
    const usaConnections = getUSAConnectionsFromJSON();

    const connections: Map<string, Map<string, number>> = new Map();
    const edges: Edge<number>[] = [];
    let numNodes = 0;
    usaConnections.forEach((d) => {
      if (!connections.has(d.from.name)) {
        connections.set(d.from.name, new Map());
        this.cityIndex.set(d.from.name, numNodes);
        this.indexToCity.set(numNodes, d.from.name);
        numNodes++;
      }
      const fromMap = connections.get(d.from.name);
      fromMap?.set(d.to.name, d.distance);

      if (!connections.has(d.to.name)) {
        connections.set(d.to.name, new Map());
        this.cityIndex.set(d.to.name, numNodes);
        this.indexToCity.set(numNodes, d.to.name);
        numNodes++;
      }
      const toMap = connections.get(d.to.name);
      toMap?.set(d.from.name, d.distance);

      edges.push({
        from: this.cityIndex.get(d.from.name) || 0,
        to: this.cityIndex.get(d.to.name) || 0,
        distance: d.distance,
      });
    });
    this.graph = new FloydWarshall(numNodes, edges);

    this.graph.floydWarshall();
  }

  getShortestPath(from: string, to: string): string[] {
    if (this.graph && this.cityIndex.has(from) && this.cityIndex.has(to)) {
      const path = this.graph.shortestPath(
        this.cityIndex.get(from) || -1,
        this.cityIndex.get(to) || -1,
      );
      return path.map((p) => this.indexToCity.get(p) || '');
    } else {
      return [];
    }
  }

  getShortestPathArray(cities: string[]): string[] {
    if (this.graph) {
      const numberArray = cities.map((c) => this.cityIndex.get(c) || -1);
      if (numberArray.includes(-1)) {
        throw new Error('Unknown city');
      }
      const path = this.graph.pathArray(numberArray);
      return path.map((p) => this.indexToCity.get(p) || '');
    } else {
      return [];
    }
  }

  getMinSpanningTreeOfShortestRoutes(cities: string[]): Edge<string>[] {
    if (this.graph) {
      const numberArray = cities.map((c) => this.cityIndex.get(c) || -1);
      if (numberArray.includes(-1)) {
        throw new Error('Unknown city');
      }
      const connections = this.graph.spanningTreeOfShortestPaths(numberArray);
      return connections.map((p) => {
        return {
          from: this.indexToCity.get(p.from) || '',
          to: this.indexToCity.get(p.to) || '',
          distance: p.distance,
        };
      });
    } else {
      return [];
    }
  }
}
