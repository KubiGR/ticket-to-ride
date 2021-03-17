import { Connection } from 'model/connection';
import { Route } from 'model/route';
import { TrackColor } from 'model/trackColor';

test('route1', () => {
  const connection = new Connection('from', 'to', 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.actionLength()).toBe(1);
});

test('singleRouteTrainLength', () => {
  const connection = new Connection('from', 'to', 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});

test('doubleRouteLength', () => {
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route.actionLength()).toBe(2);
});

test('doubleRouteTrainLength', () => {
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route.trainLength()).toBe(7);
});

test('invalidRoute', () => {
  const connection1 = new Connection('from', 'to1', 3, TrackColor.Red);
  const connection2 = new Connection('to2', 'final', 4, TrackColor.Black);

  expect(() => {
    new Route([connection1, connection2]);
  }).toThrow();
});

test('validRoute', () => {
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);

  expect(route).toBeTruthy();
});

test('validRouteRever', () => {
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection2, connection1]);

  expect(route).toBeTruthy();
});

test('route', () => {
  const connection = new Connection('from', 'to', 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});
