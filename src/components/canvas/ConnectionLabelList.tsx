import React from 'react';
import { observer } from 'mobx-react';
import { MapStore } from 'stores/mapStore';
import ConnectionLabel from 'components/canvas/ConnectionLabel';
import { TicketReport } from 'model/ticketReport';

type ConnectionLabelsProps = { mapStore: MapStore };
export const ConnectionLabelList = observer(
  ({ mapStore }: ConnectionLabelsProps): JSX.Element => {
    const jsxImportantConnections: JSX.Element[] = [];
    const mapOfPlayersWithTicketsOfConnection: Map<
      number,
      TicketReport[]
    > = new Map();
    for (let i = 0; i < 5; i++) {
      Array.from(
        mapStore.getImportantConnectionsWithPointsMap(i).keys(),
      ).forEach((con) => {
        const ticketsForConnect = mapStore
          .getImportantConnectionsWithTicketsMap(i)
          .get(con);

        if (ticketsForConnect) {
          mapOfPlayersWithTicketsOfConnection.set(i, mapStore.ticketReports[i]);
        }
      });
    }
    const connections = new Set(
      mapStore.ticketReports
        .flat()
        .flatMap((ticketReport) => ticketReport.remainingConnections),
    );
    connections.forEach((con) => {
      jsxImportantConnections.push(
        <ConnectionLabel
          key={con.from + '-' + con.to + 'connectionLabels'}
          con={con}
          mapStore={mapStore}
          mapOfPlayersWithTicketsOfConnection={
            mapOfPlayersWithTicketsOfConnection
          }
        />,
      );
    });
    return <>{jsxImportantConnections}</>;
  },
);

export default ConnectionLabelList;
