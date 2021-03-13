import { City } from '../city';
import { Connection } from '../connection';
import { Route } from '../route';
import { TrackColor } from '../trackColor';

test('route1', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.actionLength()).toBe(1);
});

test('singleRouteTrainLength', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});

test('doubleRouteLength', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route.actionLength()).toBe(2);
});

test('doubleRouteTrainLength', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route.trainLength()).toBe(7);
});

test('invalidRoute', () => {
  const from = new City('from');
  const to1 = new City('to1');
  const to2 = new City('to2');
  const final = new City('final');
  const connection1 = new Connection(from, to1, 3, TrackColor.Red);
  const connection2 = new Connection(to2, final, 4, TrackColor.Black);

  expect(() => {
    new Route([connection1, connection2]);
  }).toThrow();
});

test('validRoute', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route).toBeTruthy();
});

test('validRouteRever', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection2, connection1]);

  expect(route).toBeTruthy();
});

test('route', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});
