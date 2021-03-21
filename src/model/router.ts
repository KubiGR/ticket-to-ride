import { Edge, FloydWarshall } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst/dist';
import { Connection } from './connection';

export class Router {
  private graph!: FloydWarshall<string>;
  private mapEdges!: Connection[];

  setEdges(mapEdges: Connection[]): void {
    this.mapEdges = mapEdges;
    this.graph = new FloydWarshall(mapEdges, false);
  }

  regenerateGraph(restrictedEdges: Connection[]): void {
    this.graph = new FloydWarshall(restrictedEdges, false);
  }

  getEdges(): Connection[] {
    return this.mapEdges;
  }

  setGraph(graph: FloydWarshall<string>): void {
    this.graph = graph;
  }

  getGraph(): FloydWarshall<string> {
    return this.graph;
  }

  getShortestPath(from: string, to: string): string[] {
    return this.graph.getShortestPath(from, to);
  }

  getShortestVisitingPath(cities: string[]): string[] {
    return this.graph.getShortestVisitingPath(cities);
  }

  getConnection(from: string, to: string): Connection {
    for (let i = 0; i < this.mapEdges.length; i++) {
      const connection = this.mapEdges[i];
      if (from != to && connection.contains(from) && connection.contains(to))
        return connection;
    }
    throw new Error('Connection not found: ' + from + ', ' + to);
  }

  getConnectionsForPath(path: string[]): Connection[] {
    const connections: Set<Connection> = new Set();
    for (let i = 0; i < path.length - 1; i++) {
      const connection = this.getConnection(path[i], path[i + 1]);
      connections.add(connection);
    }
    return Array.from(connections);
  }

  getConnectionsOfMinSpanningTreeOfShortestRoutes(
    cities: string[],
  ): Connection[] {
    const graph = this.graph; // for editor!!

    const kruskalEdges: Edge<string>[] = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const distance = graph.getShortestDistance(cities[i], cities[j]);
        if (distance === Infinity) return [];
        kruskalEdges.push({
          from: cities[i],
          to: cities[j],
          weight: distance,
        });
      }
    }
    const connections: Set<Connection> = new Set();
    kruskal(kruskalEdges).forEach((solutionEdge) => {
      this.getConnectionsForPath(
        graph.getShortestPath(solutionEdge.from, solutionEdge.to),
      ).forEach((c) => {
        connections.add(c);
      });
    });

    return Array.from(connections);
  }
}
