import React, { RefObject } from 'react';
import AnimatedCity from 'components/canvas/AnimatedCity';
import { MapStore } from 'stores/mapStore';
import Konva from 'konva';

type AnimatedCitiesProps = {
  mapStore: MapStore;
  layerRef: RefObject<Konva.Layer>;
};
export const AnimatedCities = ({
  mapStore,
  layerRef,
}: AnimatedCitiesProps): JSX.Element => {
  const highlightedCitiesFromImpCons = Array.from(
    mapStore.impConTickets.slice().reduce((acc, cur) => {
      acc.add(cur.from);
      acc.add(cur.to);
      return acc;
    }, new Set<string>()),
  ).map((cityName) => (
    <AnimatedCity key={cityName} cityName={cityName} layerRef={layerRef} />
  ));
  return <>{highlightedCitiesFromImpCons}</>;
};

export default AnimatedCities;
