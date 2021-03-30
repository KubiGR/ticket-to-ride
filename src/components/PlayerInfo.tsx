import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const PlayerInfo = observer(
  (): JSX.Element => {
    const mapStore = useMapStore();
    const player0ColorButtonRef = useRef<HTMLDivElement>(null);
    const player1ColorButtonRef = useRef<HTMLDivElement>(null);
    const player2ColorButtonRef = useRef<HTMLDivElement>(null);
    const player3ColorButtonRef = useRef<HTMLDivElement>(null);
    const player4ColorButtonRef = useRef<HTMLDivElement>(null);
    const [button0Pos, setButton0Pos] = useState<DOMRect>();
    const [button1Pos, setButton1Pos] = useState<DOMRect>();
    const [button2Pos, setButton2Pos] = useState<DOMRect>();
    const [button3Pos, setButton3Pos] = useState<DOMRect>();
    const [button4Pos, setButton4Pos] = useState<DOMRect>();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorToChange, setColorToChange] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout>();
    const playerColorBoxesInfo = useMemo(
      () => [
        {
          playerIndex: 0,
          color: mapStore.uiConstants.establishedConnectionColor,
          playerColorButtonRef: player0ColorButtonRef,
        },
        {
          playerIndex: 1,
          color: mapStore.uiConstants.opponent1PassConnectionColor,
          playerColorButtonRef: player1ColorButtonRef,
        },
        {
          playerIndex: 2,
          color: mapStore.uiConstants.opponent2PassConnectionColor,
          playerColorButtonRef: player2ColorButtonRef,
        },
        {
          playerIndex: 3,
          color: mapStore.uiConstants.opponent3PassConnectionColor,
          playerColorButtonRef: player3ColorButtonRef,
        },
        {
          playerIndex: 4,
          color: mapStore.uiConstants.opponent4PassConnectionColor,
          playerColorButtonRef: player4ColorButtonRef,
        },
      ],
      [
        mapStore.uiConstants.establishedConnectionColor,
        mapStore.uiConstants.opponent1PassConnectionColor,
        mapStore.uiConstants.opponent2PassConnectionColor,
        mapStore.uiConstants.opponent3PassConnectionColor,
        mapStore.uiConstants.opponent4PassConnectionColor,
      ],
    );

    useEffect(() => {
      const timeoutId = setInterval(() => {
        const pos0 = playerColorBoxesInfo[0].playerColorButtonRef.current?.getBoundingClientRect();
        const pos1 = playerColorBoxesInfo[1].playerColorButtonRef.current?.getBoundingClientRect();
        const pos2 = playerColorBoxesInfo[2].playerColorButtonRef.current?.getBoundingClientRect();
        const pos3 = playerColorBoxesInfo[3].playerColorButtonRef.current?.getBoundingClientRect();
        const pos4 = playerColorBoxesInfo[4].playerColorButtonRef.current?.getBoundingClientRect();
        if (JSON.stringify(pos0) !== JSON.stringify(button0Pos)) {
          setButton0Pos(pos0);
        }
        if (JSON.stringify(pos1) !== JSON.stringify(button1Pos)) {
          setButton1Pos(pos1);
        }
        if (JSON.stringify(pos2) !== JSON.stringify(button2Pos)) {
          setButton2Pos(pos2);
        }
        if (JSON.stringify(pos3) !== JSON.stringify(button3Pos)) {
          setButton3Pos(pos3);
        }
        if (JSON.stringify(pos4) !== JSON.stringify(button4Pos)) {
          setButton4Pos(pos4);
        }
      }, 100);
      intervalRef.current = timeoutId;

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [
      button0Pos,
      button1Pos,
      button2Pos,
      button3Pos,
      button4Pos,
      playerColorBoxesInfo,
    ]);

    return (
      <>
        <h4>{`Available Trains: ${mapStore.availableTrainsCount}`}</h4>
        <h4>{`Total Points: ${mapStore.totalPoints}`}</h4>
        {playerColorBoxesInfo.map((playerInfo) => (
          <div
            key={playerInfo.playerIndex}
            ref={playerInfo.playerColorButtonRef}
            style={{
              width: '100px',
              height: '20px',
              backgroundColor: playerInfo.color,
            }}
            onClick={() => {
              setShowColorPicker((prevState) => !prevState);
              setColorToChange(playerInfo.playerIndex);
            }}
          />
        ))}
        {showColorPicker ? (
          <HexColorPicker
            style={{
              position: 'absolute',
              left: playerColorBoxesInfo[
                colorToChange
              ].playerColorButtonRef.current?.getBoundingClientRect().x,
              top: playerColorBoxesInfo[
                colorToChange
              ].playerColorButtonRef.current?.getBoundingClientRect().bottom,
            }}
            color={playerColorBoxesInfo[colorToChange].color}
            onChange={(color) => {
              mapStore.uiConstants.setConnectionColor(colorToChange, color);
            }}
          />
        ) : null}
      </>
    );
  },
);

export default PlayerInfo;
