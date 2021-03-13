import React, { useRef } from 'react';
import './App.css';
import { Stage, Layer, Image, Circle } from 'react-konva';
import useImage from 'use-image';
import PropTypes from 'prop-types';
import useResizeObserver from 'use-resize-observer';

type MapProps = { width?: number; height?: number };
const Map = ({ width, height }: MapProps): JSX.Element => {
  const url = './usa-map.jpg';
  const [image] = useImage(url);
  return <Image image={image} width={width} height={height} />;
};

Map.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

const App = (): JSX.Element => {
  // const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeObserver<HTMLDivElement>({ ref });
  // aspect ratio of usaMap = 1.56
  const mapWidth = 624;
  const mapHeight = 400;
  const vancouverPos = {
    x: 0.08,
    y: 0.11,
    s: 0.008,
  };
  // console.log(targetRef.current?.clientWidth);

  // useEffect(() => {
  //   console.log('useEffect');
  //   if (targetRef.current) {
  //     setWidth(targetRef.current.clientWidth);
  //     console.log('useEffect');
  //     console.log(width);
  //   }
  // });

  return (
    <div ref={ref}>
      Size: {width}x{height}
      <Stage width={mapWidth} height={mapHeight}>
        <Layer>
          <Map width={mapWidth} height={mapHeight} />
        </Layer>
        <Layer onClick={() => console.log('click')}>
          <Circle
            x={mapWidth * vancouverPos.x}
            y={mapHeight * vancouverPos.y}
            radius={mapWidth * vancouverPos.s}
            fill="green"
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
