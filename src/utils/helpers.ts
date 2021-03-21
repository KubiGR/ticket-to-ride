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
