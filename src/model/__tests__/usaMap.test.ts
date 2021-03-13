import { getUSAConnectionsFromJSON } from '../usaMap';

test('readUsaConnections', () => {
  const connections = getUSAConnectionsFromJSON();
  expect(connections.length).toBe(78);
});
