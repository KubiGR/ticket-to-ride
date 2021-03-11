import { City } from 'model/city';

test('city', () => {
    const city = new City('name');
    expect(city.name).toBe('name');
});
