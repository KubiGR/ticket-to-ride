import { makeAutoObservable, observable, reaction } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';
import { Ticket } from 'model/ticket';
import { removeItemOnce } from 'utils/helpers';
import { usaMap } from 'model/usaMap';
import { TicketReport } from '../model/ticketReport';
import { Constants } from 'model/constants';

export class MapStore {
  gameNetwork = new GameNetwork();
  selectedCities: string[] = [];
  selectedTickets: Ticket[] = [];
  cannotPassConnections: Connection[] = [];
  establishedConnections: Connection[] = [];
  connectionsArray: Connection[] = [];
  ticketReports: TicketReport[] = [];
  opponentTicketReports: TicketReport[] = [];
  impConTickets = observable.array<Ticket>();

  constructor() {
    makeAutoObservable(this);
    this.gameNetwork.createOpponent();
    this.gameNetwork.setPointImportance(0.19);

    reaction(
      () => [
        this.selectedTickets.length,
        this.establishedConnections.length,
        this.cannotPassConnections.length,
      ],
      () => {
        this.connectionsArray = this.gameNetwork
          .getRouting()
          .getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
            this.selectedTickets,
          );
      },
    );

    reaction(
      () => [
        this.establishedConnections.length,
        this.cannotPassConnections.length,
      ],
      () => {
        this.gameNetwork
          .getExpectedPointsDrawingTickets(Constants.DRAW_TICKETS_SAMPLE_SIZE)
          .then((value) => {
            console.log('EXP POINTS', value);
          });
        this.ticketReports = this.gameNetwork
          .getTicketReports()
          .filter(
            (ticketReport) =>
              ticketReport.reachable &&
              ticketReport.remainingConnections.length <=
                Constants.REMAININING_CONNECTIONS_LEN &&
              ticketReport.remainingTrains <= Constants.REMAINING_TRAINS &&
              ticketReport.connectionsCompletionRate() >=
                Constants.COMPLETION_PERC,
          );
        const opponentNetwork = this.gameNetwork.getOpponentNetwork();
        if (opponentNetwork) {
          this.opponentTicketReports = opponentNetwork
            .getTicketReports()
            .filter(
              (ticketReport) =>
                ticketReport.reachable &&
                ticketReport.remainingConnections.length <=
                  Constants.REMAININING_CONNECTIONS_LEN &&
                ticketReport.remainingTrains <= Constants.REMAINING_TRAINS &&
                ticketReport.connectionsCompletionRate() >=
                  Constants.COMPLETION_PERC,
            );
        }
      },
    );
  }

  get opponentImportantConnectionsWithPointsMap(): Map<Connection, number> {
    return this.opponentTicketReports.reduce((acc, cur) => {
      cur.remainingConnections.forEach((con) => {
        const connectionExistingPoints = acc.get(con) || 0;
        acc.set(con, connectionExistingPoints + cur.ticket.points);
      });
      return acc;
    }, new Map<Connection, number>());
  }

  get opponentImportantConnectionsWithTicketsMap(): Map<Connection, Ticket[]> {
    return this.opponentTicketReports.reduce((acc, cur) => {
      cur.remainingConnections.forEach((con) => {
        const ticketsForConnectionArray = acc.get(con);
        if (ticketsForConnectionArray) {
          ticketsForConnectionArray.push(cur.ticket);
        } else {
          acc.set(con, [cur.ticket]);
        }
      });
      return acc;
    }, new Map<Connection, Ticket[]>());
  }

  get opponentImportantConnections(): Connection[] {
    return this.opponentTicketReports
      .map((ticketReport) => ticketReport.remainingConnections)
      .flat();
  }

  get connectionTypeSelectionMap(): Map<Connection, string[]> {
    const connectionTypeSelectionMap = this.connectionsArray.reduce(
      (acc, cur) => {
        acc.set(cur, ['selected']);
        return acc;
      },
      new Map(),
    );

    this.cannotPassConnections.forEach((cannotPassConnection) => {
      if (connectionTypeSelectionMap.get(cannotPassConnection)) {
        connectionTypeSelectionMap.get(cannotPassConnection).push('cannotPass');
      } else {
        connectionTypeSelectionMap.set(cannotPassConnection, ['cannotPass']);
      }
    });

    this.establishedConnections.forEach((shouldPassConnection) => {
      if (connectionTypeSelectionMap.get(shouldPassConnection)) {
        connectionTypeSelectionMap.get(shouldPassConnection).push('shouldPass');
      } else {
        connectionTypeSelectionMap.set(shouldPassConnection, ['shouldPass']);
      }
    });
    return connectionTypeSelectionMap;
  }

  // get connectionsArray(): Connection[] {
  //   console.log(this.ticketsCities);
  //   return this.gameNetwork
  //     .getRouting()
  //     .getOptConnectionsOfMinSpanningTreeOfShortestRoutes(this.ticketsCities);
  // }

  get availableTrainsCount(): number {
    return (
      this.gameNetwork.getAvailableTrains() -
      this.gameNetwork
        .getRouting()
        .getRequiredNumOfTrains(this.connectionsArray)
    );
  }

  get totalPoints(): number {
    return (
      this.gameNetwork.getPoints() +
      this.gameNetwork
        .getRouting()
        .getGainPoints(this.selectedTickets, this.connectionsArray)
    );
  }

  get notSelectedTickets(): Ticket[] {
    return usaMap
      .getTickets()
      .filter(
        (el) =>
          this.selectedCities.includes(el.from) ||
          this.selectedCities.includes(el.to),
      )
      .filter((el) => !this.selectedTickets.includes(el));
  }

  get ticketsCities(): string[] {
    return this.selectedTickets.reduce((acc, cur) => {
      if (!acc.includes(cur.from)) {
        acc.push(cur.from);
      }
      if (!acc.includes(cur.to)) {
        acc.push(cur.to);
      }
      return acc;
    }, [] as string[]);
  }

  addTicket(ticket: Ticket): void {
    this.gameNetwork.addTicket(ticket);
    this.selectedTickets.push(ticket);
    [ticket.from, ticket.to].forEach((city) => {
      removeItemOnce(this.selectedCities, city);
      if (!this.ticketsCities.includes(city)) {
        this.ticketsCities.push(city);
      }
    });
  }

  removeTicket(ticketToRemove: Ticket): void {
    this.gameNetwork.removeTicket(ticketToRemove);
    removeItemOnce(this.selectedTickets, ticketToRemove);
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.from ||
          ticket.to === ticketToRemove.from,
      )
    ) {
      removeItemOnce(this.selectedCities, ticketToRemove.from);
    }
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.to || ticket.to === ticketToRemove.to,
      )
    ) {
      removeItemOnce(this.selectedCities, ticketToRemove.to);
    }
  }

  toggleSelectedCity(cityName: string): void {
    if (!this.selectedCities?.includes(cityName)) {
      this.selectedCities.push(cityName);
    } else {
      removeItemOnce(this.selectedCities, cityName);
    }
  }

  toggleShouldPassConnection(con: Connection): void {
    if (this.cannotPassConnections?.some((e) => e.hasSameCities(con))) {
      this.removeCannotPassConnection(con);
    }
    if (!this.establishedConnections?.some((e) => e.hasSameCities(con))) {
      this.addEstablishedConnection(con);
    } else {
      this.removeEstablishedConnection(con);
    }
  }

  toggleCannotPassConnection(con: Connection): void {
    if (this.establishedConnections?.some((e) => e.hasSameCities(con))) {
      this.removeEstablishedConnection(con);
    }
    if (!this.cannotPassConnections?.some((e) => e.hasSameCities(con))) {
      this.addCannotPassConnection(con);
    } else {
      this.removeCannotPassConnection(con);
    }
  }

  removeEstablishedConnection(con: Connection): void {
    removeItemOnce(this.establishedConnections, con);
    this.gameNetwork.removeEstablished(con);
  }

  addEstablishedConnection(con: Connection): void {
    this.establishedConnections.push(con);
    this.gameNetwork.addEstablished(con);
  }

  removeCannotPassConnection(con: Connection): void {
    removeItemOnce(this.cannotPassConnections, con);
    this.gameNetwork.removeCannotPass(con);
  }

  addCannotPassConnection(con: Connection): void {
    this.cannotPassConnections.push(con);
    this.gameNetwork.addCannotPass(con);
  }

  setImpConTickets(tickets: Ticket[]): void {
    this.impConTickets.replace(tickets);
  }

  clearImpConTickets(): void {
    this.impConTickets.clear();
  }
}
