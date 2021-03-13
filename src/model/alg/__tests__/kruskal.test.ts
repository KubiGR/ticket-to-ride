import { Edge, Graph } from '../kruskal';

test('kruskal', () => {
  const numNodes = 6;
  const edges: Edge[] = [
    { from: 0, to: 1, distance: 1 },
    { from: 0, to: 2, distance: 5 },
    { from: 0, to: 4, distance: 7 },
    { from: 1, to: 2, distance: 2 },
    { from: 1, to: 3, distance: 5 },
    { from: 2, to: 5, distance: 8 },
    { from: 3, to: 4, distance: 3 },
    { from: 3, to: 5, distance: 4 },
    { from: 4, to: 5, distance: 5 },
  ];
  const g = new Graph(numNodes, edges);
  const spanningTree = g.kruskal();

  expect(spanningTree.length).toBe(5);
  expect(spanningTree).toEqual([
    { from: 0, to: 1, distance: 1 },
    { from: 1, to: 2, distance: 2 },
    { from: 3, to: 4, distance: 3 },
    { from: 3, to: 5, distance: 4 },
    { from: 1, to: 3, distance: 5 },
  ]);
});
