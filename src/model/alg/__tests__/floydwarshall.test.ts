import { Edge } from '../edge';
import { FloydWarshall } from '../floydwarshall';

test('floyd-undirected', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 0, weight: 7 },
    { from: 0, to: 3, weight: 16 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 10 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 1 },
    { from: 4, to: 3, weight: 4 },
  ];
  const graph = new FloydWarshall(edges);

  graph.floydWarshall();
  const path = graph.getShortestPath(0, 3);
  expect(path).toEqual([0, 2, 4, 3]);
});

test('floyd-undirected-inverse-is-equal', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 0, weight: 7 },
    { from: 0, to: 3, weight: 16 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 10 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 1 },
    { from: 4, to: 3, weight: 4 },
  ];
  const graph = new FloydWarshall(edges);

  graph.floydWarshall();
  const path = graph.getShortestPath(3, 0);
  expect(path).toEqual([3, 4, 2, 0]);
});

test('floyd-directed', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 0, weight: 7 },
    { from: 0, to: 3, weight: 16 },
    { from: 1, to: 2, weight: 5 },
    { from: 1, to: 3, weight: 10 },
    { from: 2, to: 3, weight: 6 },
    { from: 2, to: 4, weight: 1 },
    { from: 4, to: 3, weight: 4 },
  ];
  const graph = new FloydWarshall(edges, true);

  graph.floydWarshall();
  const path = graph.getShortestPath(0, 3);
  expect(path).toEqual([0, 1, 3]);
});
test('not connected', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 3, weight: 7 },
  ];
  const graph = new FloydWarshall(edges);

  graph.floydWarshall();
  const path = graph.getShortestPath(0, 3);

  expect(path).toEqual([]);
});

test('floydArray', () => {
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
  const graph = new FloydWarshall(edges);

  graph.floydWarshall();
  const path = graph.getShortestVisitingPath([0, 3, 1]);

  expect(path).toEqual([0, 1, 2, 4, 3]);
});

test('not connected array', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 3, weight: 7 },
  ];
  const graph = new FloydWarshall(edges);

  graph.floydWarshall();
  const path = graph.getShortestVisitingPath([0, 3, 1]);

  expect(path).toEqual([]);
});

test('spanning tree for directed', () => {
  const edges: Edge<number>[] = [
    { from: 0, to: 1, weight: 4 },
    { from: 2, to: 3, weight: 7 },
  ];
  const graph = new FloydWarshall(edges, true);

  graph.floydWarshall();
  expect(() => {
    graph.getMinSpanningTreeOfShortestRoutes([0, 3, 1]);
  }).toThrow();
});
