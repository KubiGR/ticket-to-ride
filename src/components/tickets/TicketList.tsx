import React from 'react';
import { useMapStore } from 'providers/MapStoreProvider';
import { observer } from 'mobx-react';

const TicketList = observer(
  (): JSX.Element => {
    const mapStore = useMapStore();

    const ticketsDisplayList = mapStore.notSelectedTickets.map((ticket) => (
      <li
        key={ticket.from + ticket.to}
        onClick={() => mapStore.addTicket(ticket)}
      >{`${ticket.from} - ${ticket.to} . ${ticket.points}`}</li>
    ));

    return (
      <>
        <h4>Available Tickets</h4>
        <ul>{ticketsDisplayList}</ul>
      </>
    );
  },
);

export default TicketList;
