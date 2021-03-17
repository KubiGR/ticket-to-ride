import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';

test('connection', () => {
  const connection = new Connection('from', 'to', 3, TrackColor.Red);
  expect(connection.from).toBe('from');
  expect(connection.to).toBe('to');
  expect(connection.weight).toBe(3);
  expect(connection.color1).toBe(TrackColor.Red);
  expect(connection.color2).toBeUndefined();
});
