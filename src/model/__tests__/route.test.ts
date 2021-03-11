import { City } from 'model/city';
import { Connection } from 'model/connection';
import { Route } from 'model/route';
import { TrackColor } from 'model/trackColor';

test('route1', () => {
  let from = new City('from');
  let to = new City('to');
  let connection = new Connection(from, to, 3, TrackColor.Red);
  let route = new Route([connection]);

  expect(route.actionLength()).toBe(1);
});

test('route', () => {
  let from = new City('from');
  let to = new City('to');
  let connection = new Connection(from, to, 3, TrackColor.Red);
  let route = new Route([connection]);

  expect(route.trainLength()).toBe(3);
});
