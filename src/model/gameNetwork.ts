import { usaMap } from 'model/usaMap';
import { FloydWarshall, Edge } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst';
import { Connection } from './connection';
import { Constants } from './constants';
import { Ticket } from './ticket';
import { getUSATicketsFromJSON } from './usaTickets';
import { TicketReport } from './ticketReport';

export class GameNetwork {
  private graph!: FloydWarshall<string>;
  private cannotPass: Set<Connection> = new Set();
  private established: Set<Connection> = new Set();
  private mapEdges!: Connection[];
  private tickets!: Ticket[];
  private ticketReports: TicketReport[] = [];

  private availableTrains = Constants.TOTAL_TRAINS;
  private establishedPoints = 0;

  private opponentNetwork: GameNetwork | undefined;
  private name = 'Player';

  constructor() {
    this.parseConnections();
  }

  createOpponent(): void {
    this.opponentNetwork = new GameNetwork();
    this.opponentNetwork.name = 'Opponent';
  }

  private parseConnections(): void {
    this.mapEdges = usaMap.getConnections();
    this.graph = new FloydWarshall(this.mapEdges, false);
  }

  getConnection(from: string, to: string): Connection {
    for (let i = 0; i < this.mapEdges.length; i++) {
      const connection = this.mapEdges[i];
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
    this.availableTrains -= edge.weight;
    this.establishedPoints += edge.getPoints();

    this.opponentNetwork?.addCannotPass(edge);

    this.generateTicketReports();
    this.consoleReports();
  }

  consoleReports(): void {
    console.log('====== ' + this.name + ' TICKET REPORT =====');
    this.ticketReports
      .filter(TicketReport.filterFn)
      .sort(TicketReport.compare)
      .forEach((t) => {
        const percentage = t.completionPercentage();
        if (t.remainingConnections < 2 || percentage > 0.5) {
          console.log(
            t.ticket.toString() +
              ': ' +
              (percentage * 100).toFixed(0) +
              '% needs ' +
              t.remainingTrains +
              ' train(s) in ' +
              t.remainingConnections +
              ' connection(s).',
          );
        }
      });
  }

  generateTicketReports(): void {
    this.ticketReports = [];
    const connections = Array.from(this.established);
    getUSATicketsFromJSON().forEach((t) => {
      const ticketConns = this.getOptConnectionsOfMinSpanningTreeOfShortestRoutes(
        Ticket.getCities([t]),
      );
      let completed = 0;
      ticketConns.forEach((c) => {
        if (connections.includes(c)) {
          completed++;
        }
      });
      const requiredTrains = this.getRequiredNumOfTrains(ticketConns);

      const ticketReport = new TicketReport(
        t,
        ticketConns.length - completed,
        requiredTrains,
        completed,
        ticketConns.length,
      );

      this.ticketReports.push(ticketReport);
    });
  }

  removeEstablished(edge: Connection): void {
    if (!this.established.has(edge))
      throw new Error(
        'removeEstablished: ' +
          edge +
          ' is in not in the ' +
          ' established list',
      );
    this.established.delete(edge);
    this.processEdgeRestrictions();
    this.availableTrains += edge.weight;
    this.establishedPoints -= edge.getPoints();

    this.opponentNetwork?.removeCannotPass(edge);

    this.generateTicketReports();
    this.consoleReports();
  }

  addCannotPass(edge: Connection): void {
    if (this.established.has(edge))
      throw new Error(
        'addCannotPass: ' + edge + ' is in ' + ' established list',
      );
    this.cannotPass.add(edge);
    this.processEdgeRestrictions();

    this.opponentNetwork?.addEstablished(edge);
  }

  removeCannotPass(edge: Connection): void {
    if (!this.cannotPass.has(edge))
      throw new Error(
        'removeCannotPass: ' + edge + ' is not in ' + ' cannotPass list',
      );
    this.cannotPass.delete(edge);
    this.processEdgeRestrictions();

    this.opponentNetwork?.removeEstablished(edge);
  }

  processEdgeRestrictions(): void {
    const restrictedEdges = this.mapEdges.slice();

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

  findCitiesToInclude(cities: string[]): string[] {
    let bestConnections = this.getConnectionsOfMinSpanningTreeOfShortestRoutes(
      cities,
    );
    let bestDistance = this.getRequiredNumOfTrains(bestConnections);
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
      const tempDistance = this.getRequiredNumOfTrains(tempConnections);
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

  getAvailableTrains(): number {
    return this.availableTrains;
  }

  getPoints(): number {
    return this.establishedPoints;
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
