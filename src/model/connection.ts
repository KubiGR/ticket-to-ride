import { TrackColor } from 'model/trackColor';
import { Edge } from 'floyd-warshall-shortest';
import { Constants } from './constants';
import { GameNetwork } from './gameNetwork';

export class Connection implements Edge<string> {
  from: string;
  to: string;
  trains: number;
  weight: number;
  color1: TrackColor;
  color2: TrackColor | undefined;
  player1: GameNetwork | undefined;
  player2: GameNetwork | undefined;

  constructor(from: string, to: string, length: number, color1: TrackColor) {
    this.from = from;
    this.to = to;
    this.trains = length;
    this.color1 = color1;
    this.weight = length - Constants.POINT_IMPORTANCE * this.getPoints();
  }

  getTrackPlayer(trackNr: number): GameNetwork | undefined {
    if (trackNr == 0) return this.player1;
    if (this.color2 === undefined)
      throw new Error(
        'No second track in the connection: ' + this.from + '-' + this.to,
      );
    return this.player2;
  }

  setTrackPlayer(gameNetwork: GameNetwork | undefined, trackNr: number): void {
    if (trackNr == 0) this.player1 = gameNetwork;
    else {
      if (this.color2 === undefined)
        throw new Error(
          'No second track in the connection: ' + this.from + '-' + this.to,
        );
      this.player2 = gameNetwork;
    }
  }

  isAvailable(): boolean {
    return (
      this.player1 === undefined ||
      (this.color2 !== undefined && this.player2 === undefined)
    );
  }

  contains(city: string): boolean {
    return this.from == city || this.to == city;
  }

  isAdjacentTo(connection: Connection): boolean {
    return (
      this.to == connection.from ||
      this.to == connection.to ||
      this.from == connection.to ||
      this.from == connection.from
    );
  }

  clone(): Connection {
    const clone = new Connection(this.from, this.to, this.trains, this.color1);
    clone.color2 = this.color2;
    return clone;
  }

  hasSameCities(other: Connection): boolean {
    return this.contains(other.from) && this.contains(other.to);
  }

  static getTrains(connections: Connection[]): number {
    return connections.map((c) => c.trains).reduce((sum, t) => sum + t, 0);
  }

  static getWeight(connections: Connection[]): number {
    return connections.map((c) => c.weight).reduce((sum, t) => sum + t, 0);
  }

  getPoints(): number {
    switch (this.trains) {
      case 1: {
        return 1;
      }
      case 2: {
        return 2;
      }
      case 3: {
        return 4;
      }
      case 4: {
        return 7;
      }
      case 5: {
        return 10;
      }
      case 6: {
        return 15;
      }
    }
    throw new Error(
      'Connection can not have more than 6 trains: ' + this.trains,
    );
  }

  getDifficulty(): number {
    let factor = 1;
    if (this.color1 === TrackColor.Gray) factor = 0.5;
    return factor * this.getPoints();
  }
}
