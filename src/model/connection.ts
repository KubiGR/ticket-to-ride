import { TrackColor } from 'model/trackColor';
import { Edge } from 'floyd-warshall-shortest';

export class Connection implements Edge<string> {
  from: string;
  to: string;
  weight: number;
  color1: TrackColor;
  color2: TrackColor | undefined;

  constructor(from: string, to: string, length: number, color1: TrackColor) {
    this.from = from;
    this.to = to;
    this.weight = length;
    this.color1 = color1;
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
    const clone = new Connection(this.from, this.to, this.weight, this.color1);
    clone.color2 = this.color2;
    return clone;
  }

  isEqual(other: Connection): boolean {
    return this.contains(other.from) && this.contains(other.to);
  }

  static getTrains(connections: Connection[]): number {
    return connections.map((c) => c.weight).reduce((sum, t) => sum + t, 0);
  }
}
