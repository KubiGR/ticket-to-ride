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

test('getPoints', () => {
  const mission1 = new Ticket('from1', 'to1', 10);
  const mission2 = new Ticket('from2', 'to2', 5);

  expect(Ticket.getPoints([mission1, mission2])).toBe(15);
});

test('getPoints empty', () => {
  expect(Ticket.getPoints([])).toBe(0);
});

test('getCities', () => {
  const mission1 = new Ticket('from1', 'to1', 10);
  const mission2 = new Ticket('from2', 'to1', 5);

  const cities = Ticket.getCities([mission1, mission2]);
  expect(cities).toEqual(['from1', 'to1', 'from2']);
});

test('getCities empty', () => {
  expect(Ticket.getCities([])).toEqual([]);
});
