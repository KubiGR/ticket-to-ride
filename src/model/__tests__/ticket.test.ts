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
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const mission = new Ticket('from', 'final', 10);

  expect(mission.completedBy(route)).toBe(true);
});

test('routeNotCompletesMission', () => {
  const connection1 = new Connection('from', 'to', 3, TrackColor.Red);
  const connection2 = new Connection('to', 'final', 4, TrackColor.Black);
  const route = new Route([connection1, connection2]);
  const mission = new Ticket('from', 'not', 10);

  expect(mission.completedBy(route)).toBe(false);
});
