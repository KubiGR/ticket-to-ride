import { makeAutoObservable } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';
import { Ticket } from 'model/ticket';
import { removeItemOnce } from 'utils/helpers';
import { usaMap } from 'model/usaMap';

export class MapStore {
  gameNetwork = new GameNetwork();
  selectedCities: string[] = [];
  selectedTickets: Ticket[] = [];
  cannotPassConnections: Connection[] = [];
  shouldPassConnections: Connection[] = [];

  constructor() {
    this.gameNetwork.createOpponent();
    this.gameNetwork.setPointImportance(0.19);
    makeAutoObservable(this);
  }

  get connectionTypeSelectionMap(): Map<Connection, string[]> {
    const connectionsArray = this.gameNetwork
      .getRouter()
      .getOptConnectionsOfMinSpanningTreeOfShortestRoutes(this.selectedCities);

    console.log(
      'Available trains: ' +
        (this.gameNetwork.getAvailableTrains() -
          this.gameNetwork
            .getRouter()
            .getRequiredNumOfTrains(connectionsArray)) +
        '\nTotal Points    : ' +
        (this.gameNetwork.getPoints() +
          this.gameNetwork.getRouter().getGainPoints([], connectionsArray)),
    );

    const connectionTypeSelectionMap = connectionsArray.reduce((acc, cur) => {
      acc.set(cur, ['selected']);
      return acc;
    }, new Map());

    this.cannotPassConnections.forEach((cannotPassConnection) => {
      if (connectionTypeSelectionMap.get(cannotPassConnection)) {
        connectionTypeSelectionMap.get(cannotPassConnection).push('cannotPass');
      } else {
        connectionTypeSelectionMap.set(cannotPassConnection, ['cannotPass']);
      }
    });

    this.shouldPassConnections.forEach((shouldPassConnection) => {
      if (connectionTypeSelectionMap.get(shouldPassConnection)) {
        connectionTypeSelectionMap.get(shouldPassConnection).push('shouldPass');
      } else {
        connectionTypeSelectionMap.set(shouldPassConnection, ['shouldPass']);
      }
    });
    return connectionTypeSelectionMap;
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

  addTicket(ticket: Ticket): void {
    this.selectedTickets.push(ticket);
    [ticket.from, ticket.to].forEach((city) => {
      if (!this.selectedCities.includes(city)) {
        this.selectedCities.push(city);
      }
    });
  }

  removeTicket(ticketToRemove: Ticket): void {
    removeItemOnce(this.selectedTickets, ticketToRemove);
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.from ||
          ticket.to === ticketToRemove.from,
      )
    ) {
      this.toggleSelectedCity(ticketToRemove.from);
    }
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.to || ticket.to === ticketToRemove.to,
      )
    ) {
      this.toggleSelectedCity(ticketToRemove.to);
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
    if (this.cannotPassConnections?.some((e) => e.isEqual(con))) {
      this.removeCannotPassConnection(con);
    }
    if (!this.shouldPassConnections?.some((e) => e.isEqual(con))) {
      this.addEstablishedConnection(con);
    } else {
      this.removeEstablishedConnection(con);
    }
  }

  toggleCannotPassConnection(con: Connection): void {
    if (this.shouldPassConnections?.some((e) => e.isEqual(con))) {
      this.removeEstablishedConnection(con);
    }
    if (!this.cannotPassConnections?.some((e) => e.isEqual(con))) {
      this.addCannotPassConnection(con);
    } else {
      this.removeCannotPassConnection(con);
    }
  }

  removeEstablishedConnection(con: Connection): void {
    removeItemOnce(this.shouldPassConnections, con);
    this.gameNetwork.removeEstablished(con);
  }

  addEstablishedConnection(con: Connection): void {
    this.shouldPassConnections.push(con);
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
}
