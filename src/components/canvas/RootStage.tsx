import React from 'react';
import { MapImage } from 'components/canvas/MapImage';
import { Stage, Layer, Circle, Line } from 'react-konva';

import usaCities from 'data/usaCities.json';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';

const mapHeight = 900;
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
  const {
    gameNetwork,
    selectedCities,
    connectionTypeSelectionMap,
    toggleCannotPassConnection,
    toggleSelectedCity,
    toggleShouldPassConnection,
  } = useMapStore();

  const drawCitiesArray = usaCities.map((city) => {
    let isCitySelected = false;
    if (selectedCities.includes(city.name)) {
      isCitySelected = true;
    }
    return (
      <Circle
        key={city.name}
        x={mapWidth * city.posX}
        y={mapWidth * city.posY}
        radius={cityFillRadius}
        opacity={0.5}
        fill={isCitySelected ? 'blue' : 'green'}
        onClick={() => toggleSelectedCity(city.name)}
      />
    );
  });

  const drawConnectionsArray = usaConnections.flatMap((con) => {
    const connectionId = gameNetwork.getConnection(con.from, con.to);
    let connectionDrawColor = 'green';
    let connectionDrawOpacity = 0.4;
    const connectionType = connectionTypeSelectionMap.get(connectionId);
    if (connectionType) {
      if (connectionType.includes('selected')) {
        connectionDrawColor = '#7d85ff';
        connectionDrawOpacity = 0.8;
      }
      if (connectionType.includes('cannotPass')) {
        connectionDrawColor = '#ff5959';
        connectionDrawOpacity = 0.8;
      }
      if (connectionType.includes('shouldPass')) {
        connectionDrawColor = '#4551ff';
        connectionDrawOpacity = 0.8;
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
            console.log(e.evt);
            if (e.evt.button === 0) {
              toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              toggleShouldPassConnection(connectionId);
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
            console.log(e.evt);
            if (e.evt.button === 0) {
              toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              toggleShouldPassConnection(connectionId);
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
            console.log(e.evt);
            if (e.evt.button === 0) {
              toggleCannotPassConnection(connectionId);
            } else if (e.evt.button === 2) {
              toggleShouldPassConnection(connectionId);
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
