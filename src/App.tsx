import React, { useRef } from 'react';
import './App.css';
import { Stage, Layer, Image, Circle, Rect, Line } from 'react-konva';
import useImage from 'use-image';
import useResizeObserver from 'use-resize-observer';
import usaMap from './assets/usa-map.jpg';

type MapProps = { width?: number; height?: number };
const Map = ({ width, height }: MapProps): JSX.Element => {
  const [image] = useImage(usaMap);
  return <Image image={image} width={width} height={height} />;
};

const App = (): JSX.Element => {
  // const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver<HTMLDivElement>({ ref });
  // aspect ratio of usaMap = 1.56
  const mapHeight = 900;
  const mapWidth = mapHeight * 1.56;
  const vancouverPos = {
    x: 0.08,
    y: 0.07,
  };
  const vancouverCalgaryRoute1 = {
    x: 0.226,
    y: 0.044,
  };

  const relSizes = {
    r: 0.008,
    w: 0.036,
    h: 0.012,
  };

  const vancouverRelX = mapWidth * vancouverPos.x;
  const vancouverRelY = mapWidth * vancouverPos.y;
  const vancouverCalgaryRoute1X = mapWidth * vancouverCalgaryRoute1.x;
  const vancouverCalgaryRoute1Y = mapWidth * vancouverCalgaryRoute1.y;
  const relRadius = mapWidth * relSizes.r;
  const relRectWidth = mapWidth * relSizes.w;
  const relRectHeight = mapWidth * relSizes.h;

  const getPointerPosition = (evt: any) => {
    console.info(evt);
    console.info(evt.evt.layerX / mapWidth + ' ' + evt.evt.layerY / mapWidth);
  };

  return (
    <div ref={ref}>
      Size: {width}x{height}
      <Stage
        width={mapWidth}
        height={mapHeight}
        onClick={(evt) => getPointerPosition(evt)}
      >
        <Layer>
          <Map width={mapWidth} height={mapHeight} />
        </Layer>
        <Layer>
          <Circle
            onClick={() => console.log('click')}
            x={vancouverRelX}
            y={vancouverRelY}
            radius={relRadius}
            opacity={0.5}
            fill="green"
          />
          <Line
            x={0.226}
            y={0.044}
            points={[0.226, 0.044, 0.262, 0.028]}
            strokeWidth={5}
            stroke="green"
            tension={0.5}
            // fill="green"
            // opacity={0.5}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
