import React, { createContext, ReactNode } from 'react';
import './App.css';
import { RootStage } from 'components/canvas/RootStage';

const App = (): JSX.Element => {
  // console.log(
  //   'Available trains: ' +
  //     (gameNetwork.getAvailableTrains() -
  //       gameNetwork.getRequiredNumOfTrains(connectionsArray)) +
  //     '\nTotal Points    : ' +
  //     (gameNetwork.getPoints() +
  //       gameNetwork.getGainPoints([], connectionsArray)),
  // );

  return <RootStage />;
};

export default App;
