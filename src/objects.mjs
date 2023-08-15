import { Environment } from "./environment.mjs";
import { attract, repulse } from "./gravity_calculations.mjs";

export class Rectangle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    if (params.w) {
      if (params.w > this.settings.constants.max_width)
        this.w = this.settings.constants.max_width;
      else if (params.w < -this.settings.constants.max_width)
        this.w = -this.settings.constants.max_width;
      else this.w = params.w;
    } else {
      this.w = 10;
      this.x -= this.w / 2;
    }

    if (params.h) {
      if (params.h > this.settings.constants.max_height)
        this.h = this.settings.constants.max_height;
      else if (params.h < -this.settings.constants.max_height)
        this.h = -this.settings.constants.max_height;
      else this.h = params.h;
    } else {
      this.h = 10;
      this.y -= this.h / 2;
    }

    if (this.w < 0) {
      this.x += this.w;
      this.w = Math.abs(this.w);
    }

    if (this.h < 0) {
      this.y += this.h;
      this.h = Math.abs(this.h);
    }

    this.bounds = new Int16Array([this.x, this.x + this.w, this.y, this.y + this.h]);

    this.measurements = new Int16Array([
      this.w / 2,
      this.h / 2,
      this.x + this.w / 2,
      this.y + this.h / 2,
    ]);

    (this.path = new Path2D()).rect(0, 0, this.w, this.h);
  }

  static getClassName() {
    return "Rectangle";
  }

  getClassName() {
    return Rectangle.getClassName();
  }

  detectCollision(p) {
    const cor = this.settings.toggles.coefficient_of_restitution
      ? this.settings.variables.coefficient_of_restitution
      : 1;

    const dx = p.x - this.measurements[2],
      dy = p.y - this.measurements[3],
      w = p.r + this.measurements[0],
      h = p.r + this.measurements[1],
      cw = w * dy,
      ch = h * dx;

    if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
      if (cw > ch) {
        if (cw > -ch) {
          // Bottom
          p.y = p.r + this.bounds[3];
          p.vy = Math.abs(p.vy) * cor;
        } else {
          // Left
          p.x = this.bounds[0] - p.r;
          p.vx = -Math.abs(p.vx) * cor;
        }
      } else {
        if (cw > -ch) {
          // Right
          p.x = p.r + this.bounds[1];
          p.vx = Math.abs(p.vx) * cor;
        } else {
          // Top
          p.y = this.bounds[2] - p.r;
          p.vy = -Math.abs(p.vy) * cor;
        }
      }
    }
  }

  update([near]) {
    for (const p of near) this.detectCollision(p);
  }
}

export class Circle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.r = params.r || 15;

    (this.path = new Path2D()).arc(0, 0, this.r, 0, 2 * Math.PI);
  }

  static getClassName() {
    return "Circle";
  }

  getClassName() {
    return Circle.getClassName();
  }

  detectCollision(p) {
    const dx = this.x - p.x,
      dy = this.y - p.y;
    const dSq = dx ** 2 + dy ** 2;

    if (dSq <= (this.r + p.r) ** 2) {
      const d = Math.sqrt(dSq);

      const angle = Math.atan2(dy, dx);

      p.x = this.x - (this.r + p.r) * Math.cos(angle);
      p.y = this.y - (this.r + p.r) * Math.sin(angle);

      const nvx = dx / d,
        nvy = dy / d;

      const speed =
        (p.vx * nvx + p.vy * nvy) *
        (this.settings.toggles.coefficient_of_restitution
          ? this.settings.variables.coefficient_of_restitution
          : 1);

      if (speed < 0) return;

      p.vx -= speed * nvx * 2;
      p.vy -= speed * nvy * 2;
    }
  }

  update([near]) {
    for (const p of near) this.detectCollision(p);
  }
}

export class GravityWell extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 1000;
    this.r = params.r || 100;
    this.force = params.force || [-1, 1][~~(Math.random() * 2)];

    (this.path = new Path2D()).arc(0, 0, this.r, 0, 2 * Math.PI);
    this.genFill(params.ctx);
  }

  static getClassName() {
    return "GravityWell";
  }

  getClassName() {
    return GravityWell.getClassName();
  }

  genFill(ctx) {
    const grdB = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    grdB.addColorStop(0, "#2020FFC0");
    grdB.addColorStop(0.9, "#2020FF20");
    grdB.addColorStop(1, "#2020FF00");

    const grdR = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    grdR.addColorStop(0, "#FF2020C0");
    grdR.addColorStop(0.9, "#FF202020");
    grdR.addColorStop(1, "#FF202000");

    this.fillB = grdB;
    this.fillR = grdR;
    this.fill = this.force > 0 ? grdB : grdR;
  }

  reverseForce() {
    this.force *= -1;

    this.fill = this.force > 0 ? this.fillB : this.fillR;
  }

  #attract(p) {
    attract(this, p, this.settings);
  }

  #repulse(p) {
    repulse(this, p, this.settings);
  }

  update([near]) {
    for (const p of near)
      if (this.force > 0) this.#attract(p);
      else this.#repulse(p);
  }
}

export class Accelerator extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);
  }
}
