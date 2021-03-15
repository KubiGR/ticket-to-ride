import { Edge } from '../edge';
import { kruskal } from '../kruskal';

test('kruskal', () => {
  const edges: Edge<string>[] = [
    { from: 'A', to: 'B', distance: 1 },
    { from: 'A', to: 'C', distance: 5 },
    { from: 'A', to: 'E', distance: 7 },
    { from: 'B', to: 'C', distance: 2 },
    { from: 'B', to: 'D', distance: 5 },
    { from: 'C', to: 'F', distance: 8 },
    { from: 'D', to: 'E', distance: 3 },
    { from: 'D', to: 'F', distance: 4 },
    { from: 'E', to: 'F', distance: 5 },
  ];
  const spanningTree = kruskal(edges);

  expect(spanningTree.length).toBe(5);
  expect(spanningTree).toEqual([
    { from: 'A', to: 'B', distance: 1 },
    { from: 'B', to: 'C', distance: 2 },
    { from: 'D', to: 'E', distance: 3 },
    { from: 'D', to: 'F', distance: 4 },
    { from: 'B', to: 'D', distance: 5 },
  ]);
});
