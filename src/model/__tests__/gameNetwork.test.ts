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

test('citiesMore', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(
    gameNetwork.getShortestPathArray(['Calgary', 'Salt Lake City', 'Phoenix']),
  ).toEqual(['Calgary', 'Helena', 'Salt Lake City', 'Denver', 'Phoenix']);
});

test('Houston, Phoenix, Denver', () => {
  const gameNetwork = new GameNetwork();
  gameNetwork.parseConnections();
  expect(
    gameNetwork.getShortestPathArray(['Houston', 'Phoenix', 'Denver']),
  ).toEqual(['Houston', 'Dallas', 'Oklahoma City', 'Denver', 'Phoenix']);
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
    { from: 'Winnipeg', to: 'Duluth' },
    { from: 'Duluth', to: 'Sault St. Marie' },
    { from: 'Sault St. Marie', to: 'Toronto' },
    { from: 'Oklahoma City', to: 'El Paso' },
    { from: 'Oklahoma City', to: 'Dallas' },
    { from: 'Dallas', to: 'Houston' },
    { from: 'Houston', to: 'New Orleans' },
    { from: 'Duluth', to: 'Omaha' },
    { from: 'Omaha', to: 'Kansas City' },
    { from: 'Kansas City', to: 'Oklahoma City' },
  ]);
});
