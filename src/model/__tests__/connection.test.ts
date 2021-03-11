import { City } from 'model/city';
import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';

test('connection', () => {
    let from = new City('from');
    let to = new City('to');
    let connection = new Connection(from, to, 3, TrackColor.Red);
    expect(connection.from.name).toBe('from');
    expect(connection.to.name).toBe('to');
    expect(connection.length).toBe(3);
    expect(connection.color1).toBe(TrackColor.Red);
    expect(connection.color2).toBeUndefined();
});