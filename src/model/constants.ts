export abstract class Constants {
  static readonly TOTAL_TRAINS = 45;
  /**
   * How important are points in finding the minimum distance.
   *
   * Default 0.0: points are not considered at all in finding the min
   *
   * Weigths increase as distances increase till 0.19
   *
   * After that longer routes are considered better than shorter routes.
   *
   * Max 0.39: keep all the routes still in positive numbers
   * Any value beyond this make longer routes having negative distance.
   *
   * weight = distance - POINT_IMPORTANCE * points
   */
  static readonly POINT_IMPORTANCE = 0.0;

  /**
   * Ticket reporting threshold
   */
  static readonly REMAININING_CONNECTIONS_LEN = 2;
  static readonly REMAINING_TRAINS = 12;
  static readonly COMPLETION_PERC = 0.5;
}
