import { usaMap } from 'model/usaMap';

test('readUsaConnections', () => {
  const connections = usaMap.getConnections();
  expect(connections.length).toBe(78);
});

test('readUsaTickets', () => {
  const tickets = usaMap.getTickets();
  expect(tickets.length).toBe(30);
});
