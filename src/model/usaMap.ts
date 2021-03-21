import data from 'data/usaConnections.json';
import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';

class USAMap {
  private connections: Connection[] = [];

  constructor() {
    this.connections = this.getUSAConnectionsFromJSON();
  }

  private getUSAConnectionsFromJSON(): Connection[] {
    const connections: Connection[] = [];

    data.forEach((d) => {
      const connection: Connection = new Connection(
        d.from,
        d.to,
        d.length,
        TrackColor[d.color1 as keyof typeof TrackColor],
      );
      if (d.color2) {
        connection.color2 = TrackColor[d.color2 as keyof typeof TrackColor];
      }
      connections.push(connection);
    });

    return connections;
  }

  getConnections(): Connection[] {
    return this.connections;
  }
}

export const usaMap = new USAMap();
