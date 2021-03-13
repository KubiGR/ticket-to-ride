import { permutator } from '../permute';

test('permute2', () => {
  const arr = [1, 2];
  const permuted = [
    [1, 2],
    [2, 1],
  ];
  expect(permutator(arr)).toEqual(permuted);
});

test('permute3', () => {
  const arr = [1, 2, 3];
  const permuted = [
    [1, 2, 3],
    [1, 3, 2],
    [2, 1, 3],
    [2, 3, 1],
    [3, 1, 2],
    [3, 2, 1],
  ];
  expect(permutator(arr)).toEqual(permuted);
});
