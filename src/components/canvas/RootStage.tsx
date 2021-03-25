import React, { useState } from 'react';
import { MapImage } from 'components/canvas/MapImage';
import { Stage, Layer, Circle, Line, Rect, Text, Group } from 'react-konva';
import usaCities from 'data/usaCities.json';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import { Ticket } from 'model/ticket';
import AnimatedCity from 'components/canvas/AnimatedCity';

const mapHeight = 800;
const mapWidth = mapHeight * 1.56;
const lineStrokeSize = mapWidth * 0.012;
const cityStrokeSize = mapWidth * 0.015;
const cityFillRadius = mapWidth * 0.008;
const rectWidth = mapWidth * 0.012;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPointerPosition = (evt: any) => {
  console.info(
    (evt.evt.layerX / mapWidth).toFixed(4) +
      ', ' +
      (evt.evt.layerY / mapWidth).toFixed(4),
  );
};

export const RootStage = observer(() => {
  const mapStore = useMapStore();
  const [impConsTicketCities, setImpConTicketCities] = useState<Ticket[]>([]);

  const highlightedCitiesFromImpCons = Array.from(
    impConsTicketCities.reduce((acc, cur) => {
      acc.add(cur.from);
      acc.add(cur.to);
      return acc;
    }, new Set<string>()),
  ).map((cityName) => (
    <AnimatedCity key={cityName} mapWidth={mapWidth} cityName={cityName} />
  ));

  const drawImportantConnections = usaConnections.map((con) => {
    const connectionId = mapStore.gameNetwork
      .getRouting()
      .getConnection(con.from, con.to);
    if (
      Array.from(
        mapStore.opponentImportantConnectionsWithPointsMap.keys(),
      ).includes(connectionId)
    ) {
      const totalConnectionPoints = mapStore.opponentImportantConnectionsWithPointsMap.get(
        connectionId,
      );
      const opponentTicketsForConnect = mapStore.opponentImportantConnectionsWithTicketsMap.get(
        connectionId,
      );

      if (opponentTicketsForConnect) {
        if (totalConnectionPoints && totalConnectionPoints > 9) {
          return (
            <Group
              key={con.from + '-' + con.to}
              onMouseEnter={() =>
                setImpConTicketCities(opponentTicketsForConnect)
              }
              onMouseLeave={() => setImpConTicketCities([])}
            >
              <Rect
                key={con.from + '-' + con.to + 'backgroundSymbol'}
                x={mapWidth * con.symbol1[0]}
                y={mapWidth * con.symbol1[1]}
                width={rectWidth * 2.7}
                height={rectWidth * 2}
                fill={'orange'}
                stroke={'black'}
              />
              <Text
                key={con.from + '-' + con.to + 'textSymbol'}
                x={mapWidth * con.symbol1[0] + rectWidth * 0.4}
                y={mapWidth * con.symbol1[1] + rectWidth * 0.3}
                text={totalConnectionPoints?.toString()}
                fontSize={mapWidth * 0.02}
              />
            </Group>
          );
        } else {
          return (
            <Group
              key={con.from + '-' + con.to}
              onMouseEnter={() =>
                setImpConTicketCities(opponentTicketsForConnect)
              }
              onMouseLeave={() => setImpConTicketCities([])}
            >
              <Rect
                key={con.from + '-' + con.to + 'backgroundSymbol'}
                x={mapWidth * con.symbol1[0]}
                y={mapWidth * con.symbol1[1]}
                width={rectWidth * 1.7}
                height={rectWidth * 2}
                fill={'orange'}
                stroke={'black'}
              />
              <Text
                key={con.from + '-' + con.to + 'textSymbol'}
                x={mapWidth * con.symbol1[0] + rectWidth * 0.4}
                y={mapWidth * con.symbol1[1] + rectWidth * 0.3}
                text={totalConnectionPoints?.toString()}
                fontSize={mapWidth * 0.02}
              />
            </Group>
          );
        }
      }
    }
  });

  const drawCitiesArray = usaCities.map((city) => {
    let cityFill = 'green';
    let cityStroke;
    if (mapStore.selectedCities.includes(city.name)) {
      cityStroke = 'yellow';
    }
    if (mapStore.ticketsCities.includes(city.name)) {
      cityFill = 'blue';
    }
    return (
      <Circle
        key={city.name}
        x={mapWidth * city.posX}
        y={mapWidth * city.posY}
        radius={cityFillRadius}
        opacity={0.6}
        fill={cityFill}
        stroke={cityStroke}
        strokeWidth={cityStrokeSize}
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
      onClick={(e) => getPointerPosition(e)}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      <Layer>
        <MapImage width={mapWidth} height={mapHeight} />
        {drawConnectionsArray}
        {drawCitiesArray}
        {drawImportantConnections}
      </Layer>
      {highlightedCitiesFromImpCons}
    </Stage>
  );
});
