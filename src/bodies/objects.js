import { Environment } from "./environment";
import {
  attract,
  repulse,
  circleCollision,
  detectCircleCollision,
  randBias,
  randHex,
} from "../utils";

const initRectShape = (x, y, w, h) => {
  const defaultSize = 50;
  const threshold = defaultSize / 2;
  const randomSize = 200;

  if (!w || Math.abs(w) < threshold) {
    if (!w) w = randomSize * (Math.random() + 0.5);
    else w = defaultSize;
    x -= w / 2;
  }

  if (!h || Math.abs(h) < threshold) {
    if (!h) h = randomSize * (Math.random() + 0.5);
    else h = defaultSize;
    y -= h / 2;
  }

  if (w < 0) {
    x += w;
    w = Math.abs(w);
  }

  if (h < 0) {
    y += h;
    h = Math.abs(h);
  }

  return { x, y, w, h, measurements: new Int16Array([w / 2, h / 2]) };
};

export class Rectangle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    Object.assign(this, initRectShape(this.x, this.y, params.w, params.h));

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

  update(near) {
    for (const p of near) this.detectCollision(p);
  }
}

export class Circle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.r = params.r || 100 * (Math.random() + 0.5);

    (this.path = new Path2D()).arc(0, 0, this.r, 0, 2 * Math.PI);
  }

  static getClassName() {
    return "Circle";
  }

  getClassName() {
    return Circle.getClassName();
  }

  detectCollision(p) {
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
  }

  update(near) {
    for (const p of near) this.detectCollision(p);
  }
}

export class GravityWell extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 100000;
    this.r = params.r || 100 * (Math.random() + 0.5);
    this.force = params.force || [-1, 1][~~(Math.random() * 2)];

    (this.path = new Path2D()).arc(0, 0, this.r, 0, 2 * Math.PI);
    this.#genFill(params.ctx);
  }

  static getClassName() {
    return "GravityWell";
  }

  getClassName() {
    return GravityWell.getClassName();
  }

  #genFill(ctx) {
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

  update(near) {
    for (const p of near)
      if (this.force > 0) this.#attract(p);
      else this.#repulse(p);
  }
}

export class Accelerator extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 1.03;

    Object.assign(this, initRectShape(this.x, this.y, params.w, params.h));

    this.genPath();
    this.fill = "#AAAAFFA0";
  }

  static getClassName() {
    return "Accelerator";
  }

  getClassName() {
    return Accelerator.getClassName();
  }

  genPath() {
    (this.path = new Path2D()).rect(0, 0, this.w, this.h);

    const path = new Path2D(),
      r = Math.min(...this.measurements) * 0.9,
      w = this.measurements[0],
      h = this.measurements[1],
      r4 = r * 0.4;

    path.moveTo(w - r4, h - r * 0.3);
    path.lineTo(w, h - r * 0.6);
    path.lineTo(w + r4, h - r * 0.3);

    const m = new DOMMatrix([1, 0, 0, 1, 0, r4]);
    path.addPath(path, m);

    m.f = r4;
    path.addPath(path, m);

    this.stroke = { width: r / 10, path };
  }

  extra(ctx) {
    ctx.lineWidth = this.stroke.width;
    ctx.strokeStyle = "black";
    ctx.stroke(this.stroke.path);
  }

  detectCollision(p) {
    const w = this.measurements[0],
      h = this.measurements[1];

    const dx = Math.abs(p.x - this.x - w),
      dy = Math.abs(p.y - this.y - h);

    if (dx > w + p.r || dy > h + p.r) return false;

    if (dx <= w || dy <= h) return true;

    return (dx - w) ** 2 + (dy - h) ** 2 <= p.r ** 2;
  }

  #accelerate(p) {
    if (!this.detectCollision(p)) return false;

    const max = 1000;

    p.vx *= this.strength;
    if (Math.abs(p.vx) > max) p.vx = Math.sign(p.vx) > 0 ? max : -max;

    p.vy *= this.strength;
    if (Math.abs(p.vy) > max) p.vy = Math.sign(p.vy) > 0 ? max : -max;
  }

  update(near) {
    for (const p of near) this.#accelerate(p);
  }
}

export class Decelerator extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.strength = params.strength || 1.03;

    Object.assign(this, initRectShape(this.x, this.y, params.w, params.h));

    this.genPath();
    this.fill = "#FFAAAAA0";
  }

  static getClassName() {
    return "Decelerator";
  }

  getClassName() {
    return Decelerator.getClassName();
  }

  genPath() {
    (this.path = new Path2D()).rect(0, 0, this.w, this.h);

    const path = new Path2D(),
      r = Math.min(...this.measurements) * 0.9,
      w = this.measurements[0],
      h = this.measurements[1],
      r4 = r * 0.4;

    path.moveTo(w - r4, h - r * 0.5);
    path.lineTo(w, h - r * 0.2);
    path.lineTo(w + r4, h - r * 0.5);

    const m = new DOMMatrix([1, 0, 0, 1, 0, r4]);
    path.addPath(path, m);

    m.f = r4;
    path.addPath(path, m);

    this.stroke = { width: r / 10, path };
  }

  extra(ctx) {
    ctx.lineWidth = this.stroke.width;
    ctx.strokeStyle = "black";
    ctx.stroke(this.stroke.path);
  }

  detectCollision(p) {
    const w = this.measurements[0],
      h = this.measurements[1];

    const dx = Math.abs(p.x - this.x - w),
      dy = Math.abs(p.y - this.y - h);

    if (dx > w + p.r || dy > h + p.r) return false;

    if (dx <= w || dy <= h) return true;

    return (dx - w) ** 2 + (dy - h) ** 2 <= p.r ** 2;
  }

  #decelerate(p) {
    if (!this.detectCollision(p)) return false;

    p.vx /= this.strength;
    p.vy /= this.strength;
  }

  update(near) {
    for (const p of near) this.#decelerate(p);
  }
}

export class BlackHole extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.r = params.r || 100 * (Math.random() + 0.5);
    this.strength = params.strength || this.r ** 2;

    this.#genPath();
    this.#genFill(params.ctx);
  }

  static getClassName() {
    return "BlackHole";
  }

  getClassName() {
    return BlackHole.getClassName();
  }

  #genPath() {
    (this.path = new Path2D()).arc(0, 0, this.r, 0, 2 * Math.PI);

    this.extra = [];

    const max = this.r * 0.75,
      min = this.r / 8,
      bias = (max + min) / 2;

    for (let i = 0, len = Math.random() * (this.r / 4) + this.r / 4; i < len; i++) {
      const path = new Path2D();
      path.arc(
        0,
        0,
        randBias(max, min, bias),
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      const rot = (Math.random() - 0.5) / 10;
      this.extra.push({
        path,
        colour: randHex([149, 120, 56], 4),
        rotation: rot,
        rotateSpeed: rot,
      });
    }
  }

  #genFill(ctx) {
    const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r);
    grd.addColorStop(0, "#000000FF");
    grd.addColorStop(0.4, "#000000E0");
    grd.addColorStop(0.6, "#FFFFFF93");
    grd.addColorStop(1, "#44444400");

    this.fill = grd;
  }

  #distort(p) {
    const distanceRatio = Math.max(
      ((this.x - p.x) ** 2 + (this.y - p.y) ** 2) / (this.r + p.r) ** 2,
      Number.MIN_VALUE
    );

    p.r = Math.min(
      Math.ceil((p.mass / p.ratio) * distanceRatio),
      this.settings.constants.max_radius
    );

    (p.path = new Path2D()).arc(0, 0, p.r, 0, Math.PI * 2);
  }

  #attract(p) {
    if ((this.x - p.x) ** 2 + (this.y - p.y) ** 2 < (this.r * 0.1) ** 2) {
      repulse(this, p, this.settings, 0.0001);
      return "EXPLODE";
    }
    return attract(this, p, this.settings, 1, true, 0.2 * (Math.random() + 0.5));
  }

  update(particles) {
    const explodeList = [];
    for (const p of particles) {
      if (this.#attract(p) === "EXPLODE" && Math.random() < 0.99) explodeList.push(p);
      if (detectCircleCollision(this, p, true)) {
        p.collision = 2;
        this.#distort(p);
      }
    }
    return explodeList;
  }
}
