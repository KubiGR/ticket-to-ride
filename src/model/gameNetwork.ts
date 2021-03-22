import { usaMap } from 'model/usaMap';
import { Connection } from './connection';
import { Constants } from './constants';
import { Ticket } from './ticket';
import { TicketReport } from './ticketReport';
import { Routing } from './routing';

export class GameNetwork {
  private router: Routing = new Routing();
  private cannotPass: Set<Connection> = new Set();
  private established: Set<Connection> = new Set();
  private ticketReports: TicketReport[] = [];

  private availableTrains = Constants.TOTAL_TRAINS;
  private establishedPoints = 0;

  private opponentNetwork: GameNetwork | undefined;
  private name = 'Player';

  constructor() {
    this.router.setEstablished(this.established);
    this.router.setCannotPass(this.cannotPass);
    this.parseConnections();
  }

  createOpponent(): void {
    this.opponentNetwork = new GameNetwork();
    this.opponentNetwork.name = 'Opponent';
  }

  private parseConnections(): void {
    this.router.setEdges(usaMap.getConnections());
  }

  /**
   * How important are points in finding the minimum distance.
   *
   * Default 0.0: points are not considered at all in finding the min distance.
   * Weigths increase as distances increase till 0.19.
   * After that, longer routes are considered better than shorter routes.
   * Max 0.39: keep all the routes still in positive numbers.
   * Any value beyond this make longer routes having negative distance.
   *
   * @param parameter
   */
  setPointImportance(parameter: number): void {
    this.router.setPointImportance(parameter);
    this.opponentNetwork?.router.setPointImportance(parameter);
  }

  addEstablished(edge: Connection): void {
    if (this.cannotPass.has(edge))
      throw new Error(
        'addEstablished: ' + edge + ' is in ' + ' cannot pass list',
      );
    this.established.add(edge);
    this.availableTrains -= edge.trains;
    this.establishedPoints += edge.getPoints();
    this.opponentNetwork?.addCannotPass(edge);

    this.updateRoutingAndReports();
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
    this.availableTrains += edge.trains;
    this.establishedPoints -= edge.getPoints();
    this.opponentNetwork?.removeCannotPass(edge);

    this.updateRoutingAndReports();
  }

  addCannotPass(edge: Connection): void {
    if (this.established.has(edge))
      throw new Error(
        'addCannotPass: ' + edge + ' is in ' + ' established list',
      );
    this.cannotPass.add(edge);
    this.opponentNetwork?.addEstablished(edge);

    this.updateRoutingAndReports();
  }

  removeCannotPass(edge: Connection): void {
    if (!this.cannotPass.has(edge))
      throw new Error(
        'removeCannotPass: ' + edge + ' is not in ' + ' cannotPass list',
      );
    this.cannotPass.delete(edge);
    this.opponentNetwork?.removeEstablished(edge);

    this.updateRoutingAndReports();
  }

  private updateRoutingAndReports(): void {
    this.router.processEdgeRestrictions(this.cannotPass, this.established);
    this.generateTicketReports();
    this.consoleReports();
  }

  private generateTicketReports(): void {
    this.ticketReports = [];
    const connections = Array.from(this.established);
    usaMap.getTickets().forEach((t) => {
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

  private consoleReports(): void {
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

  getAvailableTrains(): number {
    return this.availableTrains;
  }

  getPoints(): number {
    return this.establishedPoints;
  }

  getRouting(): Routing {
    return this.router;
  }
}
