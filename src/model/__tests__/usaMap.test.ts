import { usaMap } from 'model/usaMap';

test('readUsaConnections', () => {
  const connections = usaMap.getConnections();
  expect(connections.length).toBe(78);
});

test('readUsaTickets', () => {
  const tickets = usaMap.getTickets();
  expect(tickets.length).toBe(30);
});

describe('getTicket', () => {
  test('returns ticket', () => {
    expect(usaMap.getTicket('Calgary', 'Salt Lake City')).toBeDefined();
  });
  test('returns ticket', () => {
    expect(usaMap.getTicket('Salt Lake City', 'Calgary')).toBeDefined();
  });
  test('throw error', () => {
    expect(() => {
      usaMap.getTicket('Vancouver', 'Calgary');
    }).toThrow();
  });
});
