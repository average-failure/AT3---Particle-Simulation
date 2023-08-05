import { randRange, randRangeInt } from "./utils.mjs";

const adjustColour = (colour, amount) => {
  const components = colour.substring(4, colour.length - 1).split(",");
  return `rgb(${components[0] + amount},${components[1] + amount},${
    components[2] + amount
  })`;
  /* "#" +
    colour
      .replace(/^#/, "")
      .replace(/../g, (colour) =>
        (
          "0" +
          Math.min(255, Math.max(0, parseInt(colour, 16) + amount)).toString(16)
        ).slice(-2)
      ); */
};

export class Particle {
  /**
   * A particle...
   * @param {number} x The x coordinate of the particle
   * @param {number} y The y coordinate of the particle
   * @param {number} vx The x velocity of the particle
   * @param {number} vy The y velocity of the particle
   * @param {number} mass The mass of the particle (the radius is based off this)
   * @param {settings} settings The simulation settings
   */
  constructor(x, y, vx, vy, mass, settings) {
    if (!(x && y)) throw "Error: Position not provided.";
    if (!settings) throw "Error: Settings not provided.";
    this.x = x;
    this.y = y;
    this.vx = vx || randRange(50, -50);
    this.vy = vy || randRange(10);
    this.settings = settings;
    this.mass =
      mass ||
      randRangeInt(settings.constants.max_mass, settings.constants.min_mass);
    if ((this.radius = settings.radius(mass)) > settings.constants.max_radius)
      this.radius = settings.constants.max_radius;
    else if (this.radius < settings.constants.min_radius)
      this.radius = settings.constants.min_radius;
  }

  draw(ctx) {
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    if (!this.settings.toggles.show_velocity) return;

    ctx.strokeStyle = this.colour;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.vx, this.y + this.vy);
    ctx.stroke();
    ctx.closePath();
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

  #updatePosition() {
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

    this.colour = `hsl(${(this.colourComp =
      Math.abs(this.vx / 2) + Math.abs(this.vy / 2))},100%,${
      this.colourComp / 2 + 30
    }%)`;
  }

  update(width, height) {
    this.#checkBoundaries(width, height);

    this.#updateVelocity();
    this.#updatePosition();
  }
}
