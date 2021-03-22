import { observer } from 'mobx-react';
import { useMapStore } from 'providers/MapStoreProvider';
import React from 'react';

const MyTickets = observer(
  (): JSX.Element => {
    const mapStore = useMapStore();

    const selectedTicketsJSX = mapStore.selectedTickets.map((ticket) => (
      <li
        key={ticket.from + ticket.to}
        onClick={() => mapStore.removeTicket(ticket)}
      >{`${ticket.from} - ${ticket.to} . ${ticket.points}`}</li>
    ));

    return (
      <>
        <h4>Your Tickets</h4>
        <ul>{selectedTicketsJSX}</ul>
      </>
    );
  },
);

export default MyTickets;
