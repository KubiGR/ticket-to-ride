import data from '../data/usaConnections.json';
import { Connection } from './connection';
import { TrackColor } from './trackColor';

export const { cities, connections } = getFromJSON();

function getFromJSON(): { cities: string[]; connections: Connection[] } {
  const cities: string[] = [];
  const connections: Connection[] = [];

  data.forEach((d) => {
    if (!cities.includes(d.from)) {
      cities.push(d.from);
    }
    if (!cities.includes(d.to)) {
      cities.push(d.to);
    }
    const connection: Connection = new Connection(
      { name: d.from },
      { name: d.to },
      d.length,
      TrackColor[d.color1 as keyof typeof TrackColor],
    );
    if (d.color2) {
      connection.color2 = TrackColor[d.color2 as keyof typeof TrackColor];
    }
    connections.push(connection);
  });

  return { cities: cities, connections: connections };
}
