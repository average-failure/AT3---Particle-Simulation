import { randRange, randRangeInt, randHex } from "./utils.mjs";

const GRAVITY = 9.8,
  DELTA_TIME = 0.1,
  DRAG = 0.999;

export class Particle {
  constructor(
    x,
    y,
    vx = randRange(10, -10),
    vy = randRange(10, -10),
    radius = randRangeInt(50, 1),
    colour = randHex()
  ) {
    if (!(x && y)) throw "Error: Position not provided.";
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.colour = colour;
  }

  draw(ctx) {
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
    let dx, dy;
    const distBetweenSq =
      (dx = this.x - otherParticle.x) * dx +
      (dy = this.y - otherParticle.y) * dy;

    if (distBetweenSq <= (this.radius + otherParticle.radius) ** 2) {
      /* this.vx *= -1;
      this.vy *= -1;

      otherParticle.vx *= -1;
      otherParticle.vy *= -1; */

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
    if (this.x - this.radius <= 0 || this.x + this.radius >= width)
      this.vx *= -1;
    if (this.y - this.radius <= 0 || this.y + this.radius >= height)
      this.vy *= -1;
  }

  #updatePosition() {
    this.x += this.vx * DELTA_TIME;
    this.y += this.vy * DELTA_TIME;
  }

  #updateVelocity() {
    this.vy += GRAVITY * DELTA_TIME;

    this.vx *= DRAG;
    this.vy *= DRAG;
  }

  update(width, height) {
    this.#checkBoundaries(width, height);

    this.#updateVelocity();
    this.#updatePosition();
  }
}
