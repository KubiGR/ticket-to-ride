import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom';
import { MapStoreProvider } from 'providers/MapStoreProvider';

ReactDOM.render(
  <React.StrictMode>
    <MapStoreProvider>
      <App />
    </MapStoreProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
