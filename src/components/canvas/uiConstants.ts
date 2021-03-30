import { makeAutoObservable } from 'mobx';
export default class UIConstants {
  static readonly mapHeight = 900;
  static readonly mapWidth = UIConstants.mapHeight * 1.56;
  static readonly lineStrokeSize = UIConstants.mapWidth * 0.012;
  static readonly cityStrokeSize = UIConstants.mapWidth * 0.003;
  static readonly cityFillRadius = UIConstants.mapWidth * 0.008;
  static readonly rectWidth = UIConstants.mapWidth * 0.01;
  static readonly bestRouteConnectionColor = '#7d85ff';
  opponent1PassConnectionColor = '#c40d00';
  opponent2PassConnectionColor = '#3c00ff';
  opponent3PassConnectionColor = '#d2d900';
  opponent4PassConnectionColor = '#292929';
  establishedConnectionColor = '#087016';
  static readonly defaultCityFillColor = '#087016';
  static readonly ticketCityFillColor = '#245096';
  static readonly selectedCityStrokeColor = '#9cad00';
  static readonly highlightedCityFillColor = '#e300a3';
  static readonly highlightedCityStrokeColor = '#1c1f1d';

  constructor() {
    makeAutoObservable(this);
  }

  setEstablishedConnectionColor(value: string): void {
    this.establishedConnectionColor = value;
  }

  setOpponent1PassConnectionColor(value: string): void {
    this.opponent1PassConnectionColor = value;
  }

  setOpponent2PassConnectionColor(value: string): void {
    this.opponent2PassConnectionColor = value;
  }

  setOpponent3PassConnectionColor(value: string): void {
    this.opponent3PassConnectionColor = value;
  }

  setOpponent4PassConnectionColor(value: string): void {
    this.opponent4PassConnectionColor = value;
  }

  setConnectionColor(index: number, value: string): void {
    switch (index) {
      case 0:
        this.establishedConnectionColor = value;
        break;
      case 1:
        this.opponent1PassConnectionColor = value;
        break;
      case 2:
        this.opponent2PassConnectionColor = value;
        break;
      case 3:
        this.opponent3PassConnectionColor = value;
        break;
      case 4:
        this.opponent4PassConnectionColor = value;
        break;
    }
  }
}
