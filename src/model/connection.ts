import { City } from './city';
import { TrackColor } from './trackColor';

export class Connection {
    from: City;
    to: City;
    length: number;
    color1: TrackColor;
    color2: TrackColor | undefined;

    constructor(from: City, to: City, length: number, color1: TrackColor) {
        this.from = from;
        this.to = to;
        this.length = length;
        this.color1 = color1;
    }
}
