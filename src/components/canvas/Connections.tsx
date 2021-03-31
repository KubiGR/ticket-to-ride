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
      let connectionDrawColor = 'white';
      let connectionDrawOpacity = 0.0;
      const connectionType = mapStore.connectionTypeSelectionMap.get(
        connectionId,
      );
      if (connectionType) {
        if (connectionType.includes('selected')) {
          connectionDrawColor = UIConstants.bestRouteConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('0')) {
          connectionDrawColor =
            mapStore.uiConstants.opponent1PassConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('1')) {
          connectionDrawColor =
            mapStore.uiConstants.opponent2PassConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('2')) {
          connectionDrawColor =
            mapStore.uiConstants.opponent3PassConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('3')) {
          connectionDrawColor =
            mapStore.uiConstants.opponent4PassConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('shouldPass')) {
          connectionDrawColor = mapStore.uiConstants.establishedConnectionColor;
          connectionDrawOpacity = 1;
        }
      }

      if (!con.graphPoints2) {
        return [
          <Line
            key={con.from + '-' + con.to + '1'}
            points={con.graphPoints1.map(
              (point) => UIConstants.mapWidth * point,
            )}
            strokeWidth={UIConstants.lineStrokeSize}
            stroke={connectionDrawColor}
            opacity={connectionDrawOpacity}
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
        ];
      } else {
        return [
          <Line
            key={con.from + '-' + con.to + '1'}
            points={con.graphPoints1.map(
              (point) => UIConstants.mapWidth * point,
            )}
            strokeWidth={UIConstants.lineStrokeSize}
            stroke={connectionDrawColor}
            opacity={connectionDrawOpacity}
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
          <Line
            key={con.from + '-' + con.to + '2'}
            points={con.graphPoints2.map(
              (point) => UIConstants.mapWidth * point,
            )}
            strokeWidth={UIConstants.lineStrokeSize}
            stroke={connectionDrawColor}
            opacity={connectionDrawOpacity}
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
        ];
      }
    });

    return <>{jsxConnectionsArray}</>;
  },
);

export default Connections;
