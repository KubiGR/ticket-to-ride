import { Connection } from './connection';
import { Ticket } from './ticket';

export class TicketReport {
  constructor(
    public ticket: Ticket,
    public remainingConnections: Connection[],
    public remainingTrains: number,
    public completedConnectionsNum: number,
    public totalConnectionsNum: number,
    public completedDifficulty: number,
    public totalDifficulty: number,
    public reachable: boolean,
  ) {}

  connectionsCompletionRate(): number {
    return this.completedConnectionsNum / this.totalConnectionsNum;
  }

  difficultyCompletionRate(): number {
    return this.completedDifficulty / this.totalDifficulty;
  }

  static compare(t1: TicketReport, t2: TicketReport): number {
    return t2.ticket.points - t1.ticket.points;
    // return t1.completionPercentage() * 100 - t2.completionPercentage() * 100;
  }

  static filterFn(t: TicketReport): boolean {
    return (
      t.reachable &&
      (t.remainingTrains < 7 ||
        t.remainingConnections.length < 3 ||
        t.connectionsCompletionRate() > 0.4)
    );
  }
}
