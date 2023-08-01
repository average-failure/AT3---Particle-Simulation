import { Particle } from "./particles.mjs";
import { randRangeInt } from "./utils.mjs";

export class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.grid = {};
    this.particles = [];
    // this.pool = new WorkerPool(4, "src/worker.js");
  }

  #hashKey(x, y) {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }

  newParticle(particle = {}) {
    const {
        radius = randRangeInt(this.maxRadius, 1),
        x = randRangeInt(this.width - radius, radius),
        y = randRangeInt(this.height - radius, radius),
        vx,
        vy,
        colour,
      } = particle,
      key = this.#hashKey(x, y);
    if (!this.grid[key]) this.grid[key] = new Set();
    const p =
      particle instanceof Particle
        ? particle
        : new Particle(x, y, vx, vy, radius, colour);
    this.grid[key].add(p);
    this.particles.push(p);
  }

  removeParticle(x, y, particle) {
    if (!(particle instanceof Particle)) return;
    const key = this.#hashKey(x, y);
    this.grid[key]?.delete(particle);
    this.#cleanup();
  }

  #cleanup() {
    for (const key of this.grid)
      if (this.grid.hasOwnProperty(key) && !(this.grid[key.size] > 0))
        delete this.grid[key];
  }

  findNear(particle, radius) {
    const { x, y } = particle,
      near = new Set(),
      hashKey = [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)],
      cellRad = Math.ceil(radius / this.cellSize);

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
            let dx, dy;
            const distBetweenSq = (dx = p.x - x) * dx + (dy = p.y - y) * dy;
            if (distBetweenSq <= radius ** 2 && p !== particle) near.add(p);
          }
      }

    return Array.from(near);
  }
}
