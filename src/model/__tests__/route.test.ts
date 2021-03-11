import { City } from 'model/city';
import { Connection } from 'model/connection';
import { Route } from 'model/route';
import { TrackColor } from 'model/trackColor';

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
    const route = new Route([connection1, connection2]);
  }).toThrow();
});

test('route', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});
