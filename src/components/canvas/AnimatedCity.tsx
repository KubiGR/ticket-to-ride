import React, { useRef } from 'react';
import { observer } from 'mobx-react';
import Konva from 'konva';
import { Circle, Layer } from 'react-konva';
import usaCities from 'data/usaCities.json';

type AnimatedCityProps = { mapWidth: number; cityName: string };
export const AnimatedCity = observer(
  ({ mapWidth, cityName }: AnimatedCityProps) => {
    const cityFillRadius = mapWidth * 0.008;
    const cityStrokeSize = mapWidth * 0.003;
    const cityRef = useRef<Konva.Circle>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const anim = new Konva.Animation((frame) => {
      if (cityRef.current && frame) {
        const amplitude = (cityFillRadius * (1.5 - 0.7)) / 2;
        const period = 3000;
        const radius =
          amplitude * Math.sin((frame.time * 2 * Math.PI) / period) +
          amplitude +
          1 * cityFillRadius;
        console.log(radius);
        cityRef.current.radius(radius);
      }
    }, layerRef.current);
    anim.start();

    const drawCity = usaCities.find((city) => city.name === cityName);
    if (drawCity) {
      return (
        <Layer ref={layerRef}>
          <Circle
            ref={cityRef}
            key={drawCity.name}
            x={mapWidth * drawCity.posX}
            y={mapWidth * drawCity.posY}
            radius={cityFillRadius}
            opacity={0.8}
            strokeWidth={cityStrokeSize}
            stroke={'black'}
            fill={'#e300a3'}
          />
        </Layer>
      );
    } else {
      return null;
    }
  },
);

export default AnimatedCity;
