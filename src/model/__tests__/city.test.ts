import { City } from "model/city";

test('city', () => {
    let city = new City("name");
    expect(city.name).toBe('name');
  });
  