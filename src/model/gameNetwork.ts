import { getUSAConnectionsFromJSON } from 'model/usaMap';
import { FloydWarshall, Edge } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst';
import { Connection } from './connection';

export class GameNetwork {
  graph!: FloydWarshall<string>;
  cannotPass: Set<Connection> = new Set();
  established: Set<Connection> = new Set();
  usaEdges!: Connection[];

  constructor() {
    this.parseConnections();
  }

  private parseConnections(): void {
    this.usaEdges = getUSAConnectionsFromJSON();
    this.graph = new FloydWarshall(this.usaEdges, false);
  }

  getConnection(from: string, to: string): Connection {
    for (let i = 0; i < this.usaEdges.length; i++) {
      const connection = this.usaEdges[i];
      if (from != to && connection.contains(from) && connection.contains(to))
        return connection;
    }
    throw new Error('Connection not found: ' + from + ', ' + to);
  }

  addEstablished(edge: Connection): void {
    if (this.cannotPass.has(edge))
      throw new Error(
        'addEstablished: ' + edge + ' is in ' + ' cannot pass list',
      );
    this.established.add(edge);
    this.processEdgeRestrictions();
  }

  addCannotPass(edge: Connection): void {
    if (this.established.has(edge))
      throw new Error(
        'addCannotPass: ' + edge + ' is in ' + ' established list',
      );
    this.cannotPass.add(edge);
    this.processEdgeRestrictions();
  }

  processEdgeRestrictions(): void {
    const restrictedEdges = this.usaEdges.slice();

    this.cannotPass.forEach((cannotPassEdge) => {
      const index = restrictedEdges.indexOf(cannotPassEdge);
      restrictedEdges.splice(index, 1);
      const clone = cannotPassEdge.clone();
      clone.weight = Infinity;
      restrictedEdges.push(clone);
    });

    this.established.forEach((shouldPassEdge) => {
      const index = restrictedEdges.indexOf(shouldPassEdge);
      restrictedEdges.splice(index, 1);
      const clone = shouldPassEdge.clone();
      clone.weight = 0;
      restrictedEdges.push(clone);
    });
    this.graph = new FloydWarshall(restrictedEdges, false);
  }

  getShortestPath(from: string, to: string): string[] {
    return this.graph.getShortestPath(from, to);
  }

  getShortestVisitingPath(cities: string[]): string[] {
    return this.graph.getShortestVisitingPath(cities);
  }

  getConnectionsForPath(path: string[]): Connection[] {
    const connections: Connection[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      connections.push(this.getConnection(path[i], path[i + 1]));
    }
    return connections;
  }

  getMinSpanningTreeOfShortestRoutes(cities: string[]): Edge<string>[] {
    const graph = this.graph; // for editor!!

    const kruskalEdges: Edge<string>[] = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        kruskalEdges.push({
          from: cities[i],
          to: cities[j],
          weight: graph.getShortestDistance(cities[i], cities[j]),
        });
      }
    }
    const connections: Edge<string>[] = [];
    kruskal(kruskalEdges).forEach((solutionEdge) => {
      const shortestPath = graph.getShortestPath(
        solutionEdge.from,
        solutionEdge.to,
      );
      for (let i = 0; i < shortestPath.length - 1; i++) {
        connections.push({
          from: shortestPath[i],
          to: shortestPath[i + 1],
          weight: graph.getShortestDistance(
            shortestPath[i],
            shortestPath[i + 1],
          ),
        });
      }
    });

    return connections;
  }
}
