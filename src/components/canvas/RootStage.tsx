import React, { useRef } from 'react';
import { MapImage } from 'components/canvas/MapImage';
import { Stage, Layer } from 'react-konva';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import Konva from 'konva';
import Connections from 'components/canvas/Connections';
import UIConstants from 'components/canvas/uiConstants';
import Cities from 'components/canvas/Cities';
import ConnectionLabelList from './ConnectionLabelList';
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
  mapStore.setAnimationLayerRef(animationLayerRef);

  return (
    <Stage
      width={UIConstants.mapWidth}
      height={UIConstants.mapHeight}
      onClick={(e) => getPointerPosition(e)}
      onContextMenu={(e) => e.evt.preventDefault()}
    >
      <Layer>
        <MapImage width={UIConstants.mapWidth} height={UIConstants.mapHeight} />
        <Cities mapStore={mapStore} />
      </Layer>
      <Layer ref={animationLayerRef}>
        <Connections
          mapStore={mapStore}
          animationLayerRef={animationLayerRef}
        />
        <AnimatedCities
          impConTickets={mapStore.impConTickets.slice()}
          animationLayerRef={animationLayerRef}
        />
      </Layer>
      <Layer>
        <ConnectionLabelList mapStore={mapStore} />
      </Layer>
    </Stage>
  );
});
