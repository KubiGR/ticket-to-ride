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

test('route', () => {
  const from = new City('from');
  const to = new City('to');
  const connection = new Connection(from, to, 3, TrackColor.Red);
  const route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});
