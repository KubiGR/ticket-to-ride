import { City } from 'model/city';
import { Connection } from 'model/connection';
import { Mission } from 'model/mission';
import { Route } from 'model/route';
import { TrackColor } from 'model/trackColor';

test('mission', () => {
  const mission = new Mission(new City('a'), new City('b'), 3);
  expect(mission.from.name).toBe('a');
  expect(mission.to.name).toBe('b');
  expect(mission.points).toBe(3);
});

test('routeCompletesMission', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const mission = new Mission(from, final, 10);

  expect(mission.completedBy(route)).toBe(true);
});

test('routeNotCompletesMission', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from, to, 3, TrackColor.Red);
  const connection2 = new Connection(to, final, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const notInRoute = new City('not');
  const mission = new Mission(from, notInRoute, 10);

  expect(mission.completedBy(route)).toBe(false);
});
