import React, { useRef } from 'react';
import './App.css';
import { Stage, Layer, Image, Circle, Line } from 'react-konva';
import useImage from 'use-image';
import useResizeObserver from 'use-resize-observer';
import usaMap from './assets/usa-map.jpg';
import usaCities from './data/usaCities.json';
import usaConnections from './data/usaConnections.json';

type MapProps = { width?: number; height?: number };
const Map = ({ width, height }: MapProps): JSX.Element => {
  const [image] = useImage(usaMap);
  return <Image image={image} width={width} height={height} />;
};

const App = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver<HTMLDivElement>({ ref });
  const mapHeight = 900;
  const mapWidth = mapHeight * 1.56;
  const lineStrokeSize = mapWidth * 0.012;
  const cityFillRadius = mapWidth * 0.008;

  // const getPointerPosition = (evt: any) => {
  //   console.info(
  //     (evt.evt.layerX / mapWidth).toFixed(4) +
  //       ' ' +
  //       (evt.evt.layerY / mapWidth).toFixed(4),
  //   );
  // };

  const cityClick = (cityName: string) => {
    console.log(cityName);
  };

  const connectionClick = (connectionName: string) => {
    console.log(connectionName);
  };

  const drawCitiesArray = usaCities.map((city) => {
    return (
      <Circle
        key={city.name}
        x={mapWidth * city.posX}
        y={mapWidth * city.posY}
        radius={cityFillRadius}
        opacity={0.5}
        fill="green"
        onClick={() => cityClick(city.name)}
      />
    );
  });

  const drawConnectionsArray = usaConnections.flatMap((con) => {
    if (con.graphPoints1) {
      if (!con.graphPoints2) {
        return [
          <Line
            key={con.from + '-' + con.to + '1'}
            points={con.graphPoints1.map((point) => mapWidth * point)}
            strokeWidth={lineStrokeSize}
            stroke="green"
            opacity={0.5}
            onClick={() => connectionClick(con.from + '-' + con.to + '1')}
          />,
        ];
      } else {
        return [
          <Line
            key={con.from + '-' + con.to + '1'}
            points={con.graphPoints1.map((point) => mapWidth * point)}
            strokeWidth={lineStrokeSize}
            stroke="green"
            opacity={0.5}
            onClick={() => connectionClick(con.from + '-' + con.to + '1')}
          />,
          <Line
            key={con.from + '-' + con.to + '2'}
            points={con.graphPoints2.map((point) => mapWidth * point)}
            strokeWidth={lineStrokeSize}
            stroke="green"
            opacity={0.5}
            onClick={() => connectionClick(con.from + '-' + con.to + '2')}
          />,
        ];
      }
    } else return [];
  });

  return (
    <div ref={ref}>
      Size: {width}x{height}
      <Stage
        width={mapWidth}
        height={mapHeight}
        // onClick={(evt) => getPointerPosition(evt)}
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
