import { City } from 'model/city';
import { Connection } from 'model/connection';
import { Route } from 'model/route';
import { Ticket } from 'model/ticket';
import { TrackColor } from 'model/trackColor';

test('mission', () => {
  const mission = new Ticket('a', 'b', 3);
  expect(mission.from).toBe('a');
  expect(mission.to).toBe('b');
  expect(mission.points).toBe(3);
});

test('routeCompletesMission', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from.name, to.name, 3, TrackColor.Red);
  const connection2 = new Connection(to.name, final.name, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const mission = new Ticket(from.name, final.name, 10);

  expect(mission.completedBy(route)).toBe(true);
});

test('routeNotCompletesMission', () => {
  const from = new City('from');
  const to = new City('to');
  const final = new City('final');
  const connection1 = new Connection(from.name, to.name, 3, TrackColor.Red);
  const connection2 = new Connection(to.name, final.name, 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const notInRoute = new City('not');
  const mission = new Ticket(from.name, notInRoute.name, 10);

  expect(mission.completedBy(route)).toBe(false);
});
