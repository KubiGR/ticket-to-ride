import { Connection } from './connection';

export class Route {
  connections: Connection[];

  constructor(connections: Connection[]) {
    this.connections = connections;
    this.checkConnections();
  }

  checkConnections(): void {
    for (let i = 0; i < this.connections.length - 1; i++) {
      if (this.connections[i].isAdjacentTo(this.connections[i + 1])) continue;
      else
        throw new Error(
          'Line is not continuous:' +
            this.connections[i] +
            ' neq ' +
            this.connections[i + 1],
        );
    }
  }

  trainLength(): number {
    return this.connections
      .map((c: Connection) => c.length)
      .reduce((acc, cur) => acc + cur);
  }

  actionLength(): number {
    return this.connections.length;
  }
}
