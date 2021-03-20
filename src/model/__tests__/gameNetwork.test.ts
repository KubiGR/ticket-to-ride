import { Constants } from 'model/constants';
import { GameNetwork } from 'model/gameNetwork';
import { Ticket } from 'model/ticket';

test('getShortestPath no restrictions', () => {
  const gameNetwork = new GameNetwork();
  expect(gameNetwork.getShortestPath('Los Angeles', 'Denver')).toEqual([
    'Los Angeles',
    'Phoenix',
    'Denver',
  ]);
});

test('getConnectionForPath', () => {
  const gameNetwork = new GameNetwork();
  const path = ['Los Angeles', 'Phoenix', 'Denver'];
  const connections = gameNetwork.getConnectionsForPath(path);
  expect(connections).toEqual([
    {
      from: 'Phoenix',
      to: 'Los Angeles',
      weight: 3,
      color1: 'Gray',
    },
    {
      from: 'Phoenix',
      to: 'Denver',
      weight: 5,
      color1: 'White',
    },
  ]);
});

test('getConnection  (not found)', () => {
  const gameNetwork = new GameNetwork();
  expect(() => {
    gameNetwork.getConnection('What', 'El Paso');
  }).toThrow();
});

test('addCannotPass error when in should pass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Los Angeles', 'El Paso');
  gameNetwork.addEstablished(connection);

  expect(() => {
    gameNetwork.addCannotPass(connection);
  }).toThrow();
});

test('addShouldPass error when in cannot pass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Los Angeles', 'El Paso');
  gameNetwork.addCannotPass(connection);

  expect(() => {
    gameNetwork.addEstablished(connection);
  }).toThrow();
});

test('getShortestPath with shouldPass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Los Angeles', 'El Paso');
  gameNetwork.addEstablished(connection);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
});

test('getShortestPath with shouldPass (inverse)', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('El Paso', 'Los Angeles');
  gameNetwork.addEstablished(connection);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
});

test('established connections reduce train number', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('El Paso', 'Los Angeles');
  gameNetwork.addEstablished(connection);

  expect(gameNetwork.getAvailableTrains()).toEqual(
    Constants.TOTAL_TRAINS - connection.weight,
  );
});

test('getShortestPath with cannotPass 1', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Phoenix', 'Denver');
  gameNetwork.addCannotPass(connection);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'Phoenix', 'Santa Fe', 'Denver']);
});

test('getShortestPath with cannotPass 2', () => {
  const gameNetwork = new GameNetwork();
  const connection1 = gameNetwork.getConnection('Phoenix', 'Denver');
  const connection2 = gameNetwork.getConnection('Phoenix', 'Santa Fe');
  gameNetwork.addCannotPass(connection1);
  gameNetwork.addCannotPass(connection2);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual([
    'Los Angeles',
    'Las Vegas',
    'Salt Lake City',
    'Denver',
  ]);
});

test('getShortestPath with cannotPass 2', () => {
  const gameNetwork = new GameNetwork();
  const connection1 = gameNetwork.getConnection('Vancouver', 'Calgary');
  const connection2 = gameNetwork.getConnection('Vancouver', 'Seattle');
  gameNetwork.addCannotPass(connection1);
  gameNetwork.addCannotPass(connection2);

  const path = gameNetwork.getShortestPath('Vancouver', 'Denver');
  expect(path).toEqual([]);
});

test('cities', () => {
  const gameNetwork = new GameNetwork();
  expect(
    gameNetwork.getShortestVisitingPath(['Denver', 'Los Angeles', 'Chicago']),
  ).toEqual(['Los Angeles', 'Phoenix', 'Denver', 'Omaha', 'Chicago']);
});

test('getShortestPathArray of cities', () => {
  const gameNetwork = new GameNetwork();
  expect(
    gameNetwork.getShortestVisitingPath([
      'Calgary',
      'Salt Lake City',
      'Phoenix',
    ]),
  ).toEqual(['Calgary', 'Helena', 'Salt Lake City', 'Denver', 'Phoenix']);
});

test('getShortestPathArray unknown cities', () => {
  const gameNetwork = new GameNetwork();

  expect(() => {
    gameNetwork.getShortestVisitingPath(['What?', 'Phoenix', 'Denver']);
  }).toThrow();
});

test('findSpanningTree', () => {
  const gameNetwork = new GameNetwork();
  const solution = gameNetwork.getConnectionsOfMinSpanningTreeOfShortestRoutes([
    'Winnipeg',
    'Duluth',
    'Oklahoma City',
    'El Paso',
    'Toronto',
    'New Orleans',
  ]);
  expect(solution.includes(gameNetwork.getConnection('Winnipeg', 'Duluth')));
  expect(solution.includes(gameNetwork.getConnection('Omaha', 'Duluth')));
  expect(solution.includes(gameNetwork.getConnection('Omaha', 'Kansas City')));
  expect(
    solution.includes(
      gameNetwork.getConnection('Kansas City', 'Oklahoma City'),
    ),
  );
  expect(
    solution.includes(gameNetwork.getConnection('Duluth', 'Sault St. Marie')),
  );
  expect(
    solution.includes(gameNetwork.getConnection('Sault St. Marie', 'Toronto')),
  );
  expect(
    solution.includes(gameNetwork.getConnection('Oklahoma City', 'El Paso')),
  );
  expect(
    solution.includes(gameNetwork.getConnection('Oklahoma City', 'Dallas')),
  );
  expect(solution.includes(gameNetwork.getConnection('Dallas', 'Houston')));
  expect(
    solution.includes(gameNetwork.getConnection('Houston', 'New Orleans')),
  );
});

test('findSpanningTree throws unknown city', () => {
  const gameNetwork = new GameNetwork();
  expect(() => {
    gameNetwork.getConnectionsOfMinSpanningTreeOfShortestRoutes([
      'Duluth',
      'Oklahoma City',
      'What??',
      'Toronto',
      'New Orleans',
    ]);
  }).toThrow();
});

/**
 * Acceptance test for tickets
 */

test('Execution scenario for a ticket', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [new Ticket('Calgary', 'Phoenix', 13)];

  const connections = gameNetwork.getConnectionsForPath(
    gameNetwork.getShortestVisitingPath(Ticket.getCities(tickets)),
  );
  const points = gameNetwork.getGainPoints(tickets, connections);
  expect(points).toBe(13 + 7 + 7 + 10);
  const trains = gameNetwork.getRequiredNumOfTrains(connections);
  expect(trains).toBe(13);
});

test('Execution scenario for a ticket and an established line not in the connections', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [new Ticket('Calgary', 'Phoenix', 13)];
  gameNetwork.addEstablished(gameNetwork.getConnection('Vancouver', 'Calgary'));

  const connections = gameNetwork.getConnectionsForPath(
    gameNetwork.getShortestVisitingPath(Ticket.getCities(tickets)),
  );
  const points = gameNetwork.getGainPoints(tickets, connections);
  expect(points).toBe(13 + 7 + 7 + 10);
  const trains = gameNetwork.getRequiredNumOfTrains(connections);
  expect(trains).toBe(13);
});

test('Execution scenario for a ticket and an established line WITHIN in the connections', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [new Ticket('Calgary', 'Phoenix', 13)];
  gameNetwork.addEstablished(gameNetwork.getConnection('Helena', 'Calgary'));

  const connections = gameNetwork.getConnectionsForPath(
    gameNetwork.getShortestVisitingPath(Ticket.getCities(tickets)),
  );
  const points = gameNetwork.getGainPoints(tickets, connections);
  expect(points).toBe(13 + 0 + 7 + 10);
  const trains = gameNetwork.getRequiredNumOfTrains(connections);
  expect(trains).toBe(9);
});

test('Execution scenario for tickets', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [
    new Ticket('Boston', 'Miami', 12),
    new Ticket('Calgary', 'Salt Lake City', 7),
    new Ticket('Calgary', 'Phoenix', 13),
  ];

  const connections = gameNetwork.getConnectionsForPath(
    gameNetwork.getShortestVisitingPath(Ticket.getCities(tickets)),
  );
  const points = gameNetwork.getGainPoints(tickets, connections);
  expect(points).toBe(
    32 + 7 + 4 + 4 + 10 + 4 + 7 + 1 + 2 + 15 + 7 + 2 + 2 + 2 + 2,
  );
  const trains = gameNetwork.getRequiredNumOfTrains(connections);
  expect(trains).toBe(43);
});

test('Execution scenario for tickets with established connections', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [
    new Ticket('Boston', 'Miami', 12),
    new Ticket('Calgary', 'Salt Lake City', 7),
    new Ticket('Calgary', 'Phoenix', 13),
  ];

  // this connection exists and is part of the route
  gameNetwork.addEstablished(gameNetwork.getConnection('Boston', 'New York'));
  const connections = gameNetwork.getConnectionsForPath(
    gameNetwork.getShortestVisitingPath(Ticket.getCities(tickets)),
  );
  const points = gameNetwork.getGainPoints(tickets, connections);
  expect(points).toBe(32 + 7 + 4 + 4 + 10 + 4 + 7 + 1 + 2 + 15 + 7 + 2 + 2 + 2);
  const trains = gameNetwork.getRequiredNumOfTrains(connections);
  expect(trains).toBe(41); // two less trains needed
});

// test('given a ticket array 1 element returns connections', () => {
//   const gameNetwork = new GameNetwork();

//   const ticket = new Ticket('Kansas City', 'Houston', 5);
//   const tickets = [ticket];

//   const path = gameNetwork.getShortestVisitingPath(['Kansas City', 'Houston']);
//   const connections = gameNetwork.getConnectionsForPath(path);

//   const result = gameNetwork.getConnectionsForTickets(tickets);

//   expect(result).toEqual(connections);
//   // [
//   //   Connection {
//   //     from: 'Oklahoma City',
//   //     to: 'Kansas City',
//   //     weight: 2,
//   //     color1: 'Gray',
//   //     color2: 'Gray'
//   //   },
//   //   Connection {
//   //     from: 'Oklahoma City',
//   //     to: 'Dallas',
//   //     weight: 2,
//   //     color1: 'Gray',
//   //     color2: 'Gray'
//   //   },
//   //   Connection {
//   //     from: 'Dallas',
//   //     to: 'Houston',
//   //     weight: 1,
//   //     color1: 'Gray',
//   //     color2: 'Gray'
//   //   }
//   // ]
// });
