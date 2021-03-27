export type TC = Map<string, number>[];

const colors: string[] = [
  'red',
  'black',
  'green',
  'yellow',
  'blue',
  'orange',
  'white',
  'pink',
];

export function makeTC(len: number, color1: string, color2 = ''): TC {
  if (!colors.includes(color1)) throw new Error('Unknown color: ' + color1);
  if (color2 !== '' && !colors.includes(color2))
    throw new Error('Unknown color: ' + color2);
  if (color2 === '') return [new Map([[color1, len]])];
  else return [new Map([[color1, len]]), new Map([[color2, len]])];
}

export function add(c1: TC, c2: TC): TC {
  const res: TC = [];
  if (c1.length === 0) return c2;
  c1.forEach((t1) => {
    c2.forEach((t2) => {
      const t: Map<string, number> = new Map();
      colors.forEach((c) => {
        const total = addMap(t1, t2, c);
        if (total != 0) t.set(c, addMap(t1, t2, c));
      });
      res.push(t);
    });
  });
  return res;
}

function addMap(
  t1: Map<string, number>,
  t2: Map<string, number>,
  c: string,
): number {
  let total = 0;
  const t1c = t1.get(c);
  if (t1c !== undefined) total += t1c;
  const t2c = t2.get(c);
  if (t2c !== undefined) total += t2c;
  return total;
}
