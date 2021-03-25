import React, { RefObject, useRef } from 'react';
import Konva from 'konva';
import { Circle } from 'react-konva';
import usaCities from 'data/usaCities.json';
import { UIConstants } from 'components/canvas/uiConstants';

type AnimatedCityProps = {
  cityName: string;
  layerRef: RefObject<Konva.Layer>;
};
export const AnimatedCity = ({
  cityName,
  layerRef,
}: AnimatedCityProps): JSX.Element => {
  const cityFillRadius = UIConstants.mapWidth * 0.008;
  const cityStrokeSize = UIConstants.mapWidth * 0.003;
  const cityRef = useRef<Konva.Circle>(null);
  const anim = new Konva.Animation((frame) => {
    if (cityRef.current && frame) {
      const amplitude = (cityFillRadius * (1.5 - 0.7)) / 2;
      const period = 3000;
      const radius =
        amplitude * Math.sin((frame.time * 2 * Math.PI) / period) +
        amplitude +
        1 * cityFillRadius;
      cityRef.current.radius(radius);
    }
  }, layerRef.current);
  anim.start();

  const drawCity = usaCities.find((city) => city.name === cityName);
  if (drawCity) {
    return (
      <Circle
        ref={cityRef}
        key={drawCity.name}
        x={UIConstants.mapWidth * drawCity.posX}
        y={UIConstants.mapWidth * drawCity.posY}
        radius={cityFillRadius}
        opacity={0.8}
        strokeWidth={cityStrokeSize}
        stroke={UIConstants.highlightedCityStrokeColor}
        fill={UIConstants.highlightedCityColor}
      />
    );
  } else {
    return <React.Fragment />;
  }
};

export default AnimatedCity;
