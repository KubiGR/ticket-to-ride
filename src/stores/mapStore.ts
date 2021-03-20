import { makeAutoObservable } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';

export class MapStore {
  gameNetwork = new GameNetwork();
  selectedCities: string[] = [];
  cannotPassConnections: Connection[] = [];
  shouldPassConnections: Connection[] = [];

  constructor() {
    makeAutoObservable(this);
    console.log('mapStore constructor');
    console.log(this.cannotPassConnections);
    this.selectedCities.push('Vancouver');
    console.log(this.selectedCities);
  }

  toggleSelectedCity(cityName: string) {
    console.log(this.selectedCities);
    if (!this.selectedCities?.includes(cityName)) {
      this.selectedCities.push(cityName);
    } else {
      const index = this.selectedCities.indexOf(cityName);
      if (index > -1) {
        this.selectedCities.splice(index, 1);
      }
    }
  }

  toggleShouldPassConnection(con: Connection) {
    if (!this.shouldPassConnections?.some((e) => e.isEqual(con))) {
      this.shouldPassConnections.push(con);
    } else {
      const index = this.shouldPassConnections.findIndex((e) => e.isEqual(con));
      if (index > -1) {
        this.shouldPassConnections.splice(index, 1);
      }
    }
  }

  toggleCannotPassConnection(con: Connection) {
    if (!this.cannotPassConnections?.some((e) => e.isEqual(con))) {
      this.cannotPassConnections.push(con);
    } else {
      const index = this.cannotPassConnections.findIndex((e) => e.isEqual(con));
      if (index > -1) {
        this.cannotPassConnections.splice(index, 1);
      }
    }
  }

  get connectionTypeSelectionMap() {
    const citiesArray = this.gameNetwork.getShortestVisitingPath(
      this.selectedCities,
    );
    const connectionsArray = this.gameNetwork.getConnectionsForPath(
      citiesArray,
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
}

export default new MapStore();
