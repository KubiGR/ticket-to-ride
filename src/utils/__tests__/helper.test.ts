import {
  removeItemAll,
  removeItemOnce,
  getRandomCombinations,
  all_combinations,
  minimumOfArray,
} from 'utils/helpers';

describe('removeItemOnce', () => {
  test('returns the same array ref', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemOnce(arr, 'c');
    expect(act).toBe(arr);
  });
  test('does not change the array when item not found', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemOnce(arr, 'e');
    expect(act).toEqual(['a', 'b', 'c', 'b']);
  });
  test('removes first item only when there are more items', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemOnce(arr, 'b');
    expect(act).toEqual(['a', 'c', 'b']);
  });
  test('returns [] when []', () => {
    const arr: string[] = [];
    const act = removeItemOnce(arr, 'b');
    expect(act).toEqual([]);
  });
});

describe('removeItemAll', () => {
  test('returns the same array ref', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemAll(arr, 'c');
    expect(act).toBe(arr);
  });
  test('does not change the array when item not found', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemAll(arr, 'e');
    expect(act).toEqual(['a', 'b', 'c', 'b']);
  });
  test('removes all items only when there are more items', () => {
    const arr: string[] = ['a', 'b', 'c', 'b'];
    const act = removeItemAll(arr, 'b');
    expect(act).toEqual(['a', 'c']);
  });
  test('returns [] when []', () => {
    const arr: string[] = [];
    const act = removeItemAll(arr, 'b');
    expect(act).toEqual([]);
  });
});

describe('getRandomCombinations', () => {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const sampleSize = 5;
  const picked = 3;
  const combs = getRandomCombinations(sampleSize, picked, arr);
  test('returns an array of n random combinations of picked elements from the parameter array', () => {
    expect(combs.length).toBe(sampleSize);
  });

  test('all elements of the array are arrays of size picked', () => {
    combs.forEach((comb) => {
      expect(comb.length).toBe(picked);
    });
  });

  test('all returned combinatioons include elements of the parameter array', () => {
    combs.forEach((comb) => {
      comb.forEach((el) => {
        expect(arr.includes(el)).toBe(true);
      });
    });
  });

  test('all returned combinations have each element only once', () => {
    combs.forEach((comb) => {
      for (let i = 0; i < comb.length - 1; i++) {
        for (let j = i + 1; j < comb.length; j++) {
          expect(comb[i] !== comb[j]).toBe(true);
        }
      }
    });
  });
});

describe('all_combinations', () => {
  test.each([
    [
      3,
      2,
      [
        [0, 1],
        [1, 2],
        [0, 2],
      ],
    ],
    [3, 1, [[0], [1], [2]]],
    [3, 0, [[]]],
  ])('%i choose %i', (n, k, output) => {
    expect(all_combinations(n, k)).toEqual(output);
  });
});

describe('minimumOfArray', () => {
  test('returns the minimum elements of a number array', () => {
    expect(minimumOfArray([3, 2, 5])).toBe(2);
  });
  test('returns undefined if the array is empty', () => {
    expect(minimumOfArray([3, 2, 5])).toBeUndefined;
  });
});
