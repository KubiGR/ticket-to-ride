import { City } from 'model/city';
import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';

test('connection', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  expect(connection.from.name).toBe('from');
  expect(connection.to.name).toBe('to');
  expect(connection.distance).toBe(3);
  expect(connection.color1).toBe(TrackColor.Red);
  expect(connection.color2).toBeUndefined();
});
