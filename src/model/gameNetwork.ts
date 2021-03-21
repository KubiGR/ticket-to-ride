import { usaMap } from 'model/usaMap';
import { Connection } from './connection';
import { Constants } from './constants';
import { Ticket } from './ticket';
import { getUSATicketsFromJSON } from './usaTickets';
import { TicketReport } from './ticketReport';
import { Router } from './router';

export class GameNetwork {
  private router: Router = new Router();
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
    this.router.setEstablished(this.established);
    this.parseConnections();
  }

  createOpponent(): void {
    this.opponentNetwork = new GameNetwork();
    this.opponentNetwork.name = 'Opponent';
  }

  private parseConnections(): void {
    this.router.setEdges(usaMap.getConnections());
  }

  addEstablished(edge: Connection): void {
    if (this.cannotPass.has(edge))
      throw new Error(
        'addEstablished: ' + edge + ' is in ' + ' cannot pass list',
      );
    this.established.add(edge);
    this.router.processEdgeRestrictions(this.cannotPass, this.established);
    this.availableTrains -= edge.trains;
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
      const ticketConns = this.router.getOptConnectionsOfMinSpanningTreeOfShortestRoutes(
        Ticket.getCities([t]),
      );
      let completed = 0;
      ticketConns.forEach((c) => {
        if (connections.includes(c)) {
          completed++;
        }
      });
      const requiredTrains = this.router.getRequiredNumOfTrains(ticketConns);

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
    this.router.processEdgeRestrictions(this.cannotPass, this.established);
    this.availableTrains += edge.trains;
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
    this.router.processEdgeRestrictions(this.cannotPass, this.established);

    this.opponentNetwork?.addEstablished(edge);
  }

  removeCannotPass(edge: Connection): void {
    if (!this.cannotPass.has(edge))
      throw new Error(
        'removeCannotPass: ' + edge + ' is not in ' + ' cannotPass list',
      );
    this.cannotPass.delete(edge);
    this.router.processEdgeRestrictions(this.cannotPass, this.established);

    this.opponentNetwork?.removeEstablished(edge);
  }

  getAvailableTrains(): number {
    return this.availableTrains;
  }

  getPoints(): number {
    return this.establishedPoints;
  }

  getRouter(): Router {
    return this.router;
  }
}
