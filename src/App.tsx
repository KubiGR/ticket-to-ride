import React, { useRef, useState } from 'react';
import './App.css';
import { Stage, Layer, Image, Circle, Line } from 'react-konva';
import useImage from 'use-image';
import usaMap from './assets/usa-map.jpg';
import usaCities from './data/usaCities.json';
import usaConnections from './data/usaConnections.json';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';
import { TrackColor } from 'model/trackColor';

type MapProps = { width?: number; height?: number };
const Map = ({ width, height }: MapProps): JSX.Element => {
  const [image] = useImage(usaMap);
  return <Image image={image} width={width} height={height} />;
};

const App = (): JSX.Element => {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [cannotPassConnections, setCannotPassConnections] = useState<
    Connection[]
  >([]);
  const [shouldPassConnections, setshouldPassConnections] = useState<
    Connection[]
  >([]);
  const ref = useRef<HTMLDivElement>(null);
  const mapHeight = 900;
  const mapWidth = mapHeight * 1.56;
  const lineStrokeSize = mapWidth * 0.012;
  const cityFillRadius = mapWidth * 0.008;

  const getPointerPosition = (evt: any) => {
    console.info(
      (evt.evt.layerX / mapWidth).toFixed(4) +
        ', ' +
        (evt.evt.layerY / mapWidth).toFixed(4),
    );
  };

  const gameNetwork = new GameNetwork();
  cannotPassConnections.forEach((con) => {
    const connection = gameNetwork.getConnection(con.from, con.to);
    console.log(connection);
    gameNetwork.addCannotPass(connection);
  });
  shouldPassConnections.forEach((con) => {
    const connection = gameNetwork.getConnection(con.from, con.to);
    console.log(connection);
    gameNetwork.addEstablished(connection);
  });
  console.log('cannotPassConnections');
  console.log(cannotPassConnections);
  console.log('shouldPassConnections');
  console.log(shouldPassConnections);
  const citiesArray = gameNetwork.getShortestVisitingPath(selectedCities);
  const connectionsArray = gameNetwork.getConnectionsForPath(citiesArray);
  console.log(
    'Available trains: ' +
      (gameNetwork.getAvailableTrains() -
        gameNetwork.getRequiredNumOfTrains(connectionsArray)) +
      '\nTotal Points    : ' +
      (gameNetwork.getPoints() +
        gameNetwork.getGainPoints([], connectionsArray)),
  );
  const stringifiedConnections = connectionsArray.map((connection) => {
    return connection.from + '-' + connection.to + '1';
  });

  const cityClick = (cityName: string) => {
    if (!selectedCities?.includes(cityName)) {
      setSelectedCities((prevCities) => {
        const citiesArray = prevCities ? prevCities?.slice() : [];
        citiesArray.push(cityName);
        return citiesArray;
      });
    } else {
      setSelectedCities((prevCities) => {
        const citiesArray = prevCities ? prevCities?.slice() : [];
        const index = citiesArray.indexOf(cityName);
        if (index > -1) {
          citiesArray.splice(index, 1);
        }
        return citiesArray;
      });
    }
  };

  const connectionClick = (con: Connection) => {
    if (!cannotPassConnections?.some((e) => e.isEqual(con))) {
      setCannotPassConnections((prevCons) => {
        const connectionsArr = prevCons ? prevCons?.slice() : [];
        connectionsArr.push(con);
        return connectionsArr;
      });
    } else {
      setCannotPassConnections((prevCons) => {
        const connectionsArr = prevCons ? prevCons?.slice() : [];
        const index = connectionsArr.findIndex((e) => e.isEqual(con));
        if (index > -1) {
          connectionsArr.splice(index, 1);
        }
        return connectionsArr;
      });
    }
  };

  const connectionRightClick = (con: Connection) => {
    if (!shouldPassConnections?.some((e) => e.isEqual(con))) {
      setshouldPassConnections((prevCons) => {
        const connectionsArr = prevCons ? prevCons?.slice() : [];
        connectionsArr.push(con);
        return connectionsArr;
      });
    } else {
      setshouldPassConnections((prevCons) => {
        const connectionsArr = prevCons ? prevCons?.slice() : [];
        const index = connectionsArr.findIndex((e) => e.isEqual(con));
        if (index > -1) {
          connectionsArr.splice(index, 1);
        }
        return connectionsArr;
      });
    }
  };

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
        onClick={() => cityClick(city.name)}
      />
    );
  });

  const drawConnectionsArray = usaConnections.flatMap((con) => {
    let isConnectionSelected = false;
    if (stringifiedConnections.includes(con.from + '-' + con.to + '1')) {
      isConnectionSelected = true;
    }
    const connectionId = new Connection(
      con.from,
      con.to,
      con.length,
      TrackColor[con.color1 as keyof typeof TrackColor],
    );
    if (!con.graphPoints2) {
      return [
        <Line
          key={con.from + '-' + con.to + '1'}
          points={con.graphPoints1.map((point) => mapWidth * point)}
          strokeWidth={lineStrokeSize}
          stroke={isConnectionSelected ? 'blue' : 'green'}
          opacity={0.8}
          onClick={(e) => {
            console.log(e.evt);
            if (e.evt.button === 0) {
              connectionClick(connectionId);
            } else if (e.evt.button === 2) {
              connectionRightClick(connectionId);
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
          stroke={isConnectionSelected ? 'blue' : 'green'}
          opacity={0.8}
          onClick={(e) => {
            console.log(e.evt);
            if (e.evt.button === 0) {
              connectionClick(connectionId);
            } else if (e.evt.button === 2) {
              connectionRightClick(connectionId);
            }
          }}
        />,
        <Line
          key={con.from + '-' + con.to + '2'}
          points={con.graphPoints2.map((point) => mapWidth * point)}
          strokeWidth={lineStrokeSize}
          stroke={isConnectionSelected ? 'blue' : 'green'}
          opacity={0.8}
          onClick={(e) => {
            console.log(e.evt);
            if (e.evt.button === 0) {
              connectionClick(connectionId);
            } else if (e.evt.button === 2) {
              connectionRightClick(connectionId);
            }
          }}
        />,
      ];
    }
  });

  return (
    <div ref={ref}>
      <Stage
        width={mapWidth}
        height={mapHeight}
        onClick={(e) => getPointerPosition(e)}
        onContextMenu={(e) => e.evt.preventDefault()}
      >
        <Layer>
          <Map width={mapWidth} height={mapHeight} />
        </Layer>
        <Layer>
          {drawCitiesArray}
          {drawConnectionsArray}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
