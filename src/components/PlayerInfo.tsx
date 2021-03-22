import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import React from 'react';

const PlayerInfo = observer(
  (): JSX.Element => {
    const mapStore = useMapStore();

    return (
      <>
        <h4>{`Available Trains: ${mapStore.availableTrainsCount}`}</h4>
        <h4>{`Total Points: ${mapStore.totalPoints}`}</h4>
      </>
    );
  },
);

export default PlayerInfo;
