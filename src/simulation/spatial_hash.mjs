export class SpatialHash {
  /**
   * A spatial hash that allows for finding neighbours to increase performance
   * @param {settings} settings The simulation settings
   */
  constructor(settings) {
    this.settings = settings;
    this.grid = {};
    this.preCleanTime = performance.now();
  }

  /**
   * A helper method to calculate a hash key from given x and y coordinates
   * @param {number} x An x coordinate to get the hash key from
   * @param {number} y A y coordinate to get the hash key from
   * @returns The hash key as a string
   */
  #hashKey(x, y) {
    return `${~~(x / this.settings.constants.cell_size)},${~~(
      y / this.settings.constants.cell_size
    )}`;
  }

  /**
   * Adds a new client to the grid
   * @param {*} client The client to add to the grid
   */
  newClient(client) {
    const key = this.#hashKey(client.x, client.y);
    if (!this.grid[key]) this.grid[key] = new Set();
    this.grid[key].add(client);
  }

  /**
   * Removes a specified client from the grid
   * @param {*} client The client to remove
   */
  removeClient(client) {
    this.grid[this.#hashKey(client.x, client.y)]?.delete(client);
    this.#cleanup();
  }

  /**
   * Removes empty cells from the grid
   */
  #cleanup() {
    if (performance.now() - this.preCleanTime < 1000) return;
    for (const key of Object.keys(this.grid))
      if (!(this.grid[key].size > 0)) delete this.grid[key];
    this.preCleanTime = performance.now();
  }

  /**
   * Finds all neighbours of a given client within a specified radius
   * @param {*} client The client to find neighbours of
   * @param {number} radius The radius of the search (not in cells)
   * @returns All clients in the radius around the provided client
   */
  findNear(client, radius) {
    const { x, y } = client,
      near = new Set(),
      hashKey = [
        ~~(x / this.settings.constants.cell_size),
        ~~(y / this.settings.constants.cell_size),
      ],
      cellRad = Math.ceil(radius / this.settings.constants.cell_size);

    for (let cx = hashKey[0] - cellRad, mx = hashKey[0] + cellRad; cx <= mx; cx++) {
      for (let cy = hashKey[1] - cellRad, my = hashKey[1] + cellRad; cy <= my; cy++) {
        const key = `${cx},${cy}`;
        if (this.grid.hasOwnProperty(key)) {
          for (const c of this.grid[key]) {
            const distBetweenSq = (c.x - x) ** 2 + (c.y - y) ** 2;
            if (distBetweenSq <= radius ** 2 && c !== client) near.add(c);
          }
        }
      }
    }

    return Array.from(near);
  }
}
