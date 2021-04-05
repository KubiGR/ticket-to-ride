import React, { RefObject } from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Line } from 'react-konva';
import UIConstants from './uiConstants';
import { MapStore } from 'stores/mapStore';
import AnimatedLine from 'components/canvas/AnimatedLine';
import Konva from 'konva';

type ConnectionsProps = {
  mapStore: MapStore;
  animationLayerRef: RefObject<Konva.Layer>;
};
export const Connections = observer(
  ({ mapStore, animationLayerRef }: ConnectionsProps): JSX.Element => {
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
                connectionDrawOpacity[index] = 0.6;
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
      if (connectionDrawColor[0] === UIConstants.bestRouteConnectionColor) {
        jsxLinesForConnection.push(
          <AnimatedLine
            animationLayerRef={animationLayerRef}
            key={con.from + '-' + con.to + '1'}
            mapStore={mapStore}
            stroke={connectionDrawColor[0]}
            keyKey={con.from + '-' + con.to + '1'}
            opacity={connectionDrawOpacity[0]}
            points={con.graphPoints1.map(
              (point) => UIConstants.mapWidth * point,
            )}
            connection={connectionId}
            trackNr={0}
          />,
        );
      } else {
        jsxLinesForConnection.push(
          <Line
            key={con.from + '-' + con.to + '1'}
            points={con.graphPoints1.map(
              (point) => UIConstants.mapWidth * point,
            )}
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
      }

      if (con.graphPoints2) {
        if (connectionDrawColor[1] === UIConstants.bestRouteConnectionColor) {
          jsxLinesForConnection.push(
            <AnimatedLine
              animationLayerRef={animationLayerRef}
              key={con.from + '-' + con.to + '2'}
              mapStore={mapStore}
              stroke={connectionDrawColor[1]}
              keyKey={con.from + '-' + con.to + '2'}
              opacity={connectionDrawOpacity[1]}
              points={con.graphPoints2.map(
                (point) => UIConstants.mapWidth * point,
              )}
              connection={connectionId}
              trackNr={1}
            />,
          );
        } else {
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
      }
      return jsxLinesForConnection;
    });

    return <>{jsxConnectionsArray}</>;
  },
);

export default Connections;
