import { getUSAConnectionsFromJSON } from 'model/usaMap';

test('readUsaConnections', () => {
  const connections = getUSAConnectionsFromJSON();
  expect(connections.length).toBe(78);
});
