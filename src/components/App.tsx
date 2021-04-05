import React, { useEffect } from 'react';
import './App.css';
import { RootStage } from 'components/canvas/RootStage';
import TicketViewer from 'components/tickets/TicketViewer';
import PlayerInfo from 'components/PlayerInfo';
import ImportantConnectionsInfo from 'components/ImportantConnectionsInfo';
import { MapStore } from 'stores/mapStore';
import { useMapStore } from 'providers/MapStoreProvider';

const handleKeyInput = (evt: KeyboardEvent, mapStore: MapStore) => {
  switch (evt.key) {
    case '1':
      mapStore.setSelectedOpponentIndex(0);
      break;
    case '2':
      mapStore.setSelectedOpponentIndex(1);
      break;
    case '3':
      mapStore.setSelectedOpponentIndex(2);
      break;
    case '4':
      mapStore.setSelectedOpponentIndex(3);
      break;
  }
};

const App = (): JSX.Element => {
  const mapStore = useMapStore();

  useEffect(() => {
    document.addEventListener('keydown', (evt) => {
      if (Number(evt.key) > mapStore.opponentCount) {
        return;
      }
      handleKeyInput(evt, mapStore);
    });

    return () => {
      document.removeEventListener('keydown', (evt) => {
        if (Number(evt.key) > mapStore.opponentCount) {
          return;
        }
        handleKeyInput(evt, mapStore);
      });
    };
  }, [mapStore, mapStore.opponentCount, mapStore.setSelectedOpponentIndex]);

  return (
    <div className="container">
      <div className="map">
        <RootStage />
      </div>

      <div className="player-info">
        <PlayerInfo />
      </div>

      <div className="tickets">
        <TicketViewer />
      </div>

      <div className="important-connections-info">
        <ImportantConnectionsInfo />
      </div>
    </div>
  );
};

export default App;
