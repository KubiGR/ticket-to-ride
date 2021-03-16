import { City } from 'model/city';
import { TrackColor } from 'model/trackColor';
import { Edge } from 'floyd-warshall-shortest';

export class Connection implements Edge<City> {
  from: City;
  to: City;
  weight: number;
  color1: TrackColor;
  color2: TrackColor | undefined;

  constructor(from: City, to: City, length: number, color1: TrackColor) {
    this.from = from;
    this.to = to;
    this.weight = length;
    this.color1 = color1;
  }

  contains(city: City): boolean {
    return this.from.name == city.name || this.to.name == city.name;
  }
  isAdjacentTo(connection: Connection): boolean {
    return (
      this.to.name == connection.from.name ||
      this.to.name == connection.to.name ||
      this.from.name == connection.to.name ||
      this.from.name == connection.from.name
    );
  }
}
