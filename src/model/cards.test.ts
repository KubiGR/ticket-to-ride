import { add, cardsForConnections, makeTC, printTC, TC } from './cards';
import { GameNetwork } from './gameNetwork';
import { usaMap } from './usaMap';
test('add same trains', () => {
  const total = add(makeTC(3, 'Green'), makeTC(4, 'Green'));
  expect(total.length).toBe(1);
  expect(total[0].get('Green')).toBe(7);
});

test('add different trains', () => {
  const total = add(makeTC(3, 'Green'), makeTC(4, 'Blue'));
  expect(total.length).toBe(1);
  expect(total[0].get('Green')).toBe(3);
  expect(total[0].get('Blue')).toBe(4);
});

test('add choice to conns', () => {
  const total = add(makeTC(4, 'Green'), makeTC(3, 'Green', 'Blue'));
  expect(total.length).toBe(2);
  expect(total[0].get('Green')).toBe(7);
  expect(total[1].get('Green')).toBe(4);
  expect(total[1].get('Blue')).toBe(3);
});

test('add 2 choices', () => {
  const total = add(makeTC(4, 'Green', 'Black'), makeTC(3, 'Green', 'Blue'));

  expect(total.length).toBe(4);
  expect(total[0].get('Green')).toBe(7);

  expect(total[1].get('Green')).toBe(4);
  expect(total[1].get('Blue')).toBe(3);

  expect(total[2].get('Black')).toBe(4);
  expect(total[2].get('Green')).toBe(3);

  expect(total[3].get('Black')).toBe(4);
  expect(total[3].get('Blue')).toBe(3);
});

test.skip('San Francisco Atlanta connections', () => {
  const g = new GameNetwork().getRouting();
  const conns = [
    g.getConnection('San Francisco', 'Salt Lake City'),
    g.getConnection('Salt Lake City', 'Denver'),
    g.getConnection('Denver', 'Kansas City'),
    g.getConnection('Kansas City', 'Saint Louis'),
    g.getConnection('Saint Louis', 'Pittsburgh'),
  ];
  console.log(printTC(cardsForConnections(conns)));
});

test('Calgary Salt Lake City', () => {
  const g = new GameNetwork().getRouting();
  const conns = g.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets([
    usaMap.getTicket('Calgary', 'Salt Lake City'),
  ]);
  expect(printTC(cardsForConnections(conns))).toBe('(3) Purple   (4) Gray   ');
});

test.skip('all usa tickets connections', () => {
  const g = new GameNetwork().getRouting();
  const conns = g.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
    usaMap.getTickets(),
  );
  console.log(printTC(cardsForConnections(conns)));
});
