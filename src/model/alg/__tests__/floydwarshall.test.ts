import { Edge } from '../edge';
import { FloydWarshall } from '../floydwarshall';

test('floyd', () => {
  const numNodes = 5;
  const edges: Edge[] = [
    { from: 0, to: 1, distance: 4 },
    { from: 0, to: 2, distance: 7 },
    { from: 0, to: 3, distance: 14 },
    { from: 1, to: 2, distance: 5 },
    { from: 1, to: 3, distance: 10 },
    { from: 2, to: 3, distance: 6 },
    { from: 2, to: 4, distance: 1 },
    { from: 4, to: 3, distance: 4 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.shortestPath(0, 3);

  expect(path).toEqual([0, 2, 4, 3]);
});

test('not connected', () => {
  const numNodes = 4;
  const edges: Edge[] = [
    { from: 0, to: 1, distance: 4 },
    { from: 2, to: 3, distance: 7 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.shortestPath(0, 3);

  expect(path).toEqual([]);
});

test('floydArray', () => {
  const numNodes = 5;
  const edges: Edge[] = [
    { from: 0, to: 1, distance: 4 },
    { from: 0, to: 2, distance: 7 },
    { from: 0, to: 3, distance: 14 },
    { from: 1, to: 2, distance: 5 },
    { from: 1, to: 3, distance: 11 },
    { from: 2, to: 3, distance: 6 },
    { from: 2, to: 4, distance: 1 },
    { from: 4, to: 3, distance: 4 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.pathArray([0, 3, 1]);

  expect(path).toEqual([0, 1, 2, 4, 3]);
});

test('not connected array', () => {
  const numNodes = 4;
  const edges: Edge[] = [
    { from: 0, to: 1, distance: 4 },
    { from: 2, to: 3, distance: 7 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.pathArray([0, 3, 1]);

  expect(path).toEqual([]);
});
