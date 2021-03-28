import { Connection } from 'model/connection';
import { GameNetwork } from 'model/gameNetwork';
import { getConnectionFromJson } from 'model/jsonConnection';
import { TrackColor } from 'model/trackColor';

describe('getConnectionFromJson', () => {
  test('returns undefined if connection not found', () => {
    const conn = new Connection('A', 'B', 3, TrackColor.Black);
    expect(getConnectionFromJson(conn)).toBeUndefined();
  });

  test('returns jsonConnection if connection is found', () => {
    const conn = new GameNetwork()
      .getRouting()
      .getConnection('Vancouver', 'Calgary');
    const jsonConn = getConnectionFromJson(conn);
    console.log(conn);
    console.log(jsonConn);
    expect(jsonConn).toBeDefined();
    expect(jsonConn?.from).toBe('Vancouver');
    expect(jsonConn?.to).toBe('Calgary');
  });
});
