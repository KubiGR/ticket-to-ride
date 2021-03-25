import React, { useRef } from 'react';
import { MapImage } from 'components/canvas/MapImage';
import { Stage, Layer } from 'react-konva';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import Konva from 'konva';
import Connections from 'components/canvas/Connections';
import { UIConstants } from 'components/canvas/uiConstants';
import Cities from 'components/canvas/Cities';
import ConnectionLabels from './ConnectionLabels';
import AnimatedCities from './AnimatedCities';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPointerPosition = (evt: any) => {
  console.info(
    (evt.evt.layerX / UIConstants.mapWidth).toFixed(4) +
      ', ' +
      (evt.evt.layerY / UIConstants.mapWidth).toFixed(4),
  );
};

export const RootStage = observer(() => {
  const mapStore = useMapStore();
  const animationLayerRef = useRef<Konva.Layer>(null);

  return (
    <Stage
      width={UIConstants.mapWidth}
      height={UIConstants.mapHeight}
      onClick={(e) => getPointerPosition(e)}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      <Layer>
        <MapImage width={UIConstants.mapWidth} height={UIConstants.mapHeight} />
        <Connections mapStore={mapStore} />
        <Cities mapStore={mapStore} />
        <ConnectionLabels mapStore={mapStore} />
      </Layer>
      <Layer ref={animationLayerRef}>
        <AnimatedCities
          impConTickets={mapStore.impConTickets.slice()}
          animationLayerRef={animationLayerRef}
        />
      </Layer>
    </Stage>
  );
});
