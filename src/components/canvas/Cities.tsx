import React from 'react';
import usaConnections from 'data/usaConnections.json';
import { observer } from 'mobx-react';
import { Circle } from 'react-konva';
import { UIConstants } from './uiConstants';
import { MapStore } from 'stores/mapStore';
import usaCities from 'data/usaCities.json';

type CitiesProps = { mapStore: MapStore };
export const Cities = observer(
  ({ mapStore }: CitiesProps): JSX.Element => {
    const jsxCitiesArray = usaCities.map((city) => {
      let cityFill = 'green';
      let cityStroke;
      if (mapStore.selectedCities.includes(city.name)) {
        cityStroke = 'yellow';
      }
      if (mapStore.ticketsCities.includes(city.name)) {
        cityFill = 'blue';
      }
      return (
        <Circle
          key={city.name}
          x={UIConstants.mapWidth * city.posX}
          y={UIConstants.mapWidth * city.posY}
          radius={UIConstants.cityFillRadius}
          opacity={0.6}
          fill={cityFill}
          stroke={cityStroke}
          strokeWidth={UIConstants.cityStrokeSize}
          onClick={() => mapStore.toggleSelectedCity(city.name)}
        />
      );
    });
    return <>{jsxCitiesArray}</>;
  },
);

export default Cities;
