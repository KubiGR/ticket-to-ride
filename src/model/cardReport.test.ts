import { CardReport } from './cardReport';
import { GameNetwork } from './gameNetwork';
import { usaMap } from './usaMap';

describe('cardReport', () => {
  test('Calgary Salt Lake City', () => {
    const g = new GameNetwork().getRouting();
    const conns = g.getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
      [usaMap.getTicket('Calgary', 'Salt Lake City')],
    );
    const cardReport = new CardReport(conns, []);
    expect(cardReport.getSummary().get('Purple')?.min).toBe(3);
    expect(cardReport.getSummary().get('Purple')?.max).toBe(3);
    expect(cardReport.getSummary().get('Gray')?.min).toBe(4);
    expect(cardReport.getSummary().get('Gray')?.max).toBe(4);
  });
});
