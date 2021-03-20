import React, { createContext, ReactNode, useContext } from 'react';
import { MapStore } from 'stores/mapStore';

let store: MapStore;
const StoreContext = createContext<MapStore | undefined>(undefined);

export function MapStoreProvider({ children }: { children: ReactNode }) {
  //only create the store once ( store is a singleton)
  const root = store ?? new MapStore();

  return <StoreContext.Provider value={root}>{children}</StoreContext.Provider>;
}

export function useMapStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useMapStore must be used within MapStoreProvider');
  }

  return context;
}
