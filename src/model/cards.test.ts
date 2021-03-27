import { add, makeTC, TC } from './cards';

test('add same trains', () => {
  // const t1 = [new Map([['green', 3]])];
  const t1 = makeTC(3, 'green');
  const t2 = [new Map([['green', 4]])];

  const total = add(t1, t2);
  console.log(total);
  expect(total.length).toBe(1);
  expect(total[0].get('green')).toBe(7);
});

test('add different trains', () => {
  const t1 = [new Map([['green', 3]])];
  const t2 = [new Map([['blue', 4]])];

  const total = add(t1, t2);
  expect(total.length).toBe(1);
  expect(total[0].get('green')).toBe(3);
  expect(total[0].get('blue')).toBe(4);
});

test('add choice to conns', () => {
  const t1 = [new Map([['green', 4]])];
  const t2 = makeTC(3, 'green', 'blue');

  const total = add(t1, t2);
  console.log(total);
  expect(total.length).toBe(2);
  expect(total[0].get('green')).toBe(7);
  expect(total[1].get('green')).toBe(4);
  expect(total[1].get('blue')).toBe(3);
});

test('add 2 choices', () => {
  const t1 = [new Map([['green', 4]]), new Map([['black', 4]])];
  const t2 = [new Map([['green', 3]]), new Map([['blue', 3]])];

  const total = add(t1, t2);

  expect(total.length).toBe(4);
  expect(total[0].get('green')).toBe(7);

  expect(total[1].get('green')).toBe(4);
  expect(total[1].get('blue')).toBe(3);

  expect(total[2].get('black')).toBe(4);
  expect(total[2].get('green')).toBe(3);

  expect(total[3].get('black')).toBe(4);
  expect(total[3].get('blue')).toBe(3);
});

test('San Francisco Atlanta', () => {
  const lines = [
    makeTC(5, 'orange', 'white'),
    makeTC(3, 'red', 'yellow'),
    makeTC(4, 'black', 'orange'),
    makeTC(2, 'blue', 'pink'),
    makeTC(5, 'green'),
  ];
  // const total = lines.reduce((pre, cur) => add(pre, cur), []);
  let total: TC = [];
  for (let i = 0; i < lines.length; i++) {
    total = add(total, lines[i]);
    // console.log(total);
  }

  console.log(total);
});
