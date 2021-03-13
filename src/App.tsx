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
      <Stage width={width} height={window.innerHeight}>
        <Layer zIndex={1}>
          <Map width={width} height={window.innerHeight} />
        </Layer>
        <Layer zIndex={2} onClick={() => console.log('click')}>
          <Circle x={121} y={115} radius={10} fill="green" />
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
