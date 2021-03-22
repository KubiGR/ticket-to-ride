import { makeAutoObservable, reaction } from 'mobx';
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
  establishedConnections: Connection[] = [];
  connectionsArray: Connection[] = [];

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
          .getOptConnectionsOfMinSpanningTreeOfShortestRoutes(
            this.ticketsCities,
          );
      },
    );
  }

  get connectionTypeSelectionMap(): Map<Connection, string[]> {
    console.log(this.connectionsArray);
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
    this.selectedTickets.push(ticket);
    [ticket.from, ticket.to].forEach((city) => {
      if (!this.ticketsCities.includes(city)) {
        this.ticketsCities.push(city);
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
    if (!this.establishedConnections?.some((e) => e.isEqual(con))) {
      this.addEstablishedConnection(con);
    } else {
      this.removeEstablishedConnection(con);
    }
  }

  toggleCannotPassConnection(con: Connection): void {
    if (this.establishedConnections?.some((e) => e.isEqual(con))) {
      this.removeEstablishedConnection(con);
    }
    if (!this.cannotPassConnections?.some((e) => e.isEqual(con))) {
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
}
