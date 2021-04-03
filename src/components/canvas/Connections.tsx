import React, { useEffect } from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Line } from 'react-konva';
import UIConstants from './uiConstants';
import { MapStore } from 'stores/mapStore';

const handleKeyInput = (evt: KeyboardEvent, mapStore: MapStore) => {
  switch (evt.key) {
    case '1':
      mapStore.setSelectedOpponentIndex(0);
      break;
    case '2':
      mapStore.setSelectedOpponentIndex(1);
      break;
    case '3':
      mapStore.setSelectedOpponentIndex(2);
      break;
    case '4':
      mapStore.setSelectedOpponentIndex(3);
      break;
  }
};

type ConnectionsProps = { mapStore: MapStore };
export const Connections = observer(
  ({ mapStore }: ConnectionsProps): JSX.Element => {
    useEffect(() => {
      document.addEventListener('keydown', (evt) => {
        if (Number(evt.key) > mapStore.opponentCount) {
          return;
        }
        handleKeyInput(evt, mapStore);
      });

      return () => {
        document.removeEventListener('keydown', (evt) => {
          if (Number(evt.key) > mapStore.opponentCount) {
            return;
          }
          handleKeyInput(evt, mapStore);
        });
      };
    }, [mapStore, mapStore.opponentCount, mapStore.setSelectedOpponentIndex]);
    const jsxConnectionsArray = usaConnections.flatMap((con) => {
      const connectionId = mapStore.gameNetwork
        .getRouting()
        .getConnection(con.from, con.to);
      const connectionDrawColor = ['green', 'green'];
      const connectionDrawOpacity = [0.4, 0.4];

      const canvasConnection = mapStore.connectionTypeSelectionMap.get(
        connectionId,
      );
      if (canvasConnection) {
        [canvasConnection.track1, canvasConnection.track2].forEach(
          (trackType, index) => {
            switch (trackType) {
              case 'selected':
                connectionDrawColor[index] =
                  UIConstants.bestRouteConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
              case '0':
                connectionDrawColor[index] =
                  mapStore.uiConstants.establishedConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
              case '1':
                connectionDrawColor[index] =
                  mapStore.uiConstants.opponent1PassConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
              case '2':
                connectionDrawColor[index] =
                  mapStore.uiConstants.opponent2PassConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
              case '3':
                connectionDrawColor[index] =
                  mapStore.uiConstants.opponent3PassConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
              case '4':
                connectionDrawColor[index] =
                  mapStore.uiConstants.opponent4PassConnectionColor;
                connectionDrawOpacity[index] = 1;
                break;
            }
          },
        );
      }

      const jsxLinesForConnection = [];
      jsxLinesForConnection.push(
        <Line
          key={con.from + '-' + con.to + '1'}
          points={con.graphPoints1.map((point) => UIConstants.mapWidth * point)}
          strokeWidth={UIConstants.lineStrokeSize}
          stroke={connectionDrawColor[0]}
          opacity={connectionDrawOpacity[0]}
          onClick={(e) => {
            if (e.evt.button === 2) {
              mapStore.toggleOpponentConnection(
                connectionId,
                mapStore.selectedOpponentIndex,
              );
            } else if (e.evt.button === 0) {
              mapStore.toggleEstablishedConnection(connectionId);
            }
          }}
        />,
      );
      if (con.graphPoints2) {
        jsxLinesForConnection.push(
          <Line
            key={con.from + '-' + con.to + '2'}
            points={con.graphPoints2.map(
              (point) => UIConstants.mapWidth * point,
            )}
            strokeWidth={UIConstants.lineStrokeSize}
            stroke={connectionDrawColor[1]}
            opacity={connectionDrawOpacity[1]}
            onClick={(e) => {
              if (e.evt.button === 2) {
                mapStore.toggleOpponentConnection(
                  connectionId,
                  mapStore.selectedOpponentIndex,
                  1,
                );
              } else if (e.evt.button === 0) {
                mapStore.toggleEstablishedConnection(connectionId, 1);
              }
            }}
          />,
        );
      }
      return jsxLinesForConnection;
    });

    return <>{jsxConnectionsArray}</>;
  },
);

export default Connections;
