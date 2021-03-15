import { Edge } from '../edge';
import { FloydWarshall } from '../floydwarshall';

test('floyd', () => {
  const numNodes = 5;
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 7 },
    { from: 0, to: 3, weight: 14 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 10 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 1 },
    { from: 4, to: 3, weight: 4 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.shortestPath(0, 3);

  expect(path).toEqual([0, 2, 4, 3]);
});

test('not connected', () => {
  const numNodes = 4;
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 3, weight: 7 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.shortestPath(0, 3);

  expect(path).toEqual([]);
});

test('floydArray', () => {
  const numNodes = 5;
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 7 },
    { from: 0, to: 3, weight: 14 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 11 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 1 },
    { from: 4, to: 3, weight: 4 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.pathArray([0, 3, 1]);

  expect(path).toEqual([0, 1, 2, 4, 3]);
});

test('not connected array', () => {
  const numNodes = 4;
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 3, weight: 7 },
  ];
  const graph = new FloydWarshall(numNodes, edges);

  graph.floydWarshall();
  const path = graph.pathArray([0, 3, 1]);

  expect(path).toEqual([]);
});
