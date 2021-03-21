import { Edge, FloydWarshall } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst/dist';
import { Connection } from './connection';
import { Ticket } from './ticket';

export class Router {
  private graph!: FloydWarshall<string>;
  private mapEdges: Connection[] = [];
  private established!: Set<Connection>;
  private pointImportance = 0.0;

  /**
   * The established set is maintained by gameNetwork and passed here
   * as a reference for some methods that need it.
   *
   * @param established
   */
  setEstablished(established: Set<Connection>): void {
    this.established = established;
  }

  setEdges(mapEdges: Connection[]): void {
    this.mapEdges = mapEdges;
    this.graph = new FloydWarshall(mapEdges, false);
  }

  /**
   * How important are points in finding the minimum distance.
   *
   * Default 0.0: points are not considered at all in finding the min
   * Weigths increase as distances increase till 0.19
   * After that longer routes are considered better than shorter routes.
   * Max (capped) 0.39: keep all the routes still in positive numbers
   * Any value beyond this make longer routes having negative distance.
   *
   * @param parameter
   */
  setPointImportance(parameter: number): void {
    if (parameter > 0.39) parameter = 0.39;
    this.pointImportance = parameter;
    this.mapEdges.forEach((e) => {
      e.weight = e.trains - this.pointImportance * e.getPoints();
    });
    this.graph = new FloydWarshall(this.mapEdges, false);
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

  processEdgeRestrictions(
    cannotPass: Set<Connection>,
    established: Set<Connection>,
  ): void {
    const restrictedEdges = this.mapEdges.slice();

    cannotPass.forEach((cannotPassEdge) => {
      const index = restrictedEdges.indexOf(cannotPassEdge);
      restrictedEdges.splice(index, 1);
      const clone = cannotPassEdge.clone();
      clone.weight = Infinity;
      restrictedEdges.push(clone);
    });

    established.forEach((shouldPassEdge) => {
      const index = restrictedEdges.indexOf(shouldPassEdge);
      restrictedEdges.splice(index, 1);
      const clone = shouldPassEdge.clone();
      clone.weight = 0;
      restrictedEdges.push(clone);
    });

    this.graph = new FloydWarshall(restrictedEdges, false);
  }

  getOptConnectionsOfMinSpanningTreeOfShortestRoutes(
    cities: string[],
  ): Connection[] {
    let newcities = this.findCitiesToInclude(cities);
    while (newcities.length > cities.length) {
      cities = newcities;
      newcities = this.findCitiesToInclude(cities);
    }

    return this.getConnectionsOfMinSpanningTreeOfShortestRoutes(cities);
  }

  private findCitiesToInclude(cities: string[]): string[] {
    let bestConnections = this.getConnectionsOfMinSpanningTreeOfShortestRoutes(
      cities,
    );
    let bestDistance = this.getRequiredWeight(bestConnections);
    let bestPoints = this.getGainPoints([], bestConnections);
    let bestCities = cities.slice();

    const passing: Set<string> = new Set();
    bestConnections.forEach((c) => {
      passing.add(c.from);
      passing.add(c.to);
    });

    const neighbors: Set<string> = new Set();
    passing.forEach((city) => {
      neighbors.add(city);
      this.mapEdges.forEach((conn) => {
        if (conn.contains(city)) {
          neighbors.add(conn.from);
          neighbors.add(conn.to);
        }
      });
    });

    neighbors.forEach((city) => {
      const tempCities = cities.slice();
      tempCities.push(city);
      const tempConnections = this.getConnectionsOfMinSpanningTreeOfShortestRoutes(
        tempCities,
      );
      const tempDistance = this.getRequiredWeight(tempConnections);
      const tempPoints = this.getGainPoints([], tempConnections);

      if (
        tempDistance > 0 &&
        (tempDistance < bestDistance ||
          (tempDistance == bestDistance && tempPoints > bestPoints))
      ) {
        bestDistance = tempDistance;
        bestConnections = tempConnections;
        bestPoints = tempPoints;
        bestCities = tempCities;
      }
    });

    return bestCities;
  }

  getRequiredWeight(connections: Connection[]): number {
    return Connection.getWeight(
      connections.filter((c) => !this.established.has(c)),
    );
  }

  getRequiredNumOfTrains(connections: Connection[]): number {
    return Connection.getTrains(
      connections.filter((c) => !this.established.has(c)),
    );
  }

  getGainPoints(tickets: Ticket[], connections: Connection[]): number {
    const ticketPoints = Ticket.getPoints(tickets);
    const linePoints = connections
      .filter((c) => !this.established.has(c))
      .map((c) => c.getPoints())
      .reduce((sum, x) => sum + x, 0);
    return ticketPoints + linePoints;
  }
}
