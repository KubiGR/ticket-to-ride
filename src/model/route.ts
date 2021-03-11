import { Connection } from './connection';

export class Route {
  trainLength(): number {
    return this.connections[0].length;
  }
  actionLength(): number {
    return this.connections.length;
  }
  connections: Connection[];

  constructor(connections: Connection[]) {
    this.connections = connections;
  }
}
