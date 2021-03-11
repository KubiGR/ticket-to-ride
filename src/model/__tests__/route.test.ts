import { City } from 'model/city';
import { Connection } from 'model/connection';
import { Route } from 'model/route';
import { TrackColor } from 'model/trackColor';

test('route1', () => {
    let from = new City('from');
    let to = new City('to');
    let connection = new Connection(from, to, 3, TrackColor.Red);
    let route = new Route([connection]);

    expect(route.actionLength()).toBe(1);
});

test('singleRouteTrainLength', () => {
    let from = new City("from");
    let to = new City("to");
    let connection = new Connection(from, to, 3, TrackColor.Red);    
    let route = new Route([connection]);

    expect(route.trainLength()).toBe(3);
  });


test('doubleRouteLength', () => {
  let from = new City("from");
  let to = new City("to");
  let final = new City("final");
  let connection1 = new Connection(from, to, 3, TrackColor.Red);    
  let connection2 = new Connection(to, final, 4, TrackColor.Black);    
  let route = new Route([connection1, connection2]);

  expect(route.actionLength()).toBe(2);
});


test('doubleRouteTrainLength', () => {
  let from = new City("from");
  let to = new City("to");
  let final = new City("final");
  let connection1 = new Connection(from, to, 3, TrackColor.Red);    
  let connection2 = new Connection(to, final, 4, TrackColor.Black);    
  let route = new Route([connection1, connection2]);

  expect(route.trainLength()).toBe(7);
});
