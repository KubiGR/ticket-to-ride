import usaConnections from 'data/usaConnections.json';
import { Connection } from './connection';

export type JsonConnection = {
  from: string;
  to: string;
  length: number;
  symbol1: number[];
  color1: string;
  color2?: string;
  graphPoints1: number[];
  graphPoints2?: number[];
};

export function getConnectionFromJson(
  con: Connection,
): JsonConnection | undefined {
  for (let i = 0; i < usaConnections.length; i++) {
    const jsonConnection: JsonConnection = usaConnections[i];
    if (con.contains(jsonConnection.from) && con.contains(jsonConnection.to)) {
      return jsonConnection;
    }
  }
  return undefined;
}
