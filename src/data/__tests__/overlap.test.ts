import UIConstants from 'components/canvas/uiConstants';
import { getConnectionFromJson, JsonConnection } from 'model/jsonConnection';
import { usaMap } from 'model/usaMap';

/**
 * Change this to increase opponent boxes for overlap check
 */
const NUMBEROPPS = 3;

test('overlap', () => {
  const connections = usaMap.getConnections();
  let overlaps = 0;
  for (let i = 0; i < connections.length; i++) {
    const jsonCon = getConnectionFromJson(connections[i]);
    if (jsonCon === undefined) continue;
    for (let j = i + 1; j < connections.length; j++) {
      const jsonCon1 = getConnectionFromJson(connections[j]);
      if (jsonCon1 === undefined) continue;

      if (overlap(jsonCon, jsonCon1)) {
        overlaps++;
        console.log(
          jsonCon.from +
            ' - ' +
            jsonCon.to +
            ' WITH ' +
            jsonCon1.from +
            ' - ' +
            jsonCon1.to,
        );
      }
    }
  }
  console.log('TOTAL :' + overlaps);
});

function overlap(jsonCon: JsonConnection, jsonConOther: JsonConnection) {
  const rectWidthFactor = 2.4;
  const width = UIConstants.rectWidth * rectWidthFactor;
  const height = UIConstants.rectWidth * 1.8;

  const x1 = UIConstants.mapWidth * jsonCon.symbol1[0];
  const y1 = UIConstants.mapWidth * jsonCon.symbol1[1];
  const otherX = UIConstants.mapWidth * jsonConOther.symbol1[0];
  const otherY = UIConstants.mapWidth * jsonConOther.symbol1[1];

  const box1f = (x: number, y: number) => [
    x,
    y,
    x + NUMBEROPPS * width,
    y + height,
  ];

  const box2f = (x: number, y: number) => [
    x,
    y + height,
    x + width,
    y + 2 * height,
  ];

  if (
    [box1f(x1, y1), box2f(x1, y1)].some((b) =>
      overlapBox(b, box1f(otherX, otherY)),
    ) ||
    [box1f(x1, y1), box2f(x1, y1)].some((b) =>
      overlapBox(b, box2f(otherX, otherY)),
    )
  ) {
    return true;
  }

  return false;
}

function overlapBox(box1: number[], box2: number[]): boolean {
  return [
    [box1[2], box1[1]],
    [box1[2], box1[3]],
    [box1[0], box1[3]],
    [box1[0], box1[1]],
  ].some(
    (b) => box2[0] < b[0] && b[0] < box2[2] && box2[1] < b[1] && b[1] < box2[3],
  );
}
