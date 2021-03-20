import { autorun, makeAutoObservable } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';

export class MapStore {
  gameNetwork = new GameNetwork();
  selectedCities: string[] = [];
  cannotPassConnections: Connection[] = [];
  shouldPassConnections: Connection[] = [];
  connectionTypeSelectionMap: Map<Connection, string[]> = new Map();

  constructor() {
    makeAutoObservable(this);
    console.log(this);

    autorun(() => {
      this.generateConnectionTypeSelectionMap();
    });
  }

  generateConnectionTypeSelectionMap(): void {
    const connectionsArray = this.gameNetwork.getOptConnectionsOfMinSpanningTreeOfShortestRoutes(
      this.selectedCities,
    );

    console.log(
      'Available trains: ' +
        (this.gameNetwork.getAvailableTrains() -
          this.gameNetwork.getRequiredNumOfTrains(connectionsArray)) +
        '\nTotal Points    : ' +
        (this.gameNetwork.getPoints() +
          this.gameNetwork.getGainPoints([], connectionsArray)),
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

    console.log(connectionTypeSelectionMap);
    this.connectionTypeSelectionMap = connectionTypeSelectionMap;
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
    if (!this.shouldPassConnections?.some((e) => e.isEqual(con))) {
      this.shouldPassConnections.push(con);
    } else {
      const index = this.shouldPassConnections.findIndex((e) => e.isEqual(con));
      if (index > -1) {
        this.shouldPassConnections.splice(index, 1);
      }
    }
  }

  toggleCannotPassConnection(con: Connection): void {
    if (!this.cannotPassConnections?.some((e) => e.isEqual(con))) {
      this.cannotPassConnections.push(con);
    } else {
      const index = this.cannotPassConnections.findIndex((e) => e.isEqual(con));
      if (index > -1) {
        this.cannotPassConnections.splice(index, 1);
      }
    }
  }
}
