import { Route } from 'model/route';

export class Ticket {
  from: string;
  to: string;
  points: number;

  constructor(from: string, to: string, points: number) {
    this.from = from;
    this.to = to;
    this.points = points;
  }

  completedBy(route: Route): boolean {
    let fromCity = false;
    let toCity = false;
    for (let i = 0; i < route.connections.length; i++) {
      if (route.connections[i].contains(this.from)) fromCity = true;
      if (route.connections[i].contains(this.to)) toCity = true;
      if (fromCity && toCity) return true;
    }
    return false;
  }

  static getCities(tickets: Ticket[]): string[] {
    const cities: Set<string> = new Set();
    tickets.forEach((ticket) => {
      cities.add(ticket.from);
      cities.add(ticket.to);
    });
    return Array.from(cities);
  }

  static getPoints(tickets: Ticket[]): number {
    return tickets.map((t) => t.points).reduce((sum, p) => sum + p, 0);
  }
}
