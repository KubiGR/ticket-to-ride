import ticketData from 'data/usaTickets.json';
import connectionsData from 'data/usaConnections.json';
import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';
import { Ticket } from 'model/ticket';

class USAMap {
  private connections: Connection[] = [];
  private tickets: Ticket[] = [];

  constructor() {
    this.connections = this.getUSAConnectionsFromJSON();
    this.tickets = this.getUSATicketsFromJSON();
  }

  private getUSAConnectionsFromJSON(): Connection[] {
    const connections: Connection[] = [];

    connectionsData.forEach((d) => {
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

  private getUSATicketsFromJSON(): Ticket[] {
    const tickets: Ticket[] = [];

    ticketData.forEach((d) => {
      const ticket: Ticket = new Ticket(d.from, d.to, d.points);
      tickets.push(ticket);
    });
    return tickets;
  }

  getConnections(): Connection[] {
    return this.connections;
  }

  getTickets(): Ticket[] {
    return this.tickets;
  }
}

export const usaMap = new USAMap();
