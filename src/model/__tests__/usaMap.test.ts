import { usaMap } from 'model/usaMap';

test('readUsaConnections', () => {
  const connections = usaMap.getConnections();
  expect(connections.length).toBe(78);
});
