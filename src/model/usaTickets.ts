import data from 'data/usaTickets.json';
import { Ticket } from './ticket';

export function getUSATicketsFromJSON(): Ticket[] {
  const tickets: Ticket[] = [];

  data.forEach((d) => {
    const ticket: Ticket = new Ticket(d.from, d.to, d.points);
    tickets.push(ticket);
  });
  return tickets;
}
