import { Constants } from 'model/constants';
import { GameNetwork } from 'model/gameNetwork';
import { Ticket } from 'model/ticket';
import { usaMap } from 'model/usaMap';

describe('getRouting().getShortestPath', () => {
  test('with no restrictions', () => {
    const gameNetwork = new GameNetwork();
    expect(
      gameNetwork.getRouting().getShortestPath('Los Angeles', 'Denver'),
    ).toEqual(['Los Angeles', 'Phoenix', 'Denver']);
  });

  test('with established', () => {
    const gameNetwork = new GameNetwork();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    gameNetwork.addEstablished(connection);

    const path = gameNetwork
      .getRouting()
      .getShortestPath('Los Angeles', 'Denver');
    expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
  });

  test('getShortestPath with established (inverse)', () => {
    const gameNetwork = new GameNetwork();
    const connection = gameNetwork
      .getRouting()
      .getConnection('El Paso', 'Los Angeles');
    gameNetwork.addEstablished(connection);

    const path = gameNetwork
      .getRouting()
      .getShortestPath('Los Angeles', 'Denver');
    expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
  });
});

test('getConnectionForPath', () => {
  const gameNetwork = new GameNetwork();
  const path = ['Los Angeles', 'Phoenix', 'Denver'];
  const connections = gameNetwork.getRouting().getConnectionsForPath(path);
  expect(connections).toEqual([
    {
      from: 'Phoenix',
      to: 'Los Angeles',
      weight: 3,
      trains: 3,
      color1: 'Gray',
    },
    {
      from: 'Phoenix',
      to: 'Denver',
      weight: 5,
      trains: 5,
      color1: 'White',
    },
  ]);
});

test('getConnection  (not found)', () => {
  const gameNetwork = new GameNetwork();
  expect(() => {
    gameNetwork.getRouting().getConnection('What', 'El Paso');
  }).toThrow();
});

test('addCannotPass error when in should pass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork
    .getRouting()
    .getConnection('Los Angeles', 'El Paso');
  gameNetwork.addEstablished(connection);

  expect(() => {
    gameNetwork.addCannotPass(connection);
  }).toThrow();
});

test('addEstablished error when in cannot pass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork
    .getRouting()
    .getConnection('Los Angeles', 'El Paso');
  gameNetwork.addCannotPass(connection);

  expect(() => {
    gameNetwork.addEstablished(connection);
  }).toThrow();
});

test('established connections reduce train number', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork
    .getRouting()
    .getConnection('El Paso', 'Los Angeles');
  gameNetwork.addEstablished(connection);

  expect(gameNetwork.getAvailableTrains()).toEqual(
    Constants.TOTAL_TRAINS - connection.trains,
  );
});

test('getShortestPath with cannotPass 1', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork
    .getRouting()
    .getConnection('Phoenix', 'Denver');
  gameNetwork.addCannotPass(connection);

  const path = gameNetwork
    .getRouting()
    .getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'Phoenix', 'Santa Fe', 'Denver']);
});

test('getShortestPath with cannotPass 2', () => {
  const gameNetwork = new GameNetwork();
  const connection1 = gameNetwork
    .getRouting()
    .getConnection('Phoenix', 'Denver');
  const connection2 = gameNetwork
    .getRouting()
    .getConnection('Phoenix', 'Santa Fe');
  gameNetwork.addCannotPass(connection1);
  gameNetwork.addCannotPass(connection2);

  const path = gameNetwork
    .getRouting()
    .getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual([
    'Los Angeles',
    'Las Vegas',
    'Salt Lake City',
    'Denver',
  ]);
});

test('getShortestPath with cannotPass 2', () => {
  const gameNetwork = new GameNetwork();
  const connection1 = gameNetwork
    .getRouting()
    .getConnection('Vancouver', 'Calgary');
  const connection2 = gameNetwork
    .getRouting()
    .getConnection('Vancouver', 'Seattle');
  gameNetwork.addCannotPass(connection1);
  gameNetwork.addCannotPass(connection2);

  const path = gameNetwork.getRouting().getShortestPath('Vancouver', 'Denver');
  expect(path).toEqual([]);
});

test('cities', () => {
  const gameNetwork = new GameNetwork();
  expect(
    gameNetwork
      .getRouting()
      .getShortestVisitingPath(['Denver', 'Los Angeles', 'Chicago']),
  ).toEqual(['Los Angeles', 'Phoenix', 'Denver', 'Omaha', 'Chicago']);
});

test('getShortestPathArray of cities', () => {
  const gameNetwork = new GameNetwork();
  expect(
    gameNetwork
      .getRouting()
      .getShortestVisitingPath(['Calgary', 'Salt Lake City', 'Phoenix']),
  ).toEqual(['Calgary', 'Helena', 'Salt Lake City', 'Denver', 'Phoenix']);
});

test('getShortestPathArray unknown cities', () => {
  const gameNetwork = new GameNetwork();

  expect(() => {
    gameNetwork
      .getRouting()
      .getShortestVisitingPath(['What?', 'Phoenix', 'Denver']);
  }).toThrow();
});

test('findSpanningTree', () => {
  const gameNetwork = new GameNetwork();
  const solution = gameNetwork
    .getRouting()
    .getConnectionsOfMinSpanningTreeOfShortestRoutes([
      'Winnipeg',
      'Duluth',
      'Oklahoma City',
      'El Paso',
      'Toronto',
      'New Orleans',
    ]);
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Winnipeg', 'Duluth'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Omaha', 'Duluth'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Omaha', 'Kansas City'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Kansas City', 'Oklahoma City'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Duluth', 'Sault St. Marie'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Sault St. Marie', 'Toronto'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Oklahoma City', 'El Paso'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Oklahoma City', 'Dallas'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Dallas', 'Houston'),
    ),
  );
  expect(
    solution.includes(
      gameNetwork.getRouting().getConnection('Houston', 'New Orleans'),
    ),
  );
});

test('findSpanningTree throws unknown city', () => {
  const gameNetwork = new GameNetwork();
  expect(() => {
    gameNetwork
      .getRouting()
      .getConnectionsOfMinSpanningTreeOfShortestRoutes([
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

  const connections = gameNetwork
    .getRouting()
    .getConnectionsForPath(
      gameNetwork
        .getRouting()
        .getShortestVisitingPath(Ticket.getCities(tickets)),
    );
  const points = gameNetwork.getRouting().getGainPoints(tickets, connections);
  expect(points).toBe(13 + 7 + 7 + 10);
  const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
  expect(trains).toBe(13);
});

test('Execution scenario for a ticket and an established line not in the connections', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [new Ticket('Calgary', 'Phoenix', 13)];
  gameNetwork.addEstablished(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );

  const connections = gameNetwork
    .getRouting()
    .getConnectionsForPath(
      gameNetwork
        .getRouting()
        .getShortestVisitingPath(Ticket.getCities(tickets)),
    );
  const points = gameNetwork.getRouting().getGainPoints(tickets, connections);
  expect(points).toBe(13 + 7 + 7 + 10);
  const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
  expect(trains).toBe(13);
});

test('Execution scenario for a ticket and an established line WITHIN in the connections', () => {
  const gameNetwork = new GameNetwork();

  // const tickets = getUSATicketsFromJSON();
  const tickets = [new Ticket('Calgary', 'Phoenix', 13)];
  gameNetwork.addEstablished(
    gameNetwork.getRouting().getConnection('Helena', 'Calgary'),
  );

  const connections = gameNetwork
    .getRouting()
    .getConnectionsForPath(
      gameNetwork
        .getRouting()
        .getShortestVisitingPath(Ticket.getCities(tickets)),
    );
  const points = gameNetwork.getRouting().getGainPoints(tickets, connections);
  expect(points).toBe(13 + 0 + 7 + 10);
  const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
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

  const connections = gameNetwork
    .getRouting()
    .getConnectionsForPath(
      gameNetwork
        .getRouting()
        .getShortestVisitingPath(Ticket.getCities(tickets)),
    );
  const points = gameNetwork.getRouting().getGainPoints(tickets, connections);
  expect(points).toBe(
    32 + 7 + 4 + 4 + 10 + 4 + 7 + 1 + 2 + 15 + 7 + 2 + 2 + 2 + 2,
  );
  const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
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
  gameNetwork.addEstablished(
    gameNetwork.getRouting().getConnection('Boston', 'New York'),
  );
  const connections = gameNetwork
    .getRouting()
    .getConnectionsForPath(
      gameNetwork
        .getRouting()
        .getShortestVisitingPath(Ticket.getCities(tickets)),
    );
  const points = gameNetwork.getRouting().getGainPoints(tickets, connections);
  expect(points).toBe(32 + 7 + 4 + 4 + 10 + 4 + 7 + 1 + 2 + 15 + 7 + 2 + 2 + 2);
  const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
  expect(trains).toBe(41); // two less trains needed
});

test('getOpt should return a route between Calgary and Helena when Vancouver is closed', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
  );

  const connections = gameNetwork
    .getRouting()
    .getOptConnectionsOfMinSpanningTreeOfShortestRoutes(['Calgary', 'Helena']);
  expect(connections.length).toBe(1);
});

test('Add and remove cannot pass', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  let connections = gameNetwork
    .getRouting()
    .getOptConnectionsOfMinSpanningTreeOfShortestRoutes([
      'Calgary',
      'Vancouver',
    ]);
  expect(connections.length).toBe(2);
  gameNetwork.removeCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  connections = gameNetwork
    .getRouting()
    .getOptConnectionsOfMinSpanningTreeOfShortestRoutes([
      'Calgary',
      'Vancouver',
    ]);
  expect(connections.length).toBe(1);
});

test('reachable city', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );

  expect(gameNetwork.getRouting().isCityReachable('Vancouver')).toBe(true);
});
test('not reachable city', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
  );

  expect(gameNetwork.getRouting().isCityReachable('Vancouver')).toBe(false);
});

test('not reachable Ticket', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
  );

  expect(
    gameNetwork
      .getRouting()
      .isTicketReachable(usaMap.getTicket('Vancouver', 'Santa Fe')),
  ).toBe(false);
});
test('reachable Ticket', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );

  expect(
    gameNetwork
      .getRouting()
      .isTicketReachable(usaMap.getTicket('Vancouver', 'Santa Fe')),
  ).toBe(true);
});

test('1 Ticket with Not reachable city', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
  );

  const connections = gameNetwork
    .getRouting()
    .getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets([
      usaMap.getTicket('Vancouver', 'Santa Fe'),
    ]);

  expect(connections.length).toBe(0);
});

test('2 Tickets, one with a not reachable city, returns a route for the reachable ticket', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
  );
  gameNetwork.addCannotPass(
    gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
  );

  const connections = gameNetwork
    .getRouting()
    .getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets([
      usaMap.getTicket('Vancouver', 'Santa Fe'),
      usaMap.getTicket('Boston', 'Miami'),
    ]);

  expect(connections.length > 0).toBe(true);
});
