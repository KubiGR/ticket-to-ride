import React from 'react';
import './App.css';
import { RootStage } from 'components/canvas/RootStage';
import TicketViewer from './tickets/TicketViewer';

const App = (): JSX.Element => {
  return (
    <div className="container">
      <div className="map">
        <RootStage />
      </div>

      <div className="tickets">
        <TicketViewer />
      </div>
    </div>
  );
};

export default App;
