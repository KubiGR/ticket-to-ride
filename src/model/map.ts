import data from '../data/usaConnections.json';
import { Connection } from './connection';

export function showData(): any {
  const mapData: [Connection] = data;
  console.log(mapData);
}
