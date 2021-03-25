export function removeItemOnce<T>(array: T[], value: T): T[] {
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}

export function removeItemAll<T>(array: T[], value: T): T[] {
  let i = 0;
  while (i < array.length) {
    if (array[i] === value) {
      array.splice(i, 1);
    } else {
      ++i;
    }
  }
  return array;
}

export function getRandomCombinations<T>(
  n: number,
  size: number,
  array: T[],
): T[][] {
  const combs: T[][] = [];
  for (let i = 0; i < n; i++) {
    const comb: T[] = [];
    for (let j = 0; j < size; j++) {
      let element: T;
      do {
        element = array[getRandomInt(array.length)];
      } while (comb.includes(element));
      comb.push(element);
    }
    combs.push(comb);
  }
  return combs;
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

export function minimumOfArray(numbers: number[]): number {
  if (numbers.length == 0)
    throw new Error('minimumOfArray:  array cannot be empty');
  let minNumber = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] < minNumber) {
      minNumber = numbers[i];
    }
  }
  return minNumber;
}

/**
 * Combinations
 * https://cp-algorithms.com/combinatorics/generating_combinations.html#toc-tgt-1
 */
function gray_code(n: number): number {
  return n ^ (n >> 1);
}

function count_bits(n: number): number {
  let res = 0;
  for (
    ;
    n;
    n >>= 1 // n >>= 1, shift n one bit to the left
  )
    res += n & 1; // n & 1 === is the first bit 1?
  return res;
}

export function all_combinations(n: number, k: number): number[][] {
  const combinations = [];
  let combination = [];
  for (
    let i = 0;
    i < 1 << n; //    1 << n === power(2, n)
    i++
  ) {
    const cur = gray_code(i);
    if (count_bits(cur) == k) {
      for (let j = 0; j < n; j++) {
        if (cur & (1 << j))
          // if the jth bit of cur is 1
          combination.push(j);
      }
      combinations.push(combination.slice());
      combination = [];
    }
  }
  return combinations;
}

export function timeout(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
