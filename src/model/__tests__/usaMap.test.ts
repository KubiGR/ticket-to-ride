import { cities, connections } from 'model/usaMap';

test('readUsaConnections', () => {
  expect(cities.length).toBe(36);
  expect(connections.length).toBe(78);
});
