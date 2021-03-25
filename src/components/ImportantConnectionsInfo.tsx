import React from 'react';
import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';

export const ImportantConnectionsInfo = observer(() => {
  const mapStore = useMapStore();
  const jsxImpConTickets = mapStore.impConTickets.map((ticket) => (
    <li
      key={ticket.from + ticket.to}
      onClick={() => mapStore.addTicket(ticket)}
    >{`${ticket.from} - ${ticket.to} . ${ticket.points}`}</li>
  ));

  return (
    <>
      <h4>Highlighted Tickets</h4>
      <ul>{jsxImpConTickets}</ul>
    </>
  );
});

export default ImportantConnectionsInfo;
