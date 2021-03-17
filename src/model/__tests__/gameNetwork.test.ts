import { Edge } from 'floyd-warshall-shortest';
import { GameNetwork } from 'model/gameNetwork';

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
  gameNetwork.addShouldPass(connection);

  expect(() => {
    gameNetwork.addCannotPass(connection);
  }).toThrow();
});

test('addShouldPass error when in cannot pass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Los Angeles', 'El Paso');
  gameNetwork.addCannotPass(connection);

  expect(() => {
    gameNetwork.addShouldPass(connection);
  }).toThrow();
});

test('getShortestPath with shouldPass', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('Los Angeles', 'El Paso');
  gameNetwork.addShouldPass(connection);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
});

test('getShortestPath with shouldPass (inverse)', () => {
  const gameNetwork = new GameNetwork();
  const connection = gameNetwork.getConnection('El Paso', 'Los Angeles');
  gameNetwork.addShouldPass(connection);

  const path = gameNetwork.getShortestPath('Los Angeles', 'Denver');
  expect(path).toEqual(['Los Angeles', 'El Paso', 'Santa Fe', 'Denver']);
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
  console.log(path);
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
  const solution = gameNetwork.getMinSpanningTreeOfShortestRoutes([
    'Winnipeg',
    'Duluth',
    'Oklahoma City',
    'El Paso',
    'Toronto',
    'New Orleans',
  ]);
  const expected: Edge<string>[] = [
    { from: 'Winnipeg', to: 'Duluth', weight: 4 },
    { from: 'Duluth', to: 'Omaha', weight: 2 },
    { from: 'Omaha', to: 'Kansas City', weight: 1 },
    { from: 'Kansas City', to: 'Oklahoma City', weight: 2 },
    { from: 'Duluth', to: 'Sault St. Marie', weight: 3 },
    { from: 'Sault St. Marie', to: 'Toronto', weight: 2 },
    { from: 'Oklahoma City', to: 'El Paso', weight: 5 },
    { from: 'Oklahoma City', to: 'Dallas', weight: 2 },
    { from: 'Dallas', to: 'Houston', weight: 1 },
    { from: 'Houston', to: 'New Orleans', weight: 2 },
  ];
  expect(solution).toEqual(expected);
});

test('findSpanningTree throws unknown city', () => {
  const gameNetwork = new GameNetwork();
  expect(() => {
    gameNetwork.getMinSpanningTreeOfShortestRoutes([
      'Duluth',
      'Oklahoma City',
      'What??',
      'Toronto',
      'New Orleans',
    ]);
  }).toThrow();
});
