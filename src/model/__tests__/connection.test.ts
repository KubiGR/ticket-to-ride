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

test('isEqual two same from to', () => {
  const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
  const connection2 = new Connection('a', 'b', 5, TrackColor.Red);
  expect(connection1.isEqual(connection2)).toBe(true);
});

test('isEqual two inverse from to', () => {
  const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
  const connection2 = new Connection('b', 'a', 5, TrackColor.Red);
  expect(connection1.isEqual(connection2)).toBe(true);
});

test('isEqual two unequal', () => {
  const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
  const connection2 = new Connection('b', 'c', 5, TrackColor.Red);
  expect(connection1.isEqual(connection2)).toBe(false);
});

test('isEqual two unequal 2', () => {
  const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
  const connection2 = new Connection('a', 'c', 5, TrackColor.Red);
  expect(connection1.isEqual(connection2)).toBe(false);
});
