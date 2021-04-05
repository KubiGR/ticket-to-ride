import React, { RefObject, useRef } from 'react';
import Konva from 'konva';
import { Line } from 'react-konva';
import UIConstants from 'components/canvas/uiConstants';
import { MapStore } from 'stores/mapStore';
import { Connection } from 'model/connection';

type AnimatedLineProps = {
  mapStore: MapStore;
  stroke: string;
  opacity: number;
  keyKey: string;
  points: number[];
  connection: Connection;
  animationLayerRef: RefObject<Konva.Layer>;
  trackNr: number;
};
export const AnimatedLine = ({
  mapStore,
  stroke,
  opacity,
  keyKey,
  points,
  connection,
  animationLayerRef,
  trackNr,
}: AnimatedLineProps): JSX.Element => {
  const lineRef = useRef<Konva.Line>(null);
  console.log(animationLayerRef);
  const anim = new Konva.Animation((frame) => {
    if (lineRef.current && frame) {
      const amplitude = (1 * 0.7) / 2;
      const period = 2000;
      const opacity =
        amplitude * Math.sin((frame.time * 2 * Math.PI) / period) + amplitude;
      lineRef.current.opacity(opacity);
    }
  }, animationLayerRef.current);
  anim.start();

  return (
    <Line
      ref={lineRef}
      key={keyKey}
      points={points}
      strokeWidth={UIConstants.lineStrokeSize}
      stroke={stroke}
      opacity={opacity}
      onClick={(e) => {
        if (e.evt.button === 2) {
          mapStore.toggleOpponentConnection(
            connection,
            mapStore.selectedOpponentIndex,
            trackNr,
          );
        } else if (e.evt.button === 0) {
          mapStore.toggleEstablishedConnection(connection, trackNr);
        }
      }}
    />
  );
};

export default AnimatedLine;
