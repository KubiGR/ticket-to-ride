import { removeItemAll, removeItemOnce } from 'utils/helpers';

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
