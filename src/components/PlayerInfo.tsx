import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { HexColorPicker } from 'react-colorful';

const PlayerInfo = observer(
  (): JSX.Element => {
    const mapStore = useMapStore();
    const innerRef = useRef<HTMLDivElement>(null);
    const player0ColorButtonRef = useRef<HTMLDivElement>(null);
    const player1ColorButtonRef = useRef<HTMLDivElement>(null);
    const player2ColorButtonRef = useRef<HTMLDivElement>(null);
    const player3ColorButtonRef = useRef<HTMLDivElement>(null);
    const player4ColorButtonRef = useRef<HTMLDivElement>(null);
    // const buttonPositionsMap = useMemo(
    //   () =>
    //     new Map([
    //       [0, null],
    //       [1, null],
    //       [2, null],
    //       [3, null],
    //       [4, null],
    //     ]),
    //   [],
    // );
    // const [buttonPositions, setButtonPositions] = useState<Map<number,DOMRect | null>>(buttonPositionsMap);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorToChange, setColorToChange] = useState(0);
    // const intervalRef = useRef<NodeJS.Timeout>();
    const playerColorBoxesInfo = useMemo(
      () =>
        [
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
        ].slice(0, mapStore.playerCount),
      [
        mapStore.playerCount,
        mapStore.uiConstants.establishedConnectionColor,
        mapStore.uiConstants.opponent1PassConnectionColor,
        mapStore.uiConstants.opponent2PassConnectionColor,
        mapStore.uiConstants.opponent3PassConnectionColor,
        mapStore.uiConstants.opponent4PassConnectionColor,
      ],
    );

    const clickListener = useCallback(
      (e: MouseEvent) => {
        if (innerRef.current && !innerRef.current.contains(e.target as Node)) {
          if (showColorPicker) {
            setShowColorPicker(false);
          }
        }
      },
      [showColorPicker],
    );

    useEffect(() => {
      document.addEventListener('click', clickListener);
      return () => {
        document.removeEventListener('click', clickListener);
      };
    }, [clickListener]);

    // useEffect(() => {
    //   const timeoutId = setInterval(() => {
    //     const pos0 = playerColorBoxesInfo[0].playerColorButtonRef.current?.getBoundingClientRect();
    //     const pos1 = playerColorBoxesInfo[1].playerColorButtonRef.current?.getBoundingClientRect();
    //     const pos2 = playerColorBoxesInfo[2].playerColorButtonRef.current?.getBoundingClientRect();
    //     const pos3 = playerColorBoxesInfo[3].playerColorButtonRef.current?.getBoundingClientRect();
    //     const pos4 = playerColorBoxesInfo[4].playerColorButtonRef.current?.getBoundingClientRect();
    //     if (
    //       pos0 &&
    //       JSON.stringify(pos0) !== JSON.stringify(buttonPositions?.get(0))
    //     ) {
    //       setButtonPositions((prevState) => {
    //         prevState.set(0, pos0);
    //         const arrayTmp = Array.from(prevState).slice();
    //         return new Map(arrayTmp);
    //       });
    //     }
    //     if (
    //       pos1 &&
    //       JSON.stringify(pos1) !== JSON.stringify(buttonPositions?.get(1))
    //     ) {
    //       setButtonPositions((prevState) => prevState?.set(1, pos1));
    //     }
    //     if (
    //       pos2 &&
    //       JSON.stringify(pos2) !== JSON.stringify(buttonPositions?.get(2))
    //     ) {
    //       setButtonPositions((prevState) => prevState?.set(2, pos2));
    //     }
    //     if (
    //       pos3 &&
    //       JSON.stringify(pos3) !== JSON.stringify(buttonPositions?.get(3))
    //     ) {
    //       setButtonPositions((prevState) => prevState?.set(3, pos3));
    //     }
    //     if (
    //       pos4 &&
    //       JSON.stringify(pos4) !== JSON.stringify(buttonPositions?.get(4))
    //     ) {
    //       setButtonPositions((prevState) => prevState?.set(4, pos4));
    //     }
    //   }, 100);
    //   intervalRef.current = timeoutId;

    //   return () => {
    //     if (intervalRef.current) {
    //       clearInterval(intervalRef.current);
    //     }
    //   };
    // }, [buttonPositions, playerColorBoxesInfo]);

    return (
      <>
        <h4>{`Expected Points: ${mapStore.expectedPoints.toFixed(2)}`}</h4>
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
          <div ref={innerRef}>
            <HexColorPicker
              style={{
                position: 'absolute',
                left: playerColorBoxesInfo[
                  colorToChange
                ].playerColorButtonRef.current?.getBoundingClientRect().left,
                top: playerColorBoxesInfo[
                  colorToChange
                ].playerColorButtonRef.current?.getBoundingClientRect().bottom,
              }}
              color={playerColorBoxesInfo[colorToChange].color}
              onChange={(color) => {
                mapStore.uiConstants.setConnectionColor(colorToChange, color);
              }}
            />
          </div>
        ) : null}
        <button onClick={() => mapStore.reset()}>Reset</button>
        <button onClick={() => mapStore.addPlayer()}>Add Player</button>
        <button onClick={() => mapStore.removePlayer()}>Remove Player</button>
      </>
    );
  },
);

export default PlayerInfo;
