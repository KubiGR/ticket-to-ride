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
  allOpponentsConnections: Connection[][] = [];
  establishedConnections: Connection[] = [];
  connectionsArray: Connection[] = [];
  ticketReports: TicketReport[] = [];
  opponentTicketReports: TicketReport[][] = [];
  impConTickets = observable.array<Ticket>();

  constructor() {
    makeAutoObservable(this);
    for (let i = 0; i < 5; i++) {
      this.gameNetwork.createOpponent();
      this.allOpponentsConnections.push([]);
      this.opponentTicketReports.push([]);
    }
    this.gameNetwork.setPointImportance(0.19);

    reaction(
      () => [
        this.selectedTickets.length,
        this.establishedConnections.length,
        this.allOpponentsConnections.map((con) => con.slice()),
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
        this.allOpponentsConnections.map((con) => con.slice()),
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
        for (let i = 0; i < 5; i++) {
          const opponentNetwork = this.gameNetwork.getOpponentNetwork(i);
          if (opponentNetwork) {
            this.opponentTicketReports[
              i
            ] = opponentNetwork
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
        }
        this.opponentTicketReports.map((arr) => console.log(arr.slice()));
      },
    );
  }

  getOpponentImportantConnectionsWithPointsMap(
    index: number,
  ): Map<Connection, number> {
    return this.opponentTicketReports[index].reduce((acc, cur) => {
      cur.remainingConnections.forEach((con) => {
        const connectionExistingPoints = acc.get(con) || 0;
        acc.set(con, connectionExistingPoints + cur.ticket.points);
      });
      return acc;
    }, new Map<Connection, number>());
  }

  getOpponentImportantConnectionsWithTicketsMap(
    index: number,
  ): Map<Connection, Ticket[]> {
    return this.opponentTicketReports[index].reduce((acc, cur) => {
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

  getOpponentImportantConnections(index: number): Connection[] {
    return this.opponentTicketReports
      .map((ticketReport) => ticketReport[index].remainingConnections)
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

    this.allOpponentsConnections.forEach((cannotPassConnections, index) => {
      cannotPassConnections.forEach((con) => {
        if (connectionTypeSelectionMap.get(con)) {
          connectionTypeSelectionMap.get(con).push(index.toString());
        } else {
          connectionTypeSelectionMap.set(con, [index.toString()]);
        }
      });
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

  toggleEstablishedConnection(con: Connection): void {
    for (let i = 0; i < 5; i++) {
      if (this.allOpponentsConnections[i]?.some((e) => e.hasSameCities(con))) {
        this.removeOpponentConnection(con, i);
      }
    }
    if (!this.establishedConnections?.some((e) => e.hasSameCities(con))) {
      this.addEstablishedConnection(con);
    } else {
      this.removeEstablishedConnection(con);
    }
  }

  toggleCannotPassConnection(con: Connection, index: number): void {
    if (this.establishedConnections?.some((e) => e.hasSameCities(con))) {
      this.removeEstablishedConnection(con);
    }
    if (
      !this.allOpponentsConnections[index]?.some((e) => e.hasSameCities(con))
    ) {
      this.addOpponentConnection(con, index);
    } else {
      this.removeOpponentConnection(con, index);
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

  removeOpponentConnection(con: Connection, index: number): void {
    removeItemOnce(this.allOpponentsConnections[index], con);
    const opponentNetwork = this.gameNetwork.getOpponentNetwork(index);
    if (opponentNetwork) {
      opponentNetwork.removeCannotPass(con);
    }
  }

  addOpponentConnection(con: Connection, index: number): void {
    this.allOpponentsConnections[index].push(con);
    const opponentNetwork = this.gameNetwork.getOpponentNetwork(index);
    if (opponentNetwork) {
      opponentNetwork.addCannotPass(con);
    }
  }

  setImpConTickets(tickets: Ticket[]): void {
    this.impConTickets.replace(tickets);
  }

  clearImpConTickets(): void {
    this.impConTickets.clear();
  }
}
