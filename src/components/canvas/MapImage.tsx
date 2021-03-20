import React from 'react';
import useImage from 'use-image';
import usaMap from 'assets/usa-map.jpg';
import { Image } from 'react-konva';

type MapProps = { width?: number; height?: number };
export const MapImage = ({ width, height }: MapProps): JSX.Element => {
  const [image] = useImage(usaMap);
  return <Image image={image} width={width} height={height} />;
};
