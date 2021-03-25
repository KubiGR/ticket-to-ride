import React from 'react';
import './App.css';
import { RootStage } from 'components/canvas/RootStage';
import TicketViewer from 'components/tickets/TicketViewer';
import PlayerInfo from 'components/PlayerInfo';
import ImportantConnectionsInfo from 'components/ImportantConnectionsInfo';

const App = (): JSX.Element => {
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
