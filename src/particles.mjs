import { attract, repulse } from "./gravity_calculations.mjs";
import { randRangeInt } from "./utils.mjs";

export class Particle {
  /**
   * A particle...
   * @param {Number} id The id of the particle
   * @param {settings} settings The simulation settings
   * @param {Object} param2 The parameters of the particle
   */
  constructor(id, settings, { x, y, vx, vy, mass }) {
    if (!Number.isInteger(id)) throw "Error: Id not provided.";
    if (!(Number.isInteger(x) && Number.isInteger(y)))
      throw "Error: Position not provided.";
    if (!settings) throw "Error: Settings not provided.";
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.settings = settings;
    this.mass =
      mass ||
      randRangeInt(this.settings.constants.max_mass, this.settings.constants.min_mass);
    if ((this.r = this.settings.radius(mass)) > this.settings.constants.max_radius)
      this.r = this.settings.constants.max_radius;
    else if (this.r < this.settings.constants.min_radius)
      this.r = this.settings.constants.min_radius;
  }

  static getClassName() {
    return "Particle";
  }

  getClassName() {
    return Particle.getClassName();
  }

  detectCollision(otherParticle) {
    // Find distance between particles
    const dx = this.x - otherParticle.x,
      dy = this.y - otherParticle.y;
    const dSq = dx ** 2 + dy ** 2;

    if (dSq <= (this.r + otherParticle.r) ** 2) {
      const d = Math.sqrt(dSq);

      /* const angle = Math.atan2(dy, dx);

      otherParticle.x = this.x - (this.r + otherParticle.r) * Math.cos(angle);
      otherParticle.y = this.y - (this.r + otherParticle.r) * Math.sin(angle); */

      // Normalised vectors
      const nvx = dx / d,
        nvy = dy / d;

      // Relative vectors
      const rvx = otherParticle.vx - this.vx,
        rvy = otherParticle.vy - this.vy;

      // Calculate the dot product of normalised and relative vectors
      const speed =
        (rvx * nvx + rvy * nvy) *
        (this.settings.toggles.coefficient_of_restitution
          ? this.settings.variables.coefficient_of_restitution
          : 1);

      if (speed < 0) return;

      // Calculate the impulse of the collision
      const impulse = (2 * speed) / (this.mass + otherParticle.mass);

      // Calculate the velocity based on the impulse
      this.vx += impulse * otherParticle.mass * nvx;
      this.vy += impulse * otherParticle.mass * nvy;
      otherParticle.vx -= impulse * this.mass * nvx;
      otherParticle.vy -= impulse * this.mass * nvy;
    }
  }

  #checkBoundaries(width, height) {
    let diff;
    const cor = this.settings.toggles.coefficient_of_restitution
      ? this.settings.variables.coefficient_of_restitution
      : 1;

    if ((diff = this.x - this.r) < 0) {
      this.x = this.r;
      this.vx = Math.abs(this.vx) * cor + diff;
    } else if ((diff = this.x + this.r) > width) {
      this.x = width - this.r;
      this.vx = -Math.abs(this.vx) * cor - (width - diff);
    }

    if ((diff = this.y - this.r) < 0) {
      this.y = this.r;
      this.vy = Math.abs(this.vy) * cor + diff;
    } else if ((diff = this.y + this.r) > height) {
      this.y = height - this.r;
      this.vy = -Math.abs(this.vy) * cor - (height - diff);
    }
  }

  updatePosition() {
    this.x += this.vx * this.settings.variables.dt;
    this.y += this.vy * this.settings.variables.dt;
  }

  #updateVelocity() {
    if (this.settings.toggles.gravity)
      this.vy += this.settings.variables.gravity * this.settings.variables.dt;

    if (this.settings.toggles.drag) {
      this.vx *= this.settings.variables.drag;
      this.vy *= this.settings.variables.drag;
    }

    this.updateColour();
  }

  updateColour() {
    this.colour = `hsl(${(this.colourComp =
      Math.abs(this.vx / 2) + Math.abs(this.vy / 2))},100%,${this.colourComp / 2 + 30}%)`;
  }

  updateCalculations(width, height) {
    this.#checkBoundaries(width, height);
    this.#updateVelocity();
  }

  update(width, height) {
    this.updateCalculations(width, height);
    this.updatePosition();
  }

  dispose() {
    for (const prop of Object.keys(this)) delete this[prop];
  }
}

export class AttractorParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 100;
    this.colour = "#6060ff";
  }

  static getClassName() {
    return "AttractorParticle";
  }

  getClassName() {
    return AttractorParticle.getClassName();
  }

  #attract(p) {
    attract(this, p, this.settings);
  }

  updateColour() {}

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) this.#attract(p);
  }

  update(width, height, [near]) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}

export class RepulserParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 100;
    this.colour = "#ff6060";
  }

  static getClassName() {
    return "RepulserParticle";
  }

  getClassName() {
    return RepulserParticle.getClassName();
  }

  #repulse(p) {
    repulse(this, p, this.settings);
  }

  updateColour() {}

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) this.#repulse(p);
  }

  update(width, height, [near]) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}

export class ChargedParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 100;
    this.charge = params.charge || [-1, 1][~~(Math.random() * 2)];
    this.colour = this.charge > 0 ? "#ff1010" : "#1010ff";
  }

  static getClassName() {
    return "ChargedParticle";
  }

  getClassName() {
    return ChargedParticle.getClassName();
  }

  #attract(p) {
    attract(this, p, this.settings);
  }

  #repulse(p) {
    repulse(this, p, this.settings);
  }

  updateColour() {}

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) {
      if (p instanceof ChargedParticle)
        if ((this.charge ^ p.charge) >= 0) this.#repulse(p);
        else this.#attract(p);
    }
  }

  update(width, height, [near]) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}
