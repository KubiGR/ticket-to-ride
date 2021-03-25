export abstract class UIConstants {
  static readonly mapHeight = 800;
  static readonly mapWidth = UIConstants.mapHeight * 1.56;
  static readonly lineStrokeSize = UIConstants.mapWidth * 0.012;
  static readonly cityStrokeSize = UIConstants.mapWidth * 0.003;
  static readonly cityFillRadius = UIConstants.mapWidth * 0.008;
  static readonly rectWidth = UIConstants.mapWidth * 0.012;
  static readonly bestRouteConnectionColor = '#7d85ff';
  static readonly cannotPassConnectionColor = '#ff5959';
  static readonly establishedConnectionColor = '#4551ff';
  static readonly defaultCityFillColor = '#087016';
  static readonly ticketCityFillColor = '#245096';
  static readonly selectedCityStrokeColor = '#9cad00';
  static readonly highlightedCityFillColor = '#e300a3';
  static readonly highlightedCityStrokeColor = '#1c1f1d';
}
