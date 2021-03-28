import { cardsForConnections, TC } from './cards';
import { Connection } from './connection';
import { cardColors } from './trackColor';

type MinMax = { min: number; max: number };

export class CardReport {
  private summary: Map<string, MinMax> = new Map();
  private details: TC = [];

  constructor(connections: Connection[], established: Connection[]) {
    const needed = connections.filter((c) => !established.includes(c));
    this.details = cardsForConnections(needed);
    this.createSummary();
  }

  private createSummary(): void {
    cardColors.forEach((color) => {
      let minCards = Infinity;
      let maxCards = 0;
      this.details.forEach((t) => {
        const tgc = t.get(color);
        if (tgc === undefined) {
          minCards = 0;
        } else {
          if (tgc < minCards) {
            minCards = tgc;
          }
          if (tgc > maxCards) {
            maxCards = tgc;
          }
        }
      });
      if (minCards != Infinity)
        this.summary.set(color, { min: minCards, max: maxCards });
    });
  }
  getSummary(): Map<string, MinMax> {
    return this.summary;
  }

  summaryString(): string {
    let s = '';
    cardColors.forEach((c) => {
      const mm = this.summary.get(c);
      if (mm) {
        if (mm.min === mm.max) {
          if (mm.min != 0) s += '(' + mm.min + ') ' + c + '   ';
        } else s += mm.min + '-' + mm.max + ' ' + c + '   ';
      }
    });
    return s;
  }
}
