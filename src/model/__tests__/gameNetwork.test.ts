import { Connection } from 'model/connection';
import { Constants } from 'model/constants';
import { GameNetwork } from 'model/gameNetwork';
import { Ticket } from 'model/ticket';
import { TrackColor } from 'model/trackColor';
import { usaMap } from 'model/usaMap';

beforeEach(() => {
  usaMap.reset();
});

describe('createOpponent', () => {
  test('returns the index of the opponent', () => {
    const gameNetwork = new GameNetwork();
    expect(gameNetwork.createOpponent()).toBe(0);
  });
  test('next createOpponent returns the index of the next opponent', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    expect(gameNetwork.createOpponent()).toBe(1);
  });
  test('creates an opponent. Opponent is returned by getOpponentNetwork', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();

    expect(gameNetwork.getOpponentNetwork()).toBeTruthy();
  });
  test('opponent has no opponent defined (to avoid infinite recursion)', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();

    expect(
      gameNetwork.getOpponentNetwork()?.getOpponentNetwork(),
    ).toBeUndefined();
  });
});

describe('opponent index not found', () => {
  test('thrown by getOpponentNetwork', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    expect(() => {
      gameNetwork.getOpponentNetwork(1);
    }).toThrow();
  });
  test('thrown by addCannotPass', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    expect(() => {
      gameNetwork.addCannotPass(connection, 1);
    }).toThrow();
  });
  test('thrown by addCannotPass', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    expect(() => {
      gameNetwork.removeCannotPass(connection, 1);
    }).toThrow();
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

  test('with cannot pass single line 2 players', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Calgary', 'Helena');

    gameNetwork.addCannotPass(connection);
    const path = gameNetwork
      .getRouting()
      .getShortestPath('Calgary', 'Salt Lake City');
    expect(path).toEqual(['Calgary', 'Seattle', 'Portland', 'Salt Lake City']);
  });

  test('with cannot pass double line 2 players', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Kansas City', 'Oklahoma City');

    gameNetwork.addCannotPass(connection);
    const path = gameNetwork
      .getRouting()
      .getShortestPath('Kansas City', 'Houston');
    expect(path.length > 4).toBe(true);
  });

  test('with double line one track blocked 4 players', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Kansas City', 'Oklahoma City');

    gameNetwork.addCannotPass(connection);
    const path = gameNetwork
      .getRouting()
      .getShortestPath('Kansas City', 'Houston');
    expect(path).toEqual(['Kansas City', 'Oklahoma City', 'Dallas', 'Houston']);
  });
  test('with double line both tracks blocked 4 players', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Kansas City', 'Oklahoma City');

    gameNetwork.addCannotPass(connection, 0, 0);
    gameNetwork.addCannotPass(connection, 1, 1);
    const path = gameNetwork
      .getRouting()
      .getShortestPath('Kansas City', 'Houston');
    const conns = gameNetwork.getRouting().getConnectionsForPath(path);
    expect(conns.includes(connection)).toBe(false);
  });
  test('with cannot pass single line 5 players', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Calgary', 'Helena');

    gameNetwork.addCannotPass(connection);
    const path = gameNetwork
      .getRouting()
      .getShortestPath('Calgary', 'Salt Lake City');
    expect(path).toEqual(['Calgary', 'Seattle', 'Portland', 'Salt Lake City']);
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

describe('addEstablished/removeEstablished', () => {
  test('cannot place on a track from another player', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const SP = gameNetwork.getRouting().getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(SP, 0, 1);

    expect(() => {
      gameNetwork.addEstablished(SP, 1);
    }).toThrow();
  });
  test('cannot place in both tracks', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const SP = gameNetwork.getRouting().getConnection('Seattle', 'Portland');
    gameNetwork.addEstablished(SP, 1);

    expect(() => {
      gameNetwork.addEstablished(SP, 0);
    }).toThrow();
  });
  test('removing a free track throws an error', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const SP = gameNetwork.getRouting().getConnection('Seattle', 'Portland');

    expect(() => {
      gameNetwork.removeEstablished(SP, 1);
    }).toThrow();
  });
  test('removing other players track throws an error', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const SP = gameNetwork.getRouting().getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(SP, 0, 1);

    expect(() => {
      gameNetwork.removeEstablished(SP, 1);
    }).toThrow();
  });
  test('adding and removing makes the track available', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const SP = gameNetwork.getRouting().getConnection('Seattle', 'Portland');
    gameNetwork.addEstablished(SP, 1);
    gameNetwork.removeEstablished(SP, 1);
    expect(SP.getTrackPlayer(1)).toBeUndefined();
  });
});

describe('addCannotPass/removeCannotPass', () => {
  test('works', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(connection, 0, 1);
    expect(connection.getTrackPlayer(1)).toBe(
      gameNetwork.getOpponentNetwork(0),
    );
    gameNetwork.removeCannotPass(connection, 0, 1);
    expect(connection.getTrackPlayer(1)).toBeUndefined();
  });
  test('two opponents on the same conection works', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');

    gameNetwork.addCannotPass(connection, 1, 1);
    gameNetwork.addCannotPass(connection, 0, 0);
  });

  test('add established and cannot pass on the same connection works', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');

    gameNetwork.addEstablished(connection, 0);
    gameNetwork.addCannotPass(connection, 0, 1);
  });

  test('add established and cannot pass on the same connection, then removeEstablished and addEstablished works', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');

    gameNetwork.addEstablished(connection, 0);
    gameNetwork.addCannotPass(connection, 0, 1);
    gameNetwork.removeEstablished(connection, 0);
    gameNetwork.addEstablished(connection, 0);
  });

  test('addCannotPass addCannotPass(other) removeCannotPass addCannotPass sequence', () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');

    gameNetwork.addCannotPass(connection, 0, 0);
    gameNetwork.addCannotPass(connection, 1, 1);
    gameNetwork.removeCannotPass(connection, 0, 0);
    gameNetwork.addCannotPass(connection, 0, 0);
  });
});

test('works in 4/5', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();

  const connection = gameNetwork
    .getRouting()
    .getConnection('Seattle', 'Portland');
  gameNetwork.addCannotPass(connection, 0, 1);
  expect(connection.getTrackPlayer(1)).toBe(gameNetwork.getOpponentNetwork(0));
  gameNetwork.removeCannotPass(connection, 0, 1);
  expect(connection.getTrackPlayer(1)).toBeUndefined();
});

test('throws error if no player at trackNr', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();

  const connection = gameNetwork
    .getRouting()
    .getConnection('Seattle', 'Portland');
  expect(() => {
    gameNetwork.removeCannotPass(connection, 1, 1);
  }).toThrow('no player at trackNr');
});
test('throws error if track belongs to another opponent', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();
  gameNetwork.createOpponent();

  const connection = gameNetwork
    .getRouting()
    .getConnection('Seattle', 'Portland');
  gameNetwork.addCannotPass(connection, 0, 1);
  expect(() => {
    gameNetwork.removeCannotPass(connection, 1, 1);
  }).toThrow('belongs to another opponent');
});
describe('addCannotPass/established restrictions', () => {
  let gameNetwork: GameNetwork;
  let LA_ElPaso: Connection;

  beforeEach(() => {
    gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    LA_ElPaso = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
  });
  test('addCannotPass error when in should pass', () => {
    gameNetwork.addEstablished(LA_ElPaso);

    expect(() => {
      gameNetwork.addCannotPass(LA_ElPaso);
    }).toThrow();
  });
  test('addEstablished error when in cannot pass', () => {
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    gameNetwork.addCannotPass(connection);

    expect(() => {
      gameNetwork.addEstablished(connection);
    }).toThrow();
  });

  test('addEstablished error when trackNr already established', () => {
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    gameNetwork.addEstablished(connection);

    expect(() => {
      gameNetwork.addEstablished(connection);
    }).toThrow();
  });
  test('addEstablished error when trackNr 0 already established by other player', () => {
    const connection = gameNetwork
      .getRouting()
      .getConnection('Los Angeles', 'El Paso');
    gameNetwork.addCannotPass(connection);

    expect(() => {
      gameNetwork.addEstablished(connection);
    }).toThrow();
  });

  test('addEstablished error when trackNr 1 already established by other player', () => {
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(connection, 0, 1);

    expect(() => {
      gameNetwork.addEstablished(connection, 1);
    }).toThrow();
  });

  test('addCannotPass error when trackNr 1 already established by other player', () => {
    gameNetwork.createOpponent();
    gameNetwork.createOpponent();
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(connection, 0, 1);

    expect(() => {
      gameNetwork.addCannotPass(connection, 1, 1);
    }).toThrow('TRACKLINE_USED');
  });
  test('addEstablished works when a different track on the same connection is chosen', () => {
    gameNetwork.createOpponent(); //2nd
    gameNetwork.createOpponent(); // 3rd
    const connection = gameNetwork
      .getRouting()
      .getConnection('Seattle', 'Portland');
    gameNetwork.addCannotPass(connection, 0, 0);
    gameNetwork.addEstablished(connection, 1);
  });

  test('established connections reduce train number', () => {
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

    gameNetwork.createOpponent();
    expect((await gameNetwork.getExpectedPointsDrawingTickets(10)) == 0).toBe(
      true,
    );
  });
  test('should return the expected points if a player draws tickets', async () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();

    gameNetwork.addEstablished(
      gameNetwork.getRouting().getConnection('Calgary', 'Helena'),
    );
    const points = await gameNetwork.getExpectedPointsDrawingTickets(10);
    expect(points > 0).toBe(true);
  });
  test('throws an error if called by opponents', async () => {
    const gameNetwork = new GameNetwork();
    gameNetwork.createOpponent();
    const opp = gameNetwork.getOpponentNetwork(0);

    expect.assertions(1);
    await expect(opp?.getExpectedPointsDrawingTickets(10)).rejects.toEqual(
      new Error(
        'getExpectedPointsDrawingTickets: cannot be called by opponents!',
      ),
    );
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

describe('getDifficulty', () => {
  test('non-gray connections have difficulty equal to their points', () => {
    const gn = new GameNetwork();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    expect(gn.getDifficulty(connection1)).toBe(connection1.getPoints());
  });
  test('gray connections have reduced difficulty', () => {
    const gn = new GameNetwork();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Gray);
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() * Constants.GRAY_DIFFICULTY_FACTOR,
    );
  });

  test('double empty connections have same difficulty in 2-3p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Blue);
    connection1.color2 = TrackColor.Red;
    expect(gn.getDifficulty(connection1)).toBe(connection1.getPoints());
  });

  test('double empty connections have reduced difficulty in 4-5p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Blue);
    connection1.color2 = TrackColor.Red;
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() * Constants.DOUBLE_DIFFICULTY_FACTOR,
    );
  });

  test('double empty gray connections have extra reduced difficulty in 4-5p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Gray);
    connection1.color2 = TrackColor.Gray;
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() *
        Constants.DOUBLE_DIFFICULTY_FACTOR *
        Constants.GRAY_DIFFICULTY_FACTOR,
    );
  });

  test('double connections with one track occupied dont have reduced difficulty in 4-5p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Blue);
    gn.addCannotPass(connection1);
    connection1.color2 = TrackColor.Red;
    expect(gn.getDifficulty(connection1)).toBe(connection1.getPoints());
  });

  test('difficulty is greater for 3p games than for 2', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() * Constants.EXTRA_PLAYER_DIFFICULTY_FACTOR,
    );
  });

  test('difficulty is greater for 5p games than for 4p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Black);
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() * Constants.EXTRA_PLAYER_DIFFICULTY_FACTOR,
    );
  });

  test('CASE NOT IN USA MAP: double empty gray/color connections,  gray occupied normal difficulty in 4-5p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Gray);
    connection1.color2 = TrackColor.Red;
    gn.addCannotPass(connection1, 0, 0);
    expect(gn.getDifficulty(connection1)).toBe(connection1.getPoints());
  });

  test('CASE NOT IN USA MAP: double empty gray/color connections,  color occupied reduced difficulty in 4-5p', () => {
    const gn = new GameNetwork();
    gn.createOpponent();
    gn.createOpponent();
    gn.createOpponent();
    const connection1 = new Connection('a', 'b', 3, TrackColor.Gray);
    connection1.color2 = TrackColor.Red;
    gn.addCannotPass(connection1, 0, 1);
    expect(gn.getDifficulty(connection1)).toBe(
      connection1.getPoints() * Constants.GRAY_DIFFICULTY_FACTOR,
    );
  });
});
