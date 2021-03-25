import React, { RefObject } from 'react';
import AnimatedCity from 'components/canvas/AnimatedCity';
import Konva from 'konva';
import { Ticket } from 'model/ticket';

type AnimatedCitiesProps = {
  impConTickets: Ticket[];
  animationLayerRef: RefObject<Konva.Layer>;
};
export const AnimatedCities = ({
  impConTickets,
  animationLayerRef,
}: AnimatedCitiesProps): JSX.Element => {
  const highlightedCitiesFromImpCons = Array.from(
    impConTickets.slice().reduce((acc, cur) => {
      acc.add(cur.from);
      acc.add(cur.to);
      return acc;
    }, new Set<string>()),
  ).map((cityName) => (
    <AnimatedCity
      key={cityName}
      cityName={cityName}
      animationLayerRef={animationLayerRef}
    />
  ));
  return <>{highlightedCitiesFromImpCons}</>;
};

export default AnimatedCities;
