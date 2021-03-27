import React from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Group, Rect, Text } from 'react-konva';
import { UIConstants } from './uiConstants';
import { MapStore } from 'stores/mapStore';

type ConnectionLabelsProps = { mapStore: MapStore };
export const ConnectionLabels = observer(
  ({ mapStore }: ConnectionLabelsProps): JSX.Element => {
    console.log(mapStore.opponentTicketReports[0].slice());
    console.log(mapStore.opponentTicketReports[1].slice());

    const jsxImportantConnections = usaConnections.flatMap((con) => {
      const connectionId = mapStore.gameNetwork
        .getRouting()
        .getConnection(con.from, con.to);

      let countOfOpponentsHavingThisConnection = mapStore.getCountOfOpponentsForImportantConnection(
        connectionId,
      );

      const labelsForConnection = [];
      for (let i = 0; i < 5; i++) {
        let labelFill;
        switch (i) {
          case 0:
            labelFill = UIConstants.opponent1PassConnectionColor;
            break;
          case 1:
            labelFill = UIConstants.opponent2PassConnectionColor;
            break;
          case 2:
            labelFill = UIConstants.opponent3PassConnectionColor;
            break;
          case 3:
            labelFill = UIConstants.opponent4PassConnectionColor;
            break;
        }
        if (
          Array.from(
            mapStore.getOpponentImportantConnectionsWithPointsMap(i).keys(),
          ).includes(connectionId)
        ) {
          countOfOpponentsHavingThisConnection--;
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
            labelsForConnection.push(
              <Group
                key={
                  con.from +
                  '-' +
                  con.to +
                  'group' +
                  countOfOpponentsHavingThisConnection
                }
                onMouseEnter={() =>
                  mapStore.setImpConTickets(opponentTicketsForConnect)
                }
                onMouseLeave={() => mapStore.clearImpConTickets()}
              >
                <Rect
                  key={
                    con.from +
                    '-' +
                    con.to +
                    'backgroundSymbol' +
                    countOfOpponentsHavingThisConnection
                  }
                  x={
                    UIConstants.mapWidth * con.symbol1[0] +
                    UIConstants.rectWidth *
                      rectWidthFactor *
                      countOfOpponentsHavingThisConnection
                  }
                  y={UIConstants.mapWidth * con.symbol1[1]}
                  width={UIConstants.rectWidth * rectWidthFactor}
                  height={UIConstants.rectWidth * 2}
                  fill={labelFill}
                  stroke={'black'}
                />
                <Text
                  key={
                    con.from +
                    '-' +
                    con.to +
                    'textSymbol' +
                    countOfOpponentsHavingThisConnection
                  }
                  x={
                    UIConstants.mapWidth * con.symbol1[0] +
                    UIConstants.rectWidth * 0.4 +
                    UIConstants.rectWidth *
                      rectWidthFactor *
                      countOfOpponentsHavingThisConnection
                  }
                  y={
                    UIConstants.mapWidth * con.symbol1[1] +
                    UIConstants.rectWidth * 0.3
                  }
                  fontFamily={'monospace'}
                  text={totalConnectionPoints?.toString()}
                  fontSize={UIConstants.mapWidth * 0.02}
                  fill={'white'}
                />
              </Group>,
            );
          }
        }
      }
      return labelsForConnection;
    });
    return <>{jsxImportantConnections}</>;
  },
);

export default ConnectionLabels;
