import { Edge } from '../alg/edge';
import { GameNetwork } from '../gameNetwork';

test('city', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(gameNetwork.getShortestPath('Los Angeles', 'Denver')).toEqual([
    'Los Angeles',
    'Phoenix',
    'Denver',
  ]);

  expect(gameNetwork.getShortestPath('Chicago', 'Denver')).toEqual([
    'Chicago',
    'Omaha',
    'Denver',
  ]);
});

test('undefined graph', () => {
  const gameNetwork = new GameNetwork();
  expect(gameNetwork.getShortestPath('Los Angeles', 'Denver')).toBeUndefined();
});

test('cities', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(
    gameNetwork.getShortestVisitingPath(['Los Angeles', 'Denver', 'Chicago']),
  ).toEqual(['Los Angeles', 'Phoenix', 'Denver', 'Omaha', 'Chicago']);
});

test('getShortestPathArray of cities', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
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
  gameNetwork.parseConnections();

  expect(() => {
    gameNetwork.getShortestVisitingPath(['What?', 'Phoenix', 'Denver']);
  }).toThrow();
});

test('getShortestPathArray returns Undefined if parseConnections is not called', () => {
  const gameNetwork = new GameNetwork();

  expect(
    gameNetwork.getShortestVisitingPath(['Phoenix', 'Denver']),
  ).toBeUndefined();
});

test('findSpanningTree', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
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
  gameNetwork.parseConnections();
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

test('findSpanningTree returns Undefined if parseConnections is not called', () => {
  const gameNetwork = new GameNetwork();

  expect(
    gameNetwork.getMinSpanningTreeOfShortestRoutes(['Phoenix', 'Denver']),
  ).toBeUndefined();
});
