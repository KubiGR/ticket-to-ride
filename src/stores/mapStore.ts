import { makeAutoObservable } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';

export class MapStore {
  gameNetwork = new GameNetwork();
  selectedCities: string[] = [];
  cannotPassConnections: Connection[] = [];
  shouldPassConnections: Connection[] = [];

  constructor() {
    this.gameNetwork.createOpponent();
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

  toggleSelectedCity(cityName: string): void {
    if (!this.selectedCities?.includes(cityName)) {
      this.selectedCities.push(cityName);
    } else {
      const index = this.selectedCities.indexOf(cityName);
      if (index > -1) {
        this.selectedCities.splice(index, 1);
      }
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
    const index = this.shouldPassConnections.findIndex((e) => e.isEqual(con));
    if (index > -1) {
      this.shouldPassConnections.splice(index, 1);
      this.gameNetwork.removeEstablished(con);
    }
  }

  addEstablishedConnection(con: Connection): void {
    this.shouldPassConnections.push(con);
    this.gameNetwork.addEstablished(con);
  }

  removeCannotPassConnection(con: Connection): void {
    const index = this.cannotPassConnections.findIndex((e) => e.isEqual(con));
    if (index > -1) {
      this.cannotPassConnections.splice(index, 1);
      this.gameNetwork.removeCannotPass(con);
    }
  }

  addCannotPassConnection(con: Connection): void {
    this.cannotPassConnections.push(con);
    this.gameNetwork.addCannotPass(con);
  }
}
