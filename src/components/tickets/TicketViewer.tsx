import React from 'react';
import MyTickets from './MyTickets';
import TicketList from './TicketList';

const TicketViewer = (): JSX.Element => {
  return (
    <>
      <TicketList />
      <MyTickets />
    </>
  );
};

export default TicketViewer;
