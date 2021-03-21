import { Connection } from 'model/connection';
import { Ticket } from 'model/ticket';
import { TrackColor } from 'model/trackColor';

test('mission', () => {
  const mission = new Ticket('a', 'b', 3);
  expect(mission.from).toBe('a');
  expect(mission.to).toBe('b');
  expect(mission.points).toBe(3);
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
