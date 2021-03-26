import React from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Group, Rect, Text } from 'react-konva';
import { UIConstants } from './uiConstants';
import { MapStore } from 'stores/mapStore';

type ConnectionLabelsProps = { mapStore: MapStore };
export const ConnectionLabels = observer(
  ({ mapStore }: ConnectionLabelsProps): JSX.Element => {
    const jsxImportantConnections = usaConnections.map((con) => {
      const connectionId = mapStore.gameNetwork
        .getRouting()
        .getConnection(con.from, con.to);
      for (let i = 0; i < 5; i++) {
        if (
          Array.from(
            mapStore.getOpponentImportantConnectionsWithPointsMap(i).keys(),
          ).includes(connectionId)
        ) {
          const totalConnectionPoints = mapStore
            .getOpponentImportantConnectionsWithPointsMap(i)
            .get(connectionId);
          const opponentTicketsForConnect = mapStore
            .getOpponentImportantConnectionsWithTicketsMap(i)
            .get(connectionId);

          let rectWidthFactor;
          if (opponentTicketsForConnect) {
            if (totalConnectionPoints && totalConnectionPoints > 9) {
              rectWidthFactor = 2.7;
            } else {
              rectWidthFactor = 1.7;
            }
            return (
              <Group
                key={con.from + '-' + con.to}
                onMouseEnter={() =>
                  mapStore.setImpConTickets(opponentTicketsForConnect)
                }
                onMouseLeave={() => mapStore.clearImpConTickets()}
              >
                <Rect
                  key={con.from + '-' + con.to + 'backgroundSymbol'}
                  x={UIConstants.mapWidth * con.symbol1[0]}
                  y={UIConstants.mapWidth * con.symbol1[1]}
                  width={UIConstants.rectWidth * rectWidthFactor}
                  height={UIConstants.rectWidth * 2}
                  fill={'orange'}
                  stroke={'black'}
                />
                <Text
                  key={con.from + '-' + con.to + 'textSymbol'}
                  x={
                    UIConstants.mapWidth * con.symbol1[0] +
                    UIConstants.rectWidth * 0.4
                  }
                  y={
                    UIConstants.mapWidth * con.symbol1[1] +
                    UIConstants.rectWidth * 0.3
                  }
                  text={totalConnectionPoints?.toString()}
                  fontSize={UIConstants.mapWidth * 0.02}
                />
              </Group>
            );
          }
        }
      }
    });
    return <>{jsxImportantConnections}</>;
  },
);

export default ConnectionLabels;
