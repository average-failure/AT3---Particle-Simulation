import { randHSL, randRange, randRangeInt, randRGB } from "./utils.mjs";
import { settings } from "./settings.mjs";

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
  constructor(
    x,
    y,
    vx = randRange(50, -50),
    vy = randRange(10),
    mass = randRangeInt(50, 1)
  ) {
    if (!(x && y)) throw "Error: Position not provided.";
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    if (
      (this.radius = (this.mass = mass) / settings.mass_radius_ratio) >
      settings.max_radius
    )
      this.radius = settings.max_radius;
  }

  draw(ctx) {
    /* const grd = ctx.createRadialGradient(
      this.x,
      this.y,
      this.radius / 3,
      this.x,
      this.y,
      this.radius
    );
    grd.addColorStop(0, adjustColour(this.colour, 100));
    grd.addColorStop(1, this.colour); */
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  // detectCollision({ x, y, vx, vy, radius }) {
  //   let dx, dy;
  //   const distBetweenSq = (dx = x - this.x) * dx + (dy = y - this.y) * dy,
  //     force = -this.radius / distBetweenSq;

  //   if (Math.sqrt(distBetweenSq) < this.radius + radius) {
  //     /* const angle = Math.atan2(dy, dx);
  //     this.vx += force * Math.cos(angle);
  //     this.vy += force * Math.sin(angle); */
  //     const tempVx = this.vx,
  //       tempVy = this.vy;
  //     this.vx = vx || -this.vx;
  //     this.vy = vy || -this.vy;
  //     vx = tempVx;
  //     vy = tempVy;
  //   }
  // }

  detectCollision(otherParticle) {
    const dx = this.x - otherParticle.x,
      dy = this.y - otherParticle.y;
    const distBetweenSq = dx ** 2 + dy ** 2;

    if (distBetweenSq <= (this.radius + otherParticle.radius) ** 2) {
      // * Simple bounce
      /* this.vx *= -1;
      this.vy *= -1;

      otherParticle.vx *= -1;
      otherParticle.vy *= -1; */
      // * ChatGPT
      const angle = Math.atan2(dy, dx);

      const v1 = {
        x: this.vx,
        y: this.vy,
      };
      const v2 = {
        x: otherParticle.vx,
        y: otherParticle.vy,
      };

      const rotatedVelocities = {
        v1: {
          x: v1.x * Math.cos(angle) + v1.y * Math.sin(angle),
          y: v1.y * Math.cos(angle) - v1.x * Math.sin(angle),
        },
        v2: {
          x: v2.x * Math.cos(angle) + v2.y * Math.sin(angle),
          y: v2.y * Math.cos(angle) - v2.x * Math.sin(angle),
        },
      };

      // Calculate the final velocities after the collision
      const v1Final = {
        x:
          ((this.radius - otherParticle.radius) * rotatedVelocities.v1.x +
            2 * otherParticle.radius * rotatedVelocities.v2.x) /
          (this.radius + otherParticle.radius),
        y: rotatedVelocities.v1.y,
      };
      const v2Final = {
        x:
          ((otherParticle.radius - this.radius) * rotatedVelocities.v2.x +
            2 * this.radius * rotatedVelocities.v1.x) /
          (this.radius + otherParticle.radius),
        y: rotatedVelocities.v2.y,
      };

      // Rotate the velocities back
      this.vx = v1Final.x * Math.cos(-angle) + v1Final.y * Math.sin(-angle);
      this.vy = v1Final.y * Math.cos(-angle) - v1Final.x * Math.sin(-angle);
      otherParticle.vx =
        v2Final.x * Math.cos(-angle) + v2Final.y * Math.sin(-angle);
      otherParticle.vy =
        v2Final.y * Math.cos(-angle) - v2Final.x * Math.sin(-angle);
    }
  }

  #checkBoundaries(width, height) {
    switch (true) {
      case this.x - this.radius <= 0:
        this.x = this.radius;
        this.vx = Math.abs(this.vx);
        break;
      case this.x + this.radius >= width:
        this.x = width - this.radius;
        this.vx = -Math.abs(this.vx);
        break;
      case this.y - this.radius <= 0:
        this.y = this.radius;
        this.vy = Math.abs(this.vy);
        break;
      case this.y + this.radius >= height:
        this.y = height - this.radius;
        this.vy = -Math.abs(this.vy);
        break;
    }
  }

  #updatePosition() {
    this.x += this.vx * settings.dt;
    this.y += this.vy * settings.dt;
  }

  #updateVelocity() {
    this.vy += settings.gravity * settings.dt;

    this.vx *= settings.drag;
    this.vy *= settings.drag;

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
