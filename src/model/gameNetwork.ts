import { usaMap } from 'model/usaMap';
import { FloydWarshall, Edge } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst';
import { Connection } from './connection';
import { Constants } from './constants';
import { Ticket } from './ticket';
import { getUSATicketsFromJSON } from './usaTickets';
import { TicketReport } from './ticketReport';
import { Router } from './router';

export class GameNetwork {
  private router: Router = new Router();
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
    this.router.setEdges(usaMap.getConnections());
  }

  getConnection(from: string, to: string): Connection {
    return this.router.getConnection(from, to);
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
    const restrictedEdges = this.router.getEdges().slice();

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
    this.router.regenerateGraph(restrictedEdges);
  }

  getShortestPath(from: string, to: string): string[] {
    return this.router.getShortestPath(from, to);
  }

  getShortestVisitingPath(cities: string[]): string[] {
    return this.router.getShortestVisitingPath(cities);
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
    return this.router.getConnectionsOfMinSpanningTreeOfShortestRoutes(cities);
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
      this.router.getEdges().forEach((conn) => {
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
