import { usaMap } from 'model/usaMap';
import { Connection } from './connection';
import { Constants } from './constants';
import { TicketReport } from './ticketReport';
import { Routing } from './routing';
import { Ticket } from './ticket';
import {
  all_combinations,
  getRandomCombinations,
  minimumOfArray,
  timeout,
} from 'utils/helpers';

export class GameNetwork {
  private routing: Routing = new Routing();
  private cannotPass: Set<Connection> = new Set();
  private established: Set<Connection> = new Set();
  private ticketReports: TicketReport[] = [];

  private availableTrains = Constants.TOTAL_TRAINS;
  private establishedPoints = 0;

  private opponentNetwork: GameNetwork | undefined;
  private name = 'Player';

  constructor() {
    this.routing.setEstablished(this.established);
    this.routing.setCannotPass(this.cannotPass);
    this.parseConnections();
  }

  getTicketReports(): TicketReport[] {
    return this.ticketReports;
  }

  getOpponentNetwork(): GameNetwork | undefined {
    return this.opponentNetwork;
  }

  createOpponent(): void {
    this.opponentNetwork = new GameNetwork();
    this.opponentNetwork.name = 'Opponent';
  }

  private parseConnections(): void {
    this.routing.setEdges(usaMap.getConnections());
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
    this.routing.setPointImportance(parameter);
    this.opponentNetwork?.routing.setPointImportance(parameter);
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
    this.routing.processEdgeRestrictions(this.cannotPass, this.established);
    this.generateTicketReports();
    // this.consoleReports();
  }

  private getTicketReportsForTickets(tickets: Ticket[]): TicketReport[] {
    const ticketReports: TicketReport[] = [];
    tickets.forEach((t) => {
      const ticketConns = this.routing.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
        [t],
      );
      let completed = 0;
      ticketConns.forEach((c) => {
        if (this.established.has(c)) {
          completed++;
        }
      });

      const remainingConnections = ticketConns.filter((conn) => {
        return !this.established.has(conn);
      });

      const requiredTrains = this.routing.getRequiredNumOfTrains(ticketConns);

      const ticketReport = new TicketReport(
        t,
        remainingConnections,
        requiredTrains,
        completed,
        ticketConns.length,
        ticketConns.length > 0,
      );

      ticketReports.push(ticketReport);
    });
    return ticketReports;
  }

  private generateTicketReports(): void {
    this.ticketReports = this.getTicketReportsForTickets(usaMap.getTickets());
  }

  private consoleReports(): void {
    console.log('====== ' + this.name + ' TICKET REPORT =====');
    this.ticketReports
      .filter(TicketReport.filterFn)
      .sort(TicketReport.compare)
      .forEach((t) => {
        const percentage = t.completionPercentage();
        if (t.remainingConnections.length < 2 || percentage > 0.5) {
          console.log(
            t.ticket.toString() +
              ': ' +
              (percentage * 100).toFixed(0) +
              '% needs ' +
              t.remainingTrains +
              ' train(s) in ' +
              t.remainingConnections.length +
              ' connection(s).',
          );
        }
      });
  }

  /**
   * returns the expected points if a player draws tickets.
   */
  async getExpectedPointsDrawingTickets(sample: number): Promise<number> {
    // for each draw of 3 tickets from the available tickets
    // Producing all the combinations takes 18s. Too long. 4060 combinations (30, 3)
    // Take a random sample? N = 100 draws
    const ticketsToDrawFrom = usaMap.getTickets();
    const pickedTickets = getRandomCombinations(sample, 3, ticketsToDrawFrom);
    let total = 0;
    await timeout(1);
    for (let c = 0; c < pickedTickets.length; c++) {
      total += this.getExpectedPointsFromTickets(pickedTickets[c]);
      if (c % 100 == 0) await timeout(1);
    }
    return total / pickedTickets.length;
  }

  //    keep ticket if already completed
  //    for each combination of kept tickets for 1, 2 or 3 tickets
  //      reject those that need more trains than available
  //      calculate the expected points if keeping these tickets
  //      find the best among these
  getExpectedPointsFromTickets(tickets: Ticket[]): number {
    const ticketReports = this.getTicketReportsForTickets(tickets);
    let points = 0;
    const achieveable = ticketReports.filter((t) => {
      return t.reachable && t.remainingTrains < this.availableTrains;
    });

    if (achieveable.length == 0)
      return -1 * minimumOfArray(tickets.map((t) => t.points));

    const alreadyCompleted: TicketReport[] = [];
    const rest: TicketReport[] = [];
    for (let i = 0; i < achieveable.length; i++) {
      const ticketReport = achieveable[i];
      if (ticketReport.completionPercentage() == 1) {
        points += ticketReport.ticket.points;
        alreadyCompleted.push(ticketReport);
      } else {
        rest.push(ticketReport);
      }
    }
    // dealing with the rest of tickets (excluding non achievable and already achieved)
    const keepTickets: Ticket[] = this.selectTicketsToKeep(
      rest.map((tr) => tr.ticket),
    );
    const keepTicketReport = rest.filter((tr) =>
      keepTickets.includes(tr.ticket),
    );
    points += keepTicketReport
      .map((tr) => {
        return tr.ticket.points * tr.completionPercentage();
      })
      .reduce((sum, p) => sum + p, 0);

    return points;
  }

  selectTicketsToKeep(tickets: Ticket[]): Ticket[] {
    const combinations: Ticket[][] = [];
    let len = tickets.length;
    while (len > 0) {
      const combs = all_combinations(tickets.length, len);
      combs.forEach((c) => {
        combinations.push(c.map((index) => tickets[index - 1]));
      });
      len--;
    }

    let maxPoints = 0;
    let maxCombination: Ticket[] = [];
    for (let i = 0; i < combinations.length; i++) {
      const combTickets = combinations[i];
      const combConns = this.routing.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
        combTickets,
      );
      if (
        this.routing.getRequiredNumOfTrains(combConns) <= this.availableTrains
      ) {
        const points = this.routing.getGainPoints(combTickets, combConns);
        if (points > maxPoints) {
          maxPoints = points;
          maxCombination = combTickets;
        }
      }
    }
    return maxCombination;
  }

  getAvailableTrains(): number {
    return this.availableTrains;
  }

  getPoints(): number {
    return this.establishedPoints;
  }

  getRouting(): Routing {
    return this.routing;
  }
}
