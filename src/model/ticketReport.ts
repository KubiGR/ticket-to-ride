import { Ticket } from './ticket';

export class TicketReport {
  constructor(
    public ticket: Ticket,
    public remainingConnections: number,
    public remainingTrains: number,
    public completedConnections: number,
    public totalConnections: number,
    public reachable: boolean,
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
      t.reachable &&
      (t.remainingTrains < 7 ||
        t.remainingConnections < 3 ||
        t.completionPercentage() > 0.4)
    );
  }
}
