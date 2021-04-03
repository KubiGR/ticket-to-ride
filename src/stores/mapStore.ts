import { makeAutoObservable, observable, reaction } from 'mobx';
import { GameNetwork } from 'model/gameNetwork';
import { Connection } from 'model/connection';
import { Ticket } from 'model/ticket';
import { removeItemOnce } from 'utils/helpers';
import { usaMap } from 'model/usaMap';
import { TicketReport } from '../model/ticketReport';
import { Constants } from 'model/constants';
import { CardReport } from 'model/cardReport';
import UIConstants from 'components/canvas/uiConstants';
import CanvasConnection from './canvasConnection';

export class MapStore {
  gameNetwork = new GameNetwork();
  uiConstants = new UIConstants();
  selectedCities: string[] = [];
  selectedTickets: Ticket[] = [];
  allOpponentsConnections: Connection[][] = [];
  establishedConnections: Connection[] = [];
  connectionsArray: Connection[] = [];
  ticketReports: TicketReport[][] = [[]];
  impConTickets: Ticket[] = [];
  selectedOpponentIndex = 0;
  playerCount = 4;

  constructor() {
    makeAutoObservable(this);
    this.initMapStore();

    reaction(
      () => [
        this.selectedTickets.length,
        this.establishedConnections.length,
        this.allOpponentsConnections.map((con) => con.slice()),
      ],
      () => {
        this.connectionsArray = this.gameNetwork
          .getRouting()
          .getOptConnectionsOfMinSpanningTreeOfShortestRoutesForTickets(
            this.selectedTickets,
          );
        console.log('CARDS NEEDED');
        const cr = new CardReport(
          this.connectionsArray,
          this.establishedConnections,
        );
        console.log(cr.summaryString());
      },
    );

    reaction(
      () => [
        this.establishedConnections.length,
        this.allOpponentsConnections.map((con) => con.slice()),
      ],
      () => {
        this.gameNetwork
          .getExpectedPointsDrawingTickets(Constants.DRAW_TICKETS_SAMPLE_SIZE)
          .then((value) => {
            console.log('EXP POINTS', value);
          });

        this.ticketReports[0] = this.gameNetwork
          .getTicketReports()
          .filter(
            (ticketReport) =>
              ticketReport.remainingConnections.length > 0 &&
              ticketReport.reachable &&
              ticketReport.remainingConnections.length <=
                Constants.REMAININING_CONNECTIONS_LEN &&
              ticketReport.remainingTrains <= Constants.REMAINING_TRAINS &&
              ticketReport.connectionsCompletionRate() >=
                Constants.COMPLETION_PERC,
          );

        for (let i = 0; i < this.opponentCount; i++) {
          const opponentNetwork = this.gameNetwork.getOpponentNetwork(i);
          if (opponentNetwork) {
            this.ticketReports[
              i + 1
            ] = opponentNetwork
              .getTicketReports()
              .filter(
                (ticketReport) =>
                  ticketReport.remainingConnections.length > 0 &&
                  ticketReport.reachable &&
                  ticketReport.remainingConnections.length <=
                    Constants.REMAININING_CONNECTIONS_LEN &&
                  ticketReport.remainingTrains <= Constants.REMAINING_TRAINS &&
                  ticketReport.connectionsCompletionRate() >=
                    Constants.COMPLETION_PERC,
              );
          }
        }
      },
    );
  }

  get opponentCount(): number {
    return this.playerCount - 1;
  }

  private initMapStore() {
    usaMap.reset();
    this.gameNetwork = new GameNetwork();
    this.uiConstants = new UIConstants();
    this.selectedCities = [];
    this.selectedTickets = [];
    this.allOpponentsConnections = [];
    this.establishedConnections = [];
    this.connectionsArray = [];
    this.ticketReports = [[]];
    this.impConTickets = observable.array<Ticket>();
    this.selectedOpponentIndex = 0;
    for (let i = 0; i < this.opponentCount; i++) {
      this.gameNetwork.createOpponent();
      this.allOpponentsConnections.push([]);
      this.ticketReports.push([]);
    }
    this.gameNetwork.setPointImportance(0.19);
  }

  getImportantConnectionsWithPointsMap(index: number): Map<Connection, number> {
    return this.ticketReports[index].reduce((acc, cur) => {
      cur.remainingConnections.forEach((con) => {
        const connectionExistingPoints = acc.get(con) || 0;
        acc.set(con, connectionExistingPoints + cur.ticket.points);
      });
      return acc;
    }, new Map<Connection, number>());
  }

  getImportantConnectionsWithTicketsMap(
    index: number,
  ): Map<Connection, Ticket[]> {
    return this.ticketReports[index].reduce((acc, cur) => {
      cur.remainingConnections.forEach((con) => {
        const ticketsForConnectionArray = acc.get(con);
        if (ticketsForConnectionArray) {
          ticketsForConnectionArray.push(cur.ticket);
        } else {
          acc.set(con, [cur.ticket]);
        }
      });
      return acc;
    }, new Map<Connection, Ticket[]>());
  }

  getImportantConnections(index: number): Connection[] {
    return this.ticketReports[index]
      .map((ticketReport) => ticketReport.remainingConnections)
      .flat();
  }

  get connectionTypeSelectionMap(): Map<Connection, CanvasConnection> {
    const connectionTypeSelectionMap = new Map();
    this.connectionsArray.forEach((con) => {
      const canvasConnection = new CanvasConnection();
      if (!con.player1) {
        canvasConnection.track1 = 'selected';
      }
      if (!con.player2) {
        canvasConnection.track2 = 'selected';
      }
      connectionTypeSelectionMap.set(con, canvasConnection);
    });

    this.allOpponentsConnections.forEach((cannotPassConnections, index) => {
      cannotPassConnections.forEach((con) => {
        const canvasConnection = connectionTypeSelectionMap.get(con)
          ? connectionTypeSelectionMap.get(con)
          : new CanvasConnection();
        if (con.player1 === this.gameNetwork.getOpponentNetwork(index)) {
          canvasConnection.track1 = (index + 1).toString();
        }
        if (con.player2 === this.gameNetwork.getOpponentNetwork(index)) {
          canvasConnection.track2 = (index + 1).toString();
        }
        connectionTypeSelectionMap.set(con, canvasConnection);
      });
    });

    this.establishedConnections.forEach((con) => {
      const canvasConnection = connectionTypeSelectionMap.get(con)
        ? connectionTypeSelectionMap.get(con)
        : new CanvasConnection();
      if (con.player1 === this.gameNetwork) {
        canvasConnection.track1 = '0';
      }
      if (con.player2 === this.gameNetwork) {
        canvasConnection.track2 = '0';
      }
      connectionTypeSelectionMap.set(con, canvasConnection);
    });
    return connectionTypeSelectionMap;
  }

  get availableTrainsCount(): number {
    return (
      this.gameNetwork.getAvailableTrains() -
      this.gameNetwork
        .getRouting()
        .getRequiredNumOfTrains(this.connectionsArray)
    );
  }

  get totalPoints(): number {
    return (
      this.gameNetwork.getPoints() +
      this.gameNetwork
        .getRouting()
        .getGainPoints(this.selectedTickets, this.connectionsArray)
    );
  }

  get notSelectedTickets(): Ticket[] {
    return usaMap
      .getTickets()
      .filter(
        (el) =>
          this.selectedCities.includes(el.from) ||
          this.selectedCities.includes(el.to),
      )
      .filter((el) => !this.selectedTickets.includes(el));
  }

  get ticketsCities(): string[] {
    return this.selectedTickets.reduce((acc, cur) => {
      if (!acc.includes(cur.from)) {
        acc.push(cur.from);
      }
      if (!acc.includes(cur.to)) {
        acc.push(cur.to);
      }
      return acc;
    }, [] as string[]);
  }

  addTicket(ticket: Ticket): void {
    this.gameNetwork.addTicket(ticket);
    this.selectedTickets.push(ticket);
    [ticket.from, ticket.to].forEach((city) => {
      removeItemOnce(this.selectedCities, city);
      if (!this.ticketsCities.includes(city)) {
        this.ticketsCities.push(city);
      }
    });
  }

  removeTicket(ticketToRemove: Ticket): void {
    this.gameNetwork.removeTicket(ticketToRemove);
    removeItemOnce(this.selectedTickets, ticketToRemove);
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.from ||
          ticket.to === ticketToRemove.from,
      )
    ) {
      removeItemOnce(this.selectedCities, ticketToRemove.from);
    }
    if (
      !this.selectedTickets.some(
        (ticket) =>
          ticket.from === ticketToRemove.to || ticket.to === ticketToRemove.to,
      )
    ) {
      removeItemOnce(this.selectedCities, ticketToRemove.to);
    }
  }

  toggleSelectedCity(cityName: string): void {
    if (!this.selectedCities?.includes(cityName)) {
      this.selectedCities.push(cityName);
    } else {
      removeItemOnce(this.selectedCities, cityName);
    }
  }

  toggleEstablishedConnection(con: Connection, trackNr = 0): void {
    const conIsEstablished = this.establishedConnections.some((e) =>
      e.hasSameCities(con),
    );
    const conIsEmpty = !con.player1 && !con.player2;
    const conIsEstablishedAtClick = this.establishedConnections
      ?.filter((e) =>
        trackNr === 0
          ? e.player1 === this.gameNetwork
          : e.player2 === this.gameNetwork,
      )
      .some((e) => e.hasSameCities(con));
    let conIsOpponentsAtClick = false;
    this.allOpponentsConnections.forEach((oppConns) => {
      if (
        oppConns
          .filter((e) => (trackNr === 0 ? e.player1 : e.player2))
          .some((e) => e.hasSameCities(con))
      ) {
        conIsOpponentsAtClick = true;
      }
    });

    if (conIsEmpty) {
      this.addEstablishedConnection(con, trackNr);
      return;
    }

    if (conIsEstablishedAtClick) {
      this.removeConnection(con, trackNr);
      return;
    }

    if (conIsEstablished && !conIsEstablishedAtClick) {
      return;
    }

    if (conIsOpponentsAtClick) {
      this.removeConnection(con, trackNr);
      this.addEstablishedConnection(con, trackNr);
      return;
    }

    this.addEstablishedConnection(con, trackNr);
  }

  toggleOpponentConnection(con: Connection, index: number, trackNr = 0): void {
    const conIsEmpty = !con.player1 && !con.player2;
    const conIsEstablishedAtClick = this.establishedConnections
      ?.filter((e) =>
        trackNr === 0
          ? e.player1 === this.gameNetwork
          : e.player2 === this.gameNetwork,
      )
      .some((e) => e.hasSameCities(con));

    let conIsOtherOpponentsAtClick = false;
    for (let i = 0; i < this.opponentCount; i++) {
      if (
        i !== index &&
        this.allOpponentsConnections[i]
          .filter((e) =>
            trackNr === 0
              ? e.player1 === this.gameNetwork.getOpponentNetwork(i)
              : e.player2 === this.gameNetwork.getOpponentNetwork(i),
          )
          .some((e) => e.hasSameCities(con))
      ) {
        conIsOtherOpponentsAtClick = true;
      }
    }

    const conIsThisIndexOpponents = this.allOpponentsConnections[
      index
    ].some((e) => e.hasSameCities(con));

    const conIsThisIndexOpponentsAtClick = this.allOpponentsConnections[index]
      .filter((e) =>
        trackNr === 0
          ? e.player1 === this.gameNetwork.getOpponentNetwork(index)
          : e.player2 === this.gameNetwork.getOpponentNetwork(index),
      )
      .some((e) => e.hasSameCities(con));

    if (conIsEmpty) {
      this.addOpponentConnection(con, index, trackNr);
      return;
    }

    if (conIsThisIndexOpponentsAtClick) {
      this.removeConnection(con, trackNr);
      return;
    }

    if (conIsThisIndexOpponents && !conIsThisIndexOpponentsAtClick) {
      return;
    }

    if (conIsEstablishedAtClick || conIsOtherOpponentsAtClick) {
      this.removeConnection(con, trackNr);
      this.addOpponentConnection(con, index, trackNr);
      return;
    }

    this.addOpponentConnection(con, index, trackNr);
  }

  removeConnection(con: Connection, trackNr: number): void {
    if (
      this.establishedConnections
        ?.filter((e) =>
          trackNr === 0
            ? e.player1 === this.gameNetwork
            : e.player2 === this.gameNetwork,
        )
        .some((e) => e.hasSameCities(con))
    ) {
      this.removeEstablishedConnection(con, trackNr);
    } else {
      for (let i = 0; i < this.opponentCount; i++) {
        if (
          this.allOpponentsConnections[i] &&
          this.allOpponentsConnections[i]
            .filter((e) =>
              trackNr === 0
                ? e.player1 === this.gameNetwork.getOpponentNetwork(i)
                : e.player2 === this.gameNetwork.getOpponentNetwork(i),
            )
            .includes(con)
        ) {
          this.removeOpponentConnection(con, i, trackNr);
        }
      }
    }
  }

  removeEstablishedConnection(con: Connection, trackNr = 0): void {
    removeItemOnce(this.establishedConnections, con);
    this.gameNetwork.removeEstablished(con, trackNr);
  }

  addEstablishedConnection(con: Connection, trackNr = 0): void {
    this.establishedConnections.push(con);
    this.gameNetwork.addEstablished(con, trackNr);
  }

  removeOpponentConnection(con: Connection, index: number, trackNr = 0): void {
    removeItemOnce(this.allOpponentsConnections[index], con);
    this.gameNetwork.removeCannotPass(con, index, trackNr);
  }

  addOpponentConnection(con: Connection, index: number, trackNr = 0): void {
    this.allOpponentsConnections[index].push(con);
    this.gameNetwork.addCannotPass(con, index, trackNr);
  }

  setImpConTickets(tickets: Ticket[]): void {
    this.impConTickets = tickets;
  }

  clearImpConTickets(): void {
    this.impConTickets = [];
  }

  reset(): void {
    this.initMapStore();
  }

  addPlayer(): void {
    if (this.playerCount < 5) {
      this.playerCount++;
      this.reset();
    }
  }

  removePlayer(): void {
    if (this.playerCount > 2) {
      this.playerCount--;
      this.reset();
    }
  }

  setSelectedOpponentIndex(value: number): void {
    this.selectedOpponentIndex = value;
  }
}
