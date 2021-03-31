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
  removeItemOnce,
  timeout,
} from 'utils/helpers';
import { PlayerInfo } from './playerInfo';
import { TrackColor } from './trackColor';

export class GameNetwork {
  private routing: Routing = new Routing();
  private cannotPass: Set<Connection> = new Set();
  private established: Set<Connection> = new Set();
  private ticketReports: TicketReport[] = [];

  private availableTrains = Constants.TOTAL_TRAINS;
  private establishedPoints = 0;

  private opponentNetworks: GameNetwork[] | undefined;
  private hasDoubleTracks = false;
  private name = 'Player';
  private tickets: Ticket[] = [];
  private playerInfo: PlayerInfo | undefined;

  constructor() {
    this.routing.setEstablished(this.established);
    this.routing.setCannotPass(this.cannotPass);
    this.routing.setEdges(usaMap.getConnections());
  }

  getTicketReports(): TicketReport[] {
    return this.ticketReports;
  }

  setPlayerInfo(playerInfo: PlayerInfo): void {
    this.playerInfo = playerInfo;
  }

  getPlayerInfo(): PlayerInfo | undefined {
    return this.playerInfo;
  }

  getOpponentNetwork(index = 0): GameNetwork | undefined {
    if (this.opponentNetworks === undefined) return undefined;
    if (index >= this.opponentNetworks.length)
      throw new Error('getOpponentNetwork: no opponent with index: ' + index);
    return this.opponentNetworks[index];
  }

  createOpponent(): number {
    if (this.opponentNetworks === undefined) {
      this.opponentNetworks = [];
    }
    const index = this.opponentNetworks.length;
    this.opponentNetworks[index] = new GameNetwork();
    this.opponentNetworks[index].name = 'Opponent' + index;
    if (this.opponentNetworks.length > 2) {
      this.hasDoubleTracks = true;
      this.opponentNetworks.forEach((gn) => {
        gn.hasDoubleTracks = true;
      });
    }
    return index;
  }

  addTicket(ticket: Ticket): void {
    this.tickets.push(ticket);
  }

  removeTicket(ticketToRemove: Ticket): void {
    removeItemOnce(this.tickets, ticketToRemove);
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
    this.opponentNetworks?.forEach((opp) => {
      opp.setPointImportance(parameter);
    });
  }

  addEstablished(edge: Connection, trackNr = 0): void {
    // console.log(this.name + ' addEstablished ' + edge + ' nr: ' + trackNr);
    if (this.cannotPass.has(edge))
      throw new Error(
        this.name + ' :addEstablished: ' + edge + ' is in cannot pass list',
      );
    if (this.established.has(edge))
      throw new Error(
        this.name + ' :addEstablished: ' + edge + ' is already in the network',
      );
    const gn = edge.getTrackPlayer(trackNr);
    if (gn !== undefined) {
      throw new Error(
        this.name +
          ' :addEstablished: ' +
          edge +
          ' already has a player: ' +
          gn +
          ' with playerInfo ' +
          gn.getPlayerInfo() +
          ' in trackNr ' +
          trackNr,
      );
    }

    this.established.add(edge);
    this.availableTrains -= edge.trains;
    this.establishedPoints += edge.getPoints();

    edge.setTrackPlayer(this, trackNr);

    this.opponentNetworks?.forEach((opp) => {
      opp.addCannotPass(edge, -1, trackNr); // -1 ??
    });

    this.updateRoutingAndReports();
  }

  removeEstablished(edge: Connection, trackNr = 0): void {
    // console.log(this.name + ' removeEstablished ' + edge + ' nr: ' + trackNr);
    const gn = edge.getTrackPlayer(trackNr);
    if (gn === undefined) {
      throw new Error(
        this.name + ' removeEstablished: no player at trackNr ' + trackNr,
      );
    } else if (gn !== this) {
      throw new Error(
        this.name +
          ' removeEstablished: the track ' +
          trackNr +
          ' belongs to another player',
      );
    }

    edge.setTrackPlayer(undefined, trackNr);

    this.established.delete(edge);
    this.availableTrains += edge.trains;
    this.establishedPoints -= edge.getPoints();
    this.opponentNetworks?.forEach((opp) => {
      opp.removeCannotPass(edge, -1, trackNr);
    });
    this.updateRoutingAndReports();
  }

  addCannotPass(edge: Connection, index = 0, trackNr = 0): void {
    // console.log(
    //   this.name +
    //     ' addCannotPass: ' +
    //     ' opp: ' +
    //     index +
    //     ' edge: ' +
    //     edge +
    //     ' nr: ' +
    //     trackNr,
    // );
    if (
      this.opponentNetworks !== undefined &&
      index >= this.opponentNetworks.length
    )
      throw new Error(
        this.name + ' :addCannotPass: no opponent with index: ' + index,
      );

    if (this.opponentNetworks !== undefined) {
      if (this.established.has(edge))
        throw new Error(
          this.name +
            ' :addCannotPass: ' +
            edge +
            ' is in ' +
            ' established list',
        );
      const gn = edge.getTrackPlayer(trackNr);
      if (gn !== undefined) {
        throw new Error(
          this.name +
            ' :addCannotPass: TRACKLINE_USED: ' +
            edge +
            ' already has a player: ' +
            gn +
            ' with playerInfo ' +
            gn.getPlayerInfo() +
            ' in trackNr ' +
            trackNr,
        );
      }

      this.opponentNetworks[index].addEstablished(edge, trackNr);
      for (let opp = 0; opp < this.opponentNetworks.length; opp++) {
        if (opp !== index)
          this.opponentNetworks[opp].addCannotPass(edge, -1, trackNr); // -1 ??
      }
    }

    if (!this.isConnectionAvailable(edge)) {
      this.cannotPass.add(edge);
    }
    this.updateRoutingAndReports();
  }

  private isConnectionAvailable(edge: Connection) {
    return this.hasDoubleTracks && edge.isAvailable();
  }

  removeCannotPass(edge: Connection, index = 0, trackNr = 0): void {
    // console.log(
    //   this.name +
    //     ' removeCannotPass: ' +
    //     ' opp: ' +
    //     index +
    //     ' edge: ' +
    //     edge +
    //     ' nr: ' +
    //     trackNr,
    // );
    if (this.opponentNetworks !== undefined) {
      if (index >= this.opponentNetworks.length)
        throw new Error(
          this.name + ' :removeCannotPass: no opponent with index: ' + index,
        );
      const gn = edge.getTrackPlayer(trackNr);
      if (gn === undefined) {
        throw new Error(
          this.name + ' removeCannotPass: no player at trackNr ' + trackNr,
        );
      } else if (gn !== this.getOpponentNetwork(index)) {
        throw new Error(
          this.name +
            ' removeCannotPass: the track ' +
            trackNr +
            ' belongs to another opponent:' +
            gn,
        );
      }
    }
    this.cannotPass.delete(edge);
    if (this.opponentNetworks !== undefined) {
      this.opponentNetworks[index].removeEstablished(edge, trackNr);
      for (let opp = 0; opp < this.opponentNetworks.length; opp++) {
        if (opp !== index)
          this.opponentNetworks[opp].removeCannotPass(edge, -1, trackNr);
      }
    }

    this.updateRoutingAndReports();
  }

  private updateRoutingAndReports(): void {
    this.routing.processEdgeRestrictions(this.cannotPass, this.established);
    this.generateTicketReports();
    // this.consoleReports();
  }

  private getTicketReportForTicket(t: Ticket): TicketReport {
    const ticketConns = this.routing.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
      [t],
    );

    const completedConnections = ticketConns.filter((conn) => {
      return this.established.has(conn);
    });
    const remainingConnections = ticketConns.filter((conn) => {
      return !this.established.has(conn);
    });

    const requiredTrains = this.routing.getRequiredNumOfTrains(ticketConns);

    const completedDifficuly = completedConnections
      .map((conn) => this.getDifficulty(conn))
      .reduce((sum, x) => sum + x, 0);
    const totalDifficulty = ticketConns
      .map((conn) => this.getDifficulty(conn))
      .reduce((sum, x) => sum + x, 0);

    const ticketReport = new TicketReport(
      t,
      remainingConnections,
      requiredTrains,
      completedConnections.length,
      ticketConns.length,
      completedDifficuly,
      totalDifficulty,
      ticketConns.length > 0,
    );
    return ticketReport;
  }

  private generateTicketReports(): void {
    this.ticketReports = usaMap
      .getTickets()
      .map((t) => this.getTicketReportForTicket(t));
  }

  private consoleReports(): void {
    console.log('====== ' + this.name + ' TICKET REPORT =====');
    this.ticketReports
      .filter(TicketReport.filterFn)
      .sort(TicketReport.compare)
      .forEach((t) => {
        const percentage = t.connectionsCompletionRate();
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
    if (this.opponentNetworks === undefined)
      throw new Error(
        'getExpectedPointsDrawingTickets: cannot be called by opponents!',
      );
    const ticketsToDrawFrom = usaMap
      .getTickets()
      .filter(
        (t) => !this.tickets.includes(t) && !this.someOpponentsHaveCompleted(t),
      );
    const pickedTickets = getRandomCombinations(sample, 3, ticketsToDrawFrom);
    let total = 0;
    for (const pickedTicket of pickedTickets) {
      await timeout(0);
      total += this.getExpectedPointsFromTickets(pickedTicket);
    }
    return total / pickedTickets.length;
  }

  private someOpponentsHaveCompleted(t: Ticket): boolean {
    if (this.opponentNetworks === undefined)
      throw new Error(
        'someOpponentsHaveCompleted: cannot be called by opponents!',
      );
    return this.opponentNetworks.some(
      (opp) => opp.getTicketReportForTicket(t).remainingConnections.length == 0,
    );
  }

  //    keep ticket if already completed
  //    for each combination of kept tickets for 1, 2 or 3 tickets
  //      reject those that need more trains than available
  //      calculate the expected points if keeping these tickets
  //      find the best among these
  getExpectedPointsFromTickets(tickets: Ticket[]): number {
    const ticketReports = tickets.map((t) => this.getTicketReportForTicket(t));
    let points = 0;
    const achieveable = ticketReports.filter((t) => {
      return t.reachable && t.remainingTrains < this.availableTrains;
    });

    if (achieveable.length == 0)
      return -1 * minimumOfArray(tickets.map((t) => t.points));

    const alreadyCompleted: TicketReport[] = [];
    const rest: TicketReport[] = [];
    for (const ticketReport of achieveable) {
      if (ticketReport.remainingConnections.length === 0) {
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
        return tr.ticket.points * tr.difficultyCompletionRate();
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
        combinations.push(c.map((index) => tickets[index]));
      });
      len--;
    }

    let maxPoints = 0;
    let maxCombination: Ticket[] = [];
    for (const combTickets of combinations) {
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

  getDifficulty(connection: Connection): number {
    let factor = 1;
    if (
      (!this.hasDoubleTracks &&
        (connection.color1 === TrackColor.Gray ||
          connection.color2 === TrackColor.Gray)) ||
      (connection.color1 === TrackColor.Gray &&
        connection.getTrackPlayer(0) === undefined) ||
      (connection.color2 === TrackColor.Gray &&
        connection.getTrackPlayer(1) === undefined)
    )
      factor *= Constants.GRAY_DIFFICULTY_FACTOR;
    if (
      this.hasDoubleTracks &&
      connection.color2 !== undefined &&
      connection.getTrackPlayer(0) === undefined &&
      connection.getTrackPlayer(1) === undefined
    )
      factor *= Constants.DOUBLE_DIFFICULTY_FACTOR;

    return factor * connection.getPoints();
  }
}
