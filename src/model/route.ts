import { Connection } from './connection';

export class Route {
    trainLength(): number {
        return this.connections.map((c: Connection) => c.length).reduce((acc, cur) => acc + cur);
    }
    actionLength(): number {
        return this.connections.length;
    }
    connections: Connection[];

    constructor(connections: Connection[]) {
        this.connections = connections;
        this.checkConnections();
    }

    checkConnections() {
        for (let i = 0; i < this.connections.length - 1; i++) {
            if (this.connections[i].to.name != this.connections[i + 1].from.name)
                throw new Error('Line is not continuous:' + this.connections[i].to.name + " neq " + this.connections[i + 1].from.name);
        }
    }
}

