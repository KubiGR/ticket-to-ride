import { Ticket } from './ticket';

export class TicketReport {
  constructor(
    public ticket: Ticket,
    public remainingConnections: number,
    public remainingTrains: number,
    public completedConnections: number,
    public totalConnections: number,
  ) {}

  completionPercentage(): number {
    return this.completedConnections / this.totalConnections;
  }

  static compare(t1: TicketReport, t2: TicketReport): number {
    return t2.ticket.points - t1.ticket.points;
    // return t1.completionPercentage() * 100 - t2.completionPercentage() * 100;
  }

  static filterFn(t: TicketReport): boolean {
    return (
      t.remainingTrains < 3 ||
      t.remainingConnections == 1 ||
      t.completionPercentage() > 60
    );
  }
}
