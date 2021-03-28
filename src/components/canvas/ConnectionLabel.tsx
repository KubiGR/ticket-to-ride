import { UIConstants } from 'components/canvas/uiConstants';
import { Connection } from 'model/connection';
import { Ticket } from 'model/ticket';
import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { MapStore } from 'stores/mapStore';
import { TicketReport } from 'model/ticketReport';
import { getConnectionFromJson } from 'model/jsonConnection';

type ConnectionLabelProps = {
  con: Connection;
  mapStore: MapStore;
  mapOfPlayersWithTicketsOfConnection: Map<number, TicketReport[]>;
};
const ConnectionLabel = ({
  con,
  mapStore,
  mapOfPlayersWithTicketsOfConnection,
}: ConnectionLabelProps): JSX.Element => {
  const labelArray: JSX.Element[] = [];
  const jsonCon = getConnectionFromJson(con);
  const previousPlayerPoints: number[] = [];
  for (let i = 0; i < 5; i++) {
    if (Array.from(mapOfPlayersWithTicketsOfConnection.keys()).includes(i)) {
      const ticketsForConnection: Set<Ticket> = new Set();
      const points = mapOfPlayersWithTicketsOfConnection
        .get(i)
        ?.reduce((acc, cur) => {
          if (cur.remainingConnections.includes(con)) {
            return acc + cur.ticket.points;
          } else {
            return acc;
          }
        }, 0);
      mapOfPlayersWithTicketsOfConnection.get(i)?.forEach((ticketReport) => {
        if (ticketReport.remainingConnections.includes(con))
          ticketsForConnection.add(ticketReport.ticket);
      });
      if (points) {
        if (i === 0) {
          const playerConnectionLabels = createLabelForPlayer(
            con,
            points,
            ticketsForConnection,
            mapStore,
          );
          if (playerConnectionLabels) {
            labelArray.push(playerConnectionLabels);
          }
        } else {
          const rectWidthFactor = points > 9 ? 2.7 : 1.7;
          const addToX = previousPlayerPoints.reduce((acc, cur) => {
            if (cur) {
              const rectWidthFactor = cur > 9 ? 2.7 : 1.7;
              return (acc += UIConstants.rectWidth * rectWidthFactor);
            } else {
              return acc;
            }
          }, 0);
          let labelFill;
          switch (i) {
            case 1:
              labelFill = UIConstants.opponent1PassConnectionColor;
              break;
            case 2:
              labelFill = UIConstants.opponent2PassConnectionColor;
              break;
            case 3:
              labelFill = UIConstants.opponent3PassConnectionColor;
              break;
            case 4:
              labelFill = UIConstants.opponent4PassConnectionColor;
              break;
          }
          if (jsonCon) {
            labelArray.push(
              <Group
                key={con.from + '-' + con.to + 'opponentGroup' + i}
                onMouseEnter={() =>
                  mapStore.setImpConTickets(Array.from(ticketsForConnection))
                }
                onMouseLeave={() => mapStore.clearImpConTickets()}
              >
                <Rect
                  x={UIConstants.mapWidth * jsonCon.symbol1[0] + addToX}
                  y={UIConstants.mapWidth * jsonCon.symbol1[1]}
                  width={UIConstants.rectWidth * rectWidthFactor}
                  height={UIConstants.rectWidth * 2}
                  fill={labelFill}
                  // stroke={'black'}
                />
                <Text
                  x={
                    UIConstants.mapWidth * jsonCon.symbol1[0] +
                    UIConstants.rectWidth * 0.4 +
                    addToX
                  }
                  y={
                    UIConstants.mapWidth * jsonCon.symbol1[1] +
                    UIConstants.rectWidth * 0.3
                  }
                  fontFamily={'monospace'}
                  text={points.toString()}
                  fontSize={UIConstants.mapWidth * 0.02}
                  fill={'white'}
                />
              </Group>,
            );
          }
          previousPlayerPoints.push(points);
        }
      }
    }
  }
  return <>{labelArray}</>;
};

const createLabelForPlayer = (
  con: Connection,
  points: number,
  ticketsForConnection: Set<Ticket>,
  mapStore: MapStore,
): JSX.Element | undefined => {
  const rectWidthFactor = points > 9 ? 2.7 : 1.7;
  const jsonCon = getConnectionFromJson(con);
  if (!jsonCon) return;
  return (
    <Group
      key={con.from + '-' + con.to + 'playerGroup'}
      onMouseEnter={() =>
        mapStore.setImpConTickets(Array.from(ticketsForConnection))
      }
      onMouseLeave={() => mapStore.clearImpConTickets()}
    >
      <Rect
        x={UIConstants.mapWidth * jsonCon.symbol1[0]}
        y={
          UIConstants.mapWidth * jsonCon.symbol1[1] + UIConstants.rectWidth * 2
        }
        width={UIConstants.rectWidth * rectWidthFactor}
        height={UIConstants.rectWidth * 2}
        fill={UIConstants.establishedConnectionColor}
        // stroke={'black'}
      />
      <Text
        x={
          UIConstants.mapWidth * jsonCon.symbol1[0] +
          UIConstants.rectWidth * 0.4
        }
        y={
          UIConstants.mapWidth * jsonCon.symbol1[1] +
          UIConstants.rectWidth * 0.3 +
          +UIConstants.rectWidth * 2
        }
        fontFamily={'monospace'}
        text={points.toString()}
        fontSize={UIConstants.mapWidth * 0.02}
        fill={'white'}
      />
    </Group>
  );
};

export default ConnectionLabel;
