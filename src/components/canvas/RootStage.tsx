import React from 'react';
import { MapImage } from 'components/canvas/MapImage';
import { Stage, Layer, Circle, Line } from 'react-konva';

import usaCities from 'data/usaCities.json';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';

const mapHeight = 600;
const mapWidth = mapHeight * 1.56;
const lineStrokeSize = mapWidth * 0.012;
const cityFillRadius = mapWidth * 0.008;
// const getPointerPosition = (evt: any) => {
//   console.info(
//     (evt.evt.layerX / mapWidth).toFixed(4) +
//       ', ' +
//       (evt.evt.layerY / mapWidth).toFixed(4),
//   );
// };

export const RootStage = observer(() => {
  const mapStore = useMapStore();

  const drawCitiesArray = usaCities.map((city) => {
    let cityColor = 'green';
    if (mapStore.selectedCities.includes(city.name)) {
      cityColor = 'orange';
    }
    if (mapStore.ticketsCities.includes(city.name)) {
      cityColor = 'blue';
    }
    return (
      <Circle
        key={city.name}
        x={mapWidth * city.posX}
        y={mapWidth * city.posY}
        radius={cityFillRadius}
        opacity={0.5}
        fill={cityColor}
        onClick={() => mapStore.toggleSelectedCity(city.name)}
      />
    );
  });

  const drawConnectionsArray = usaConnections.flatMap((con) => {
    const connectionId = mapStore.gameNetwork
      .getRouting()
      .getConnection(con.from, con.to);
    let connectionDrawColor = 'green';
    let connectionDrawOpacity = 0.0;
    const connectionType = mapStore.connectionTypeSelectionMap.get(
      connectionId,
    );
    if (connectionType) {
      if (connectionType.includes('selected')) {
        connectionDrawColor = '#7d85ff';
        connectionDrawOpacity = 1;
      }
      if (connectionType.includes('cannotPass')) {
        connectionDrawColor = '#ff5959';
        connectionDrawOpacity = 1;
      }
      if (connectionType.includes('shouldPass')) {
        connectionDrawColor = '#4551ff';
        connectionDrawOpacity = 1;
      }
    }

    if (!con.graphPoints2) {
      return [
        <Line
          key={con.from + '-' + con.to + '1'}
          points={con.graphPoints1.map((point) => mapWidth * point)}
          strokeWidth={lineStrokeSize}
          stroke={connectionDrawColor}
          opacity={connectionDrawOpacity}
          onClick={(e) => {
            if (e.evt.button === 0) {
              mapStore.toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              mapStore.toggleShouldPassConnection(connectionId);
            }
          }}
        />,
      ];
    } else {
      return [
        <Line
          key={con.from + '-' + con.to + '1'}
          points={con.graphPoints1.map((point) => mapWidth * point)}
          strokeWidth={lineStrokeSize}
          stroke={connectionDrawColor}
          opacity={connectionDrawOpacity}
          onClick={(e) => {
            if (e.evt.button === 0) {
              mapStore.toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              mapStore.toggleShouldPassConnection(connectionId);
            }
          }}
        />,
        <Line
          key={con.from + '-' + con.to + '2'}
          points={con.graphPoints2.map((point) => mapWidth * point)}
          strokeWidth={lineStrokeSize}
          stroke={connectionDrawColor}
          opacity={connectionDrawOpacity}
          onClick={(e) => {
            if (e.evt.button === 0) {
              mapStore.toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              mapStore.toggleShouldPassConnection(connectionId);
            }
          }}
        />,
      ];
    }
  });

  return (
    <Stage
      width={mapWidth}
      height={mapHeight}
      // onClick={(e) => getPointerPosition(e)}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      <Layer>
        <MapImage width={mapWidth} height={mapHeight} />
        {drawCitiesArray}
        {drawConnectionsArray}
      </Layer>
    </Stage>
  );
});
