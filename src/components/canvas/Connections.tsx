import React from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Line } from 'react-konva';
import { UIConstants } from './uiConstants';
import { MapStore } from 'stores/mapStore';

type ConnectionsProps = { mapStore: MapStore };
export const Connections = observer(
  ({ mapStore }: ConnectionsProps): JSX.Element => {
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
          connectionDrawColor = UIConstants.cannotPassConnectionColor;
          connectionDrawOpacity = 1;
        }
        if (connectionType.includes('shouldPass')) {
          connectionDrawColor = UIConstants.establishedConnectionColor;
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
              if (e.evt.button === 0) {
                mapStore.toggleCannotPassConnection(connectionId, 0);
              } else if (e.evt.button === 2) {
                mapStore.toggleShouldPassConnection(connectionId, 0);
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
              if (e.evt.button === 0) {
                mapStore.toggleCannotPassConnection(connectionId, 0);
              } else if (e.evt.button === 2) {
                mapStore.toggleShouldPassConnection(connectionId, 0);
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
              if (e.evt.button === 0) {
                mapStore.toggleCannotPassConnection(connectionId, 0);
              } else if (e.evt.button === 2) {
                mapStore.toggleShouldPassConnection(connectionId, 0);
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
