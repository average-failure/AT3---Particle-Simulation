import {
  attract,
  repulse,
  circleCollision,
  detectCircleCollision,
  randRangeInt,
} from "../utils";

export class Particle {
  /**
   * A particle...
   * @param {Number} id The id of the particle
   * @param {settings} settings The simulation settings
   * @param {Object} param2 The parameters of the particle
   */
  constructor(
    id,
    settings,
    { x, y, vx, vy, mass, radius, immortal, collision, lifespan, colour, paths, ratio }
  ) {
    if (!Number.isInteger(id)) throw "Error: Id not provided.";
    if (!(Number.isFinite(x) && Number.isFinite(y)))
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
      randRangeInt(settings.constants.max_random_mass, settings.constants.min_mass);
    this.r = Math.min(
      Math.max(
        Math.ceil(radius || this.mass / settings.constants.mass_radius_ratio),
        settings.constants.min_radius
      ),
      settings.constants.max_radius
    );
    this.ratio = ratio || this.mass / this.r;

    if (colour) {
      this.colour = colour;
      this.updateColour = () => {};
    }
    this.updateColour();

    this.collision = collision || 0;
    this.immortal = immortal || 0;
    this.initialLife = lifespan || 10000 * (Math.random() * 0.9 + 0.1);
    this.lifespan = this.initialLife;
    this.lifeDrain = 1;

    (this.path = new Path2D()).arc(0, 0, this.r, 0, Math.PI * 2);

    if (paths) {
      this.paths = paths;
      for (const path of this.paths) path.path = new Path2D(path.path);
    }
  }

  static getClassName() {
    return "Particle";
  }

  getClassName() {
    return Particle.getClassName();
  }

  static getColour(vx, vy) {
    const colourComp = Math.abs(vx / 5) + Math.abs(vy / 5);
    return `hsl(${colourComp},100%,${Math.min(colourComp / 2 + 30, 80)}%)`;
  }

  /* pointParticle(p, px, py) {
    return (p.x - px) ** 2 + (p.y - py) ** 2 <= p.r ** 2;
  }

  linePoint(l1x, l1y, l2x, l2y, px, py, buffer = 0.1) {
    const d = (px - l1x) ** 2 + (py - l1y) ** 2 + ((px - l2x) ** 2 + (py - l2y) ** 2);
    const len = (l1x - l2x) ** 2 + (l1y - l2y) ** 2;
    return d >= len - buffer ** 2 && d <= len + buffer ** 2;
  }

  lineParticle(p, l1x, l1y, l2x, l2y) {
    if (this.pointParticle(p, l1x, l1y) || this.pointParticle(p, l2x, l2y)) return true;

    const len = (l1x - l2x) ** 2 + (l1y - l2y) ** 2;

    const dot = ((p.x - l1x) * (l2x - l1x) + (p.y - l1y) * (l2y - l1y)) / len;

    const cx = l1x + dot * (l2x - l1x),
      cy = l1y + dot * (l2y - l1y);

    if (!this.linePoint(l1x, l1y, l2x, l2y, cx, cy)) return false;

    return (cx - p.x) ** 2 + (cy - p.y) ** 2 <= p.r ** 2;
  } */

  /* sweptAABB(p) {
    const rvx = p.vx - this.vx,
      rvy = p.vy - this.vy;

    const dx = p.x - this.x,
      dy = p.y - this.y;

    const timeToCollision = (dx * rvx + dy * rvy) / (rvx ** 2 + rvy ** 2);

    if (timeToCollision < 0 || timeToCollision > 1) return false;

    const cx = this.x + this.vx * timeToCollision,
      cy = this.y + this.vy * timeToCollision;

    const dSq = (dx - rvx * timeToCollision) ** 2 + (dy - rvy * timeToCollision) ** 2;

    const colliding = dSq <= (this.r + p.r) ** 2;

    return { colliding, cx, cy };
  } */

  /* fastCollision(p) {
    const rvx = p.vx - this.vx,
      rvy = p.vy - this.vy;

    const rd = Math.sqrt(rvx ** 2 + rvy ** 2);

    const rSum = this.r + p.r;

    const minDist = rSum * 0.1;

    if (rd < minDist) {
      const penDepth = minDist - rd;

      const pdx = rvx / rd,
        pdy = rvy / rd;

      this.x -= pdx * penDepth * 0.5;
      this.x -= pdy * penDepth * 0.5;
      p.x += pdx * penDepth * 0.5;
      p.x += pdy * penDepth * 0.5;
    }
  } */

  // projectCollision(p) {
  //   /* this.projection.set(p.x - this.x, p.y - this.y);
  //   this.line.set(this.vx, this.vy);
  //   const normal = this.line.getNormal();
  //   const projectionOnNormal = this.projection.projectOn(normal);
  //   console.log(projectionOnNormal);
  //   if (Math.abs(projectionOnNormal) <= p.r) {
  //     this.collide(p, {
  //       dx: this.line.x,
  //       dy: this.line.y,
  //       d: projectionOnNormal,
  //     });
  //   }
  //   // ! projection not working */

  //   // this.fastCollision(p);

  //   /* const { colliding, cx, cy } = this.sweptAABB(p) || {};

  //   if (colliding) {
  //     console.log("colliding");
  //     this.x = cx;
  //     this.y = cy;
  //   } */

  //   /* if (this.lineParticle(p, this.x, this.y, this.x - this.vx, this.y - this.vy)) {
  //     const dx = this.x - p.x,
  //       dy = this.y - p.y;
  //     const dSq = dx ** 2 + dy ** 2;
  //     this.collide(p, { dx, dy, dSq });
  //   } */
  // }

  detectCollision(p) {
    if (this.grabbed) {
      const collision = circleCollision(
        this,
        p,
        "other",
        this.settings.toggles.coefficient_of_restitution
          ? this.settings.variables.coefficient_of_restitution
          : 1
      );
      if (collision !== false) {
        p.vx -= collision.speed * collision.nvx * 2;
        p.vy -= collision.speed * collision.nvy * 2;
      }
      return;
    }

    if (this.collision > 0 || p.collision > 0 || p.grabbed) return;

    const collision = circleCollision(
      this,
      p,
      "this",
      this.settings.toggles.coefficient_of_restitution
        ? this.settings.variables.coefficient_of_restitution
        : 1
    );

    if (collision !== false) {
      // Calculate the impulse of the collision
      const impulse = (2 * collision.speed) / (this.mass + p.mass);

      // Calculate the velocity based on the impulse
      this.vx += impulse * p.mass * collision.nvx;
      this.vy += impulse * p.mass * collision.nvy;
      p.vx -= impulse * this.mass * collision.nvx;
      p.vy -= impulse * this.mass * collision.nvy;

      this.lifeDrain += collision.speed / 500;
      p.lifeDrain += collision.speed / 500;
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
      this.lifeDrain += 0.012 + Math.abs(this.vx / 10000);
    } else if ((diff = this.x + this.r) > width) {
      this.x = width - this.r;
      this.vx = -Math.abs(this.vx) * cor - (width - diff);
      this.lifeDrain += 0.012 + Math.abs(this.vx / 10000);
    }

    if ((diff = this.y - this.r) < 0) {
      this.y = this.r;
      this.vy = Math.abs(this.vy) * cor + diff;
      this.lifeDrain += 0.012 + Math.abs(this.vy / 10000);
    } else if ((diff = this.y + this.r) > height) {
      this.y = height - this.r;
      this.vy = -Math.abs(this.vy) * cor - (height - diff);
      this.lifeDrain += 0.012 + Math.abs(this.vy / 10000);
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
      const drag = 1 + (this.settings.variables.drag * this.settings.variables.dt) / 100;
      this.vx /= drag;
      this.vy /= drag;
    }

    if (this.getClassName() !== "Particle") return;

    this.updateColour();
  }

  updateColour() {
    this.colour = Particle.getColour(this.vx, this.vy);
  }

  #updateStats() {
    if (this.immortal > 0) this.immortal -= this.settings.variables.time_factor;
    if (this.collision > 0) this.collision -= this.settings.variables.time_factor;
    if (this.lifespan > 0 && this.settings.toggles.lifespan && !this.grabbed) {
      if (this.lifespan > 50000)
        this.lifespan -=
          this.lifespan ** 0.3 * (this.lifeDrain * this.settings.variables.dt);
      else if (this.lifespan > this.initialLife * 0.75)
        this.lifespan -=
          this.lifespan ** 0.2 * (this.lifeDrain * this.settings.variables.dt);
      else
        this.lifespan -=
          this.lifespan ** 0.1 * (this.lifeDrain * this.settings.variables.dt);
    }
    if (this.lifeDrain > 1) this.lifeDrain -= 0.1 * this.settings.variables.dt;
    else this.lifeDrain = 1;
  }

  updateCalculations(width, height) {
    this.#checkBoundaries(width, height);
    this.#updateVelocity();
    this.#updateStats();
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

    this.strength = params.strength || this.mass;
    this.colour = AttractorParticle.getColour();
  }

  static getClassName() {
    return "AttractorParticle";
  }

  getClassName() {
    return AttractorParticle.getClassName();
  }

  static getColour() {
    return "hsl(240,100%,69%)";
  }

  #attract(p) {
    attract(this, p, this.settings);
  }

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) this.#attract(p);
  }

  update(width, height, near) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}

export class RepulserParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || this.mass;
    this.colour = RepulserParticle.getColour();
  }

  static getClassName() {
    return "RepulserParticle";
  }

  getClassName() {
    return RepulserParticle.getClassName();
  }

  static getColour() {
    return "hsl(0,100%,69%)";
  }

  #repulse(p) {
    repulse(this, p, this.settings);
  }

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) this.#repulse(p);
  }

  update(width, height, near) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}

export class ChargedParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || this.mass;
    this.charge = params.charge || [-1, 1][~~(Math.random() * 2)];
    this.colour = ChargedParticle.getColour(this.charge);
  }

  static getClassName() {
    return "ChargedParticle";
  }

  getClassName() {
    return ChargedParticle.getClassName();
  }

  static getColour(charge) {
    return `hsl(${charge > 0 ? 0 : 240},100%,53%)`;
  }

  #attract(p) {
    attract(this, p, this.settings);
  }

  #repulse(p) {
    repulse(this, p, this.settings);
  }

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    for (const p of near) {
      if (p instanceof ChargedParticle)
        if ((this.charge ^ p.charge) >= 0) this.#repulse(p);
        else this.#attract(p);
    }
  }

  update(width, height, near) {
    this.updateCalculations(width, height, near);

    this.updatePosition();
  }
}

export class MergeParticle extends Particle {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.colour = MergeParticle.getColour(this.mass);
  }

  static getClassName() {
    return "MergeParticle";
  }

  getClassName() {
    return MergeParticle.getClassName();
  }

  static getColour(mass) {
    return `hsl(120,${Math.min(15 + mass / 50, 100)}%,${Math.max(80 - mass / 50, 15)}%)`;
  }

  detectCollision(p) {
    if (p instanceof MergeParticle) return;
    super.detectCollision(p);
  }

  updateCalculations(width, height, near) {
    super.updateCalculations(width, height);

    if (this.immortal > 0) return;

    const merge = [];

    for (const p of near) {
      if (
        Math.random() < 0.8 &&
        p instanceof MergeParticle &&
        p.immortal <= 0 &&
        detectCircleCollision(this, p, Math.random() / 2)
      ) {
        merge.push(p);
      }
    }

    return merge;
  }

  update(width, height, near) {
    const merge = this.updateCalculations(width, height, near);

    this.updatePosition();

    return { type: "merge", merge };
  }
}
