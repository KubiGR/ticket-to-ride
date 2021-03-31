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

describe('isEqual', () => {
  test('same from to', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = new Connection('a', 'b', 5, TrackColor.Red);
    expect(connection1.hasSameCities(connection2)).toBe(true);
  });
  test('inverse from to', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = new Connection('b', 'a', 5, TrackColor.Red);
    expect(connection1.hasSameCities(connection2)).toBe(true);
  });
  test('with only a common returns false', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = new Connection('b', 'c', 5, TrackColor.Red);
    expect(connection1.hasSameCities(connection2)).toBe(false);
  });
  test('different from and to', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = new Connection('a', 'c', 5, TrackColor.Red);
    expect(connection1.hasSameCities(connection2)).toBe(false);
  });
});

describe('getTrains', () => {
  test('returns number of trains', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = new Connection('a', 'c', 5, TrackColor.Red);
    expect(Connection.getTrains([connection1, connection2])).toBe(8);
  });

  test('return 0 when collection is empty', () => {
    expect(Connection.getTrains([])).toBe(0);
  });
});

describe('clone', () => {
  test('returns a different ref', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = connection1.clone();
    expect(connection1 === connection2).toBe(false);
  });
  test('isEqual to original', () => {
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    const connection2 = connection1.clone();
    expect(connection1.hasSameCities(connection2)).toBe(true);
  });
});

describe('getPoints', () => {
  test.each([
    [1, 1],
    [2, 2],
    [3, 4],
    [4, 7],
    [5, 10],
    [6, 15],
  ])('%i trains returns %i points', (a, exp) => {
    const connection1 = new Connection('a', 'b', a, TrackColor.Black);
    expect(connection1.getPoints()).toBe(exp);
  });
  test('throws error when more trains (in the constructor)', () => {
    expect(() => {
      new Connection('a', 'b', 7, TrackColor.Black);
    }).toThrow();
  });
});
