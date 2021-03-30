import React, { RefObject, useRef } from 'react';
import Konva from 'konva';
import { Circle } from 'react-konva';
import usaCities from 'data/usaCities.json';
import UIConstants from 'components/canvas/uiConstants';

type AnimatedCityProps = {
  cityName: string;
  animationLayerRef: RefObject<Konva.Layer>;
};
export const AnimatedCity = ({
  cityName,
  animationLayerRef,
}: AnimatedCityProps): JSX.Element => {
  const cityRef = useRef<Konva.Circle>(null);
  const anim = new Konva.Animation((frame) => {
    if (cityRef.current && frame) {
      const amplitude = (UIConstants.cityFillRadius * (1.5 - 0.7)) / 2;
      const period = 3000;
      const radius =
        amplitude * Math.sin((frame.time * 2 * Math.PI) / period) +
        amplitude +
        1 * UIConstants.cityFillRadius;
      cityRef.current.radius(radius);
    }
  }, animationLayerRef.current);
  anim.start();

  const drawCity = usaCities.find((city) => city.name === cityName);
  if (drawCity) {
    return (
      <Circle
        ref={cityRef}
        key={drawCity.name}
        x={UIConstants.mapWidth * drawCity.posX}
        y={UIConstants.mapWidth * drawCity.posY}
        radius={UIConstants.cityFillRadius}
        opacity={0.8}
        strokeWidth={UIConstants.cityStrokeSize}
        stroke={UIConstants.highlightedCityStrokeColor}
        fill={UIConstants.highlightedCityFillColor}
      />
    );
  } else {
    return <React.Fragment />;
  }
};

export default AnimatedCity;
