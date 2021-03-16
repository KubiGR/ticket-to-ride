import { getUSAConnectionsFromJSON } from 'model/usaMap';
import { Edge } from 'model/alg/edge';
import { FloydWarshall } from 'model/alg/floydwarshall';

export class GameNetwork {
  graph: FloydWarshall<string> | undefined;

  parseConnections(): void {
    const usaEdges: Edge<string>[] = getUSAConnectionsFromJSON().map((c) => {
      return { from: c.from.name, to: c.to.name, weight: c.weight };
    });

    this.graph = new FloydWarshall(usaEdges);
    this.graph.floydWarshall();
  }

  getShortestPath(from: string, to: string): string[] | undefined {
    return this.graph?.getShortestPath(from, to);
  }

  getShortestVisitingPath(cities: string[]): string[] | undefined {
    return this.graph?.getShortestVisitingPath(cities);
  }

  getMinSpanningTreeOfShortestRoutes(
    cities: string[],
  ): Edge<string>[] | undefined {
    return this.graph?.getMinSpanningTreeOfShortestRoutes(cities);
  }
}
