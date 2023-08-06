import { randRange, randRangeInt } from "./utils.mjs";

export class Particle {
  /**
   * A particle...
   * @param {Number} id The id of the particle
   * @param {settings} settings The simulation settings
   * @param {Object} param2 The parameters of the particle
   */
  constructor(id, settings, { x, y, vx, vy, mass }) {
    if (!Number.isInteger(id)) throw "Error: Id not provided.";
    if (!(x && y)) throw "Error: Position not provided.";
    if (!settings) throw "Error: Settings not provided.";
    this.x = x;
    this.y = y;
    this.vx = vx || randRange(50, -50);
    this.vy = vy || randRange(10);
    this.settings = settings;
    this.mass =
      mass ||
      randRangeInt(
        this.settings.constants.max_mass,
        this.settings.constants.min_mass
      );
    if (
      (this.radius = this.settings.radius(mass)) >
      this.settings.constants.max_radius
    )
      this.radius = this.settings.constants.max_radius;
    else if (this.radius < this.settings.constants.min_radius)
      this.radius = this.settings.constants.min_radius;

    this.id = id;
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

    if (dSq <= (this.radius + otherParticle.radius) ** 2) {
      const d = Math.sqrt(dSq);

      // Normalised vectors
      const nvx = dx / d,
        nvy = dy / d;

      // Relative vectors
      const rvx = otherParticle.vx - this.vx,
        rvy = otherParticle.vy - this.vy;

      // Calculate the dot product of normalised and relative vectors
      // Essentially, relative magnitude in normalised direction
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
    switch (true) {
      case (diff = this.x - this.radius) < 0:
        this.x = this.radius;
        this.vx = Math.abs(this.vx) * cor + diff;
        break;
      case (diff = this.x + this.radius) > width:
        this.x = width - this.radius;
        this.vx = -Math.abs(this.vx) * cor - (width - diff);
        break;
      case (diff = this.y - this.radius) < 0:
        this.y = this.radius;
        this.vy = Math.abs(this.vy) * cor + diff;
        break;
      case (diff = this.y + this.radius) > height:
        this.y = height - this.radius;
        this.vy = -Math.abs(this.vy) * cor - (height - diff);
        break;
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
      Math.abs(this.vx / 2) + Math.abs(this.vy / 2))},100%,${
      this.colourComp / 2 + 30
    }%)`;
  }

  updateCalculations(width, height) {
    this.#checkBoundaries(width, height);
    this.#updateVelocity();
  }

  update(width, height) {
    this.updateCalculations(width, height);
    this.updatePosition();
  }
}

export class AttractorParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 100;
    this.colour = "#1010ff";
  }

  static getClassName() {
    return "AttractorParticle";
  }

  getClassName() {
    return AttractorParticle.getClassName();
  }

  #attract(p) {
    const dx = this.x - p.x,
      dy = this.y - p.y;
    const dSq = dx ** 2 + dy ** 2;

    const f =
      (this.strength * this.settings.variables.attraction_strength) /
      (dSq *
        Math.sqrt(
          dSq +
            (this.settings.toggles.softening_constant
              ? this.settings.variables.softening_constant
              : 0)
        ));

    p.vx += f * dx * this.settings.variables.dt;
    p.vy += f * dy * this.settings.variables.dt;
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
    this.colour = "#10ff10";
  }

  static getClassName() {
    return "RepulserParticle";
  }

  getClassName() {
    return RepulserParticle.getClassName();
  }

  #repulse(p) {
    const dx = this.x - p.x,
      dy = this.y - p.y;
    const dSq = dx ** 2 + dy ** 2;

    const f =
      (this.strength * 2.5 * this.settings.variables.repulsion_strength) /
      (dSq *
        Math.sqrt(
          dSq +
            (this.settings.toggles.softening_constant
              ? this.settings.variables.softening_constant
              : 0)
        ));

    p.vx -= f * dx * this.settings.variables.dt;
    p.vy -= f * dy * this.settings.variables.dt;
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
    const dx = this.x - p.x,
      dy = this.y - p.y;
    const dSq = dx ** 2 + dy ** 2;

    const f =
      (this.strength * this.settings.variables.attraction_strength) /
      (dSq *
        Math.sqrt(
          dSq +
            (this.settings.toggles.softening_constant
              ? this.settings.variables.softening_constant
              : 0)
        ));

    p.vx += f * dx * this.settings.variables.dt;
    p.vy += f * dy * this.settings.variables.dt;
  }

  #repulse(p) {
    const dx = this.x - p.x,
      dy = this.y - p.y;
    const dSq = dx ** 2 + dy ** 2;

    const f =
      (this.strength * 2.5 * this.settings.variables.repulsion_strength) /
      (dSq *
        Math.sqrt(
          dSq +
            (this.settings.toggles.softening_constant
              ? this.settings.variables.softening_constant
              : 0)
        ));

    p.vx -= f * dx * this.settings.variables.dt;
    p.vy -= f * dy * this.settings.variables.dt;
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
