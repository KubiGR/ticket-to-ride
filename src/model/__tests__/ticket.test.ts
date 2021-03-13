import { City } from '../city';
import { Connection } from '../connection';
import { Route } from '../route';
import { Ticket } from '../ticket';
import { TrackColor } from '../trackColor';

test('mission', () => {
  const mission = new Ticket(new City('a'), new City('b'), 3);
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
  const mission = new Ticket(from, final, 10);

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
  const mission = new Ticket(from, notInRoute, 10);

  expect(mission.completedBy(route)).toBe(false);
});
