import { City } from '../city';

test('city', () => {
  const city = new City('name');
  expect(city.name).toBe('name');
});
