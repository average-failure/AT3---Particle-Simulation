import { Particle } from "./particles.mjs";
import { randRangeInt } from "./utils.mjs";

export class SpatialHash {
  /**
   * A spatial hash that allows for finding neighbours to increase performance
   * @param {settings} settings The simulation settings
   */
  constructor(settings) {
    this.settings = settings;
    this.grid = {};
    this.particles = [];
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
   * Adds a new Particle to the spatial hash grid and particles array
   * @param {Particle} particle An instance of a Particle or an object containing parameters for the Particle to add to the hash
   */
  newParticle(particle = {}) {
    const {
        mass = randRangeInt(
          this.settings.constants.max_mass,
          this.settings.constants.min_mass
        ),
        x = randRangeInt(
          this.width - this.settings.radius(mass),
          this.settings.radius(mass)
        ),
        y = randRangeInt(
          this.height - this.settings.radius(mass),
          this.settings.radius(mass)
        ),
        vx,
        vy,
      } = particle,
      key = this.#hashKey(x, y);
    if (!this.grid[key]) this.grid[key] = new Set();
    const p =
      particle instanceof Particle
        ? particle
        : new Particle(x, y, vx, vy, mass, this.settings);
    this.grid[key].add(p);
    this.particles.push(p);
  }

  /**
   * Adds the specified particle back to the grid
   * @param {Particle} particle The instance of Particle to update
   */
  addParticle(particle) {
    if (!(particle instanceof Particle)) return;
    const key = this.#hashKey(particle.x, particle.y);
    if (!this.grid[key]) this.grid[key] = new Set();
    this.grid[key].add(particle);
  }

  /**
   * Deletes the specified particle from the grid and array
   * @param {Particle} particle The instance of Particle to remove
   */
  deleteParticle(particle) {
    if (!(particle instanceof Particle)) return;
    const key = this.#hashKey(particle.x, particle.y);
    this.grid[key]?.delete(particle);
    const index = this.particles.indexOf(particle);
    if (index > -1) this.particles.splice(index, 1);
    this.#cleanup();
  }

  /**
   * Removes the specified particle from the grid
   * @param {Particle} particle The instance of Particle to remove
   */
  removeParticle(particle) {
    if (!(particle instanceof Particle)) return;
    this.grid[this.#hashKey(particle.x, particle.y)]?.delete(particle);
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
   * Finds all neighbours of a given particle within a specified radius
   * @param {Particle} particle The particle to find neighbours of
   * @param {number} radius The radius of the search (not in cells)
   * @returns All particles in the radius around the provided particle
   */
  findNear(particle, radius) {
    const { x, y } = particle,
      near = new Set(),
      hashKey = [
        ~~(x / this.settings.constants.cell_size),
        ~~(y / this.settings.constants.cell_size),
      ],
      cellRad = Math.ceil(radius / this.settings.constants.cell_size);

    for (
      let currX = hashKey[0] - cellRad, maxX = hashKey[0] + cellRad;
      currX <= maxX;
      currX++
    )
      for (
        let currY = hashKey[1] - cellRad, maxY = hashKey[1] + cellRad;
        currY <= maxY;
        currY++
      ) {
        const key = `${currX},${currY}`;
        if (this.grid[key])
          for (const p of this.grid[key]) {
            const distBetweenSq = (p.x - x) ** 2 + (p.y - y) ** 2;
            if (distBetweenSq <= radius ** 2 && p !== particle) near.add(p);
          }
      }

    return Array.from(near);
  }
}
