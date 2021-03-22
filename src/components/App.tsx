import React from 'react';
import './App.css';
import { RootStage } from 'components/canvas/RootStage';
import TicketViewer from 'components/tickets/TicketViewer';
import PlayerInfo from 'components/PlayerInfo';

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
    </div>
  );
};

export default App;
