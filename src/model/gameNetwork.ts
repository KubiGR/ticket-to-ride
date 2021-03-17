import { getUSAConnectionsFromJSON } from 'model/usaMap';
import { FloydWarshall, Edge } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst';

export class GameNetwork {
  graph!: FloydWarshall<string>;
  cannotPass: Edge<string>[] = [];
  shouldPass: Edge<string>[] = [];
  usaEdges!: Edge<string>[];

  constructor() {
    this.parseConnections();
  }

  parseConnections(): void {
    this.usaEdges = getUSAConnectionsFromJSON().map((c) => {
      return { from: c.from.name, to: c.to.name, weight: c.weight };
    });

    this.graph = new FloydWarshall(this.usaEdges, false);
  }

  addShouldPass(edge: Edge<string>): void {
    this.shouldPass.push(edge);
    this.processEdgeRestrictions();
  }

  addCannotPass(edge: Edge<string>): void {
    this.cannotPass.push(edge);
    this.processEdgeRestrictions();
  }

  processEdgeRestrictions(): void {
    const includes = function (
      cannotPass: Edge<string>[],
      e: Edge<string>,
    ): boolean {
      for (let i = 0; i < cannotPass.length; i++) {
        const cannot = cannotPass[i];
        if (
          (cannot.from === e.from && cannot.to == e.to) ||
          (cannot.to === e.from && cannot.from === e.to)
        )
          return true;
      }
      return false;
    };

    const restrictedEdges = this.usaEdges
      .slice()
      .filter((e) => !includes(this.cannotPass, e));

    this.shouldPass.forEach((edge) => {
      const found = restrictedEdges.find(
        (e) =>
          (edge.from === e.from && edge.to == e.to) ||
          (edge.to === e.from && edge.from === e.to),
      );
      if (found === undefined)
        throw new Error('Not found shouldPass edge: ' + edge);
      {
        const index = restrictedEdges.indexOf(found);
        restrictedEdges.splice(index, 1);
        restrictedEdges.push({ from: found.from, to: found.to, weight: 0 });
      }
    });
    this.graph = new FloydWarshall(restrictedEdges, false);
  }

  getShortestPath(from: string, to: string): string[] {
    return this.graph.getShortestPath(from, to);
  }

  getShortestVisitingPath(cities: string[]): string[] {
    return this.graph.getShortestVisitingPath(cities);
  }

  getMinSpanningTreeOfShortestRoutes(cities: string[]): Edge<string>[] {
    const graph = this.graph; // for editor!!

    const kruskalEdges: Edge<string>[] = [];
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        kruskalEdges.push({
          from: cities[i],
          to: cities[j],
          weight: graph.getShortestDistance(cities[i], cities[j]),
        });
      }
    }
    const connections: Edge<string>[] = [];
    kruskal(kruskalEdges).forEach((solutionEdge) => {
      const shortestPath = graph.getShortestPath(
        solutionEdge.from,
        solutionEdge.to,
      );
      for (let i = 0; i < shortestPath.length - 1; i++) {
        connections.push({
          from: shortestPath[i],
          to: shortestPath[i + 1],
          weight: graph.getShortestDistance(
            shortestPath[i],
            shortestPath[i + 1],
          ),
        });
      }
    });

    return connections;
  }
}
