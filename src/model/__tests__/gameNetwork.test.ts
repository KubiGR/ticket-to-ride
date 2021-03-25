import { Constants } from 'model/constants';
import { GameNetwork } from 'model/gameNetwork';
import { Ticket } from 'model/ticket';
import { usaMap } from 'model/usaMap';

describe('opponent', () => {
  test('is created', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();

    expect(gameNetwork.getOpponentNetwork()).toBeTruthy();
  });
  test('has no opponent defined (to avoid infinite recursion)', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();

    const opponent = gameNetwork.getOpponentNetwork();
    if (opponent) expect(opponent.getOpponentNetwork()).toBeUndefined();
  });
});

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

describe('addCannotPass/established restrictions', () => {
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

    const path = gameNetwork
      .getRouting()
      .getShortestPath('Vancouver', 'Denver');
    expect(path).toEqual([]);
  });
});

describe('getShortestVisitingPath', () => {
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
});

describe('findSpanningTree', () => {
  test('works', () => {
    const g = new GameNetwork().getRouting();
    const c = g.getConnectionsOfMinSpanningTreeOfShortestRoutes([
      'Winnipeg',
      'Duluth',
      'Oklahoma City',
      'El Paso',
      'Toronto',
      'New Orleans',
    ]);
    expect(c.includes(g.getConnection('Winnipeg', 'Duluth')));
    expect(c.includes(g.getConnection('Omaha', 'Duluth')));
    expect(c.includes(g.getConnection('Omaha', 'Kansas City')));
    expect(c.includes(g.getConnection('Kansas City', 'Oklahoma City')));
    expect(c.includes(g.getConnection('Duluth', 'Sault St. Marie')));
    expect(c.includes(g.getConnection('Sault St. Marie', 'Toronto')));
    expect(c.includes(g.getConnection('Oklahoma City', 'El Paso')));
    expect(c.includes(g.getConnection('Oklahoma City', 'Dallas')));
    expect(c.includes(g.getConnection('Dallas', 'Houston')));
    expect(c.includes(g.getConnection('Houston', 'New Orleans')));
  });

  test('throws unknown city', () => {
    const g = new GameNetwork().getRouting();
    expect(() => {
      g.getConnectionsOfMinSpanningTreeOfShortestRoutes([
        'Duluth',
        'Oklahoma City',
        'What??',
        'Toronto',
        'New Orleans',
      ]);
    }).toThrow();
  });
});

describe('getShortestVisitingPath / getGainPoints getRequiredNumOfTrains', () => {
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
    expect(points).toBe(
      32 + 7 + 4 + 4 + 10 + 4 + 7 + 1 + 2 + 15 + 7 + 2 + 2 + 2,
    );
    const trains = gameNetwork.getRouting().getRequiredNumOfTrains(connections);
    expect(trains).toBe(41); // two less trains needed
  });
});

describe('getOptConnectionsOfMinSpanningTreeOfShortestRoutes', () => {
  test('should return a route between Calgary and Helena when Vancouver is closed', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.addCannotPass(
      gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
    );
    gameNetwork.addCannotPass(
      gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
    );

    const connections = gameNetwork
      .getRouting()
      .getOptConnectionsOfMinSpanningTreeOfShortestRoutes([
        'Calgary',
        'Helena',
      ]);
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
});

describe('getRouting().isCityReachable', () => {
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
});

describe('.getRouting().isTicketReachable', () => {
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
});

describe('getRouting().getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets', () => {
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
});

describe('getExpectedPointsDrawingTickets', () => {
  test('should return zero if no tracks on board', async () => {
    const gameNetwork = new GameNetwork();
    expect((await gameNetwork.getExpectedPointsDrawingTickets(10)) == 0).toBe(
      true,
    );
  });
  test('should return the expected points if a player draws tickets', async () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Calgary', 'Helena'),
    );
    const points = await gameNetwork.getExpectedPointsDrawingTickets(10);
    expect(points > 0).toBe(true);
  });
});

describe('getExpectedPointsFromTickets', () => {
  let gameNetwork: GameNetwork;

  beforeEach(() => {
    gameNetwork = new GameNetwork();
  });

  test('when no tickets are reachable should return minus the smallest points ', () => {
    gameNetwork.addCannotPass(
      gameNetwork.getRouting().getConnection('Vancouver', 'Calgary'),
    );
    gameNetwork.addCannotPass(
      gameNetwork.getRouting().getConnection('Vancouver', 'Seattle'),
    );
    const tickets = [
      usaMap.getTicket('Vancouver', 'Santa Fe'),
      usaMap.getTicket('Vancouver', 'Montreal'),
    ];
    const points = gameNetwork.getExpectedPointsFromTickets(tickets);

    expect(points).toBe(-13);
  });
  test('when all tickets are already completed should return their sum', () => {
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Calgary', 'Helena'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Helena'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Las Vegas'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Las Vegas', 'Los Angeles'),
    );
    const tickets = [
      usaMap.getTicket('Calgary', 'Salt Lake City'),
      usaMap.getTicket('Helena', 'Los Angeles'),
    ];
    const points = gameNetwork.getExpectedPointsFromTickets(tickets);

    expect(points).toBe(15);
  });

  test('when a ticket can be completed count it', () => {
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Calgary', 'Helena'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Helena'),
    );

    const tickets = [
      usaMap.getTicket('Calgary', 'Salt Lake City'),
      usaMap.getTicket('Los Angeles', 'Miami'),
      usaMap.getTicket('Vancouver', 'Montreal'),
    ];
    const points = gameNetwork.getExpectedPointsFromTickets(tickets);

    expect(points > 7).toBe(true);
  });

  test('when a ticket cannot be completed due to trains it should not count', () => {
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Calgary', 'Helena'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Helena'),
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    gameNetwork.availableTrains = 3;
    const tickets = [
      usaMap.getTicket('Calgary', 'Salt Lake City'),
      usaMap.getTicket('Los Angeles', 'Miami'),
      usaMap.getTicket('Vancouver', 'Montreal'),
    ];
    const points = gameNetwork.getExpectedPointsFromTickets(tickets);

    expect(points).toBe(7);
  });
});

describe('selectTicketsToKeep', () => {
  let gameNetwork: GameNetwork;

  beforeEach(() => {
    gameNetwork = new GameNetwork();
  });
  test('2 tickets possible out of 3, keep the most points', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    gameNetwork.availableTrains = 15;

    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Las Vegas'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Helena'),
    );

    const tickets = [
      usaMap.getTicket('Calgary', 'Salt Lake City'),
      usaMap.getTicket('Helena', 'Los Angeles'),
      usaMap.getTicket('Seattle', 'Los Angeles'),
    ];

    const expected = [
      usaMap.getTicket('Helena', 'Los Angeles'),
      usaMap.getTicket('Seattle', 'Los Angeles'),
    ];
    const kept = gameNetwork.selectTicketsToKeep(tickets);
    expect(kept).toEqual(expected);
  });

  test('keep all', () => {
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Las Vegas'),
    );
    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Salt Lake City', 'Helena'),
    );

    const tickets = [
      usaMap.getTicket('Calgary', 'Salt Lake City'),
      usaMap.getTicket('Helena', 'Los Angeles'),
      usaMap.getTicket('Seattle', 'Los Angeles'),
    ];

    const kept = gameNetwork.selectTicketsToKeep(tickets);
    expect(kept).toEqual(tickets);
  });
});
