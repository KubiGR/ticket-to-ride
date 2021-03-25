import React, { useRef } from 'react';
import { observer } from 'mobx-react';
import useImage from 'use-image';
import Konva from 'konva';
import { Circle, Layer } from 'react-konva';
import usaCities from 'data/usaCities.json';
import importantCityImage from 'assets/important-city.png';

type AnimatedCityProps = { mapWidth: number; cityName: string };
export const AnimatedCity = observer(
  ({ mapWidth, cityName }: AnimatedCityProps) => {
    const cityFillRadius = mapWidth * 0.008;
    const [image] = useImage(importantCityImage);
    const cityRef = useRef<Konva.Circle>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const anim = new Konva.Animation((frame) => {
      if (cityRef.current && frame) {
        const angleDiff = (frame.timeDiff * 90) / 5000;
        console.log(angleDiff);
        cityRef.current.rotate(angleDiff);
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
            radius={cityFillRadius * 2}
            opacity={1}
            fillPatternImage={image}
            fillPatternRepeat={'no-repeat'}
            fillPatternScale={{
              x: mapWidth * 0.00004,
              y: mapWidth * 0.00004,
            }}
            fillPatternOffset={{ x: mapWidth * 0.013, y: mapWidth * 0.013 }}
          />
        </Layer>
      );
    } else {
      return null;
    }
  },
);

export default AnimatedCity;
