import { DisjointSet } from '../disjointSet';

test('make-set', () => {
  const ds = new DisjointSet(3);

  expect(ds.find(0) == ds.find(1)).toBe(false);
  expect(ds.find(0) == ds.find(2)).toBe(false);
  expect(ds.find(1) == ds.find(2)).toBe(false);
});

test('make-set-union-0-1', () => {
  const ds = new DisjointSet(3);
  ds.union(1, 0);
  expect(ds.find(0) == ds.find(1)).toBe(true);
  expect(ds.find(0) == ds.find(2)).toBe(false);
  expect(ds.find(1) == ds.find(2)).toBe(false);
});

test('make-set-union-0-1-repeat', () => {
  const ds = new DisjointSet(3);
  ds.union(1, 0);
  ds.union(0, 1);
  expect(ds.find(0) == ds.find(1)).toBe(true);
  expect(ds.find(0) == ds.find(2)).toBe(false);
  expect(ds.find(1) == ds.find(2)).toBe(false);
});

test('make-set-union-0-1-2', () => {
  const ds = new DisjointSet(3);

  ds.union(1, 0);
  ds.union(2, 0);
  expect(ds.find(0) == ds.find(1)).toBe(true);
  expect(ds.find(0) == ds.find(2)).toBe(true);
  expect(ds.find(1) == ds.find(2)).toBe(true);
});
