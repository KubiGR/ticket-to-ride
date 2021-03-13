import { GameNetwork } from 'model/gameNetwork';

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
  expect(gameNetwork.getShortestPath('Los Angeles', 'Denver')).toEqual([]);
});

test('cities', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(
    gameNetwork.getShortestPathArray(['Los Angeles', 'Denver', 'Chicago']),
  ).toEqual(['Los Angeles', 'Phoenix', 'Denver', 'Omaha', 'Chicago']);
});

test('getShortestPathArray of cities', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(
    gameNetwork.getShortestPathArray(['Calgary', 'Salt Lake City', 'Phoenix']),
  ).toEqual(['Calgary', 'Helena', 'Salt Lake City', 'Denver', 'Phoenix']);
});

test('getShortestPathArray unknown cities', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();

  expect(() => {
    gameNetwork.getShortestPathArray(['What?', 'Phoenix', 'Denver']);
  }).toThrow();
});

test('getShortestPathArray returns [] if parseConnections is not called', () => {
  const gameNetwork = new GameNetwork();

  expect(gameNetwork.getShortestPathArray(['Phoenix', 'Denver'])).toEqual([]);
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
  expect(solution).toEqual([
    { from: 'Winnipeg', to: 'Duluth', distance: 4 },
    { from: 'Duluth', to: 'Omaha', distance: 2 },
    { from: 'Omaha', to: 'Kansas City', distance: 1 },
    { from: 'Kansas City', to: 'Oklahoma City', distance: 2 },
    { from: 'Duluth', to: 'Sault St. Marie', distance: 3 },
    { from: 'Sault St. Marie', to: 'Toronto', distance: 2 },
    { from: 'Oklahoma City', to: 'El Paso', distance: 5 },
    { from: 'Oklahoma City', to: 'Dallas', distance: 2 },
    { from: 'Dallas', to: 'Houston', distance: 1 },
    { from: 'Houston', to: 'New Orleans', distance: 2 },
  ]);
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

test('findSpanningTree returns [] if parseConnections is not called', () => {
  const gameNetwork = new GameNetwork();

  expect(
    gameNetwork.getMinSpanningTreeOfShortestRoutes(['Phoenix', 'Denver']),
  ).toEqual([]);
});
