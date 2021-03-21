export class Ticket {
  from: string;
  to: string;
  points: number;

  constructor(from: string, to: string, points: number) {
    this.from = from;
    this.to = to;
    this.points = points;
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

  toString(): string {
    return 'Ticket: ' + this.points + 'p. : ' + this.from + '->' + this.to;
  }
}
