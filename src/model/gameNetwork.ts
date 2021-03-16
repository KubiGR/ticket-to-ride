import { getUSAConnectionsFromJSON } from 'model/usaMap';
import { FloydWarshall, Edge } from 'floyd-warshall-shortest';
import { kruskal } from 'kruskal-mst';

export class GameNetwork {
  graph: FloydWarshall<string> | undefined;

  parseConnections(): void {
    const usaEdges: Edge<string>[] = getUSAConnectionsFromJSON().map((c) => {
      return { from: c.from.name, to: c.to.name, weight: c.weight };
    });

    this.graph = new FloydWarshall(usaEdges, false);
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
    if (this.graph === undefined) return undefined;
    const graph = this.graph; // for editor!!

    if (!this.graph.isDirected()) {
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
    } else {
      return [];
    }
  }
}
