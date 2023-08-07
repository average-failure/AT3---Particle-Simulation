import { Environment } from "./environment.mjs";
import { randRangeInt } from "./utils.mjs";

export class Rectangle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.bounds = [
      new Int16Array([
        this.x,
        this.x +
          (this.width =
            params.width ||
            randRangeInt(
              this.settings.constants.max_width,
              this.settings.constants.min_width
            )),
      ]),
      new Int16Array([
        this.y,
        this.y +
          (this.height =
            params.height ||
            randRangeInt(
              this.settings.constants.max_height,
              this.settings.constants.min_height
            )),
      ]),
    ];

    this.measurements = new Int16Array([
      this.width / 2,
      this.height / 2,
      this.x + this.width / 2,
      this.y + this.height / 2,
    ]);
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
      w = p.radius + this.measurements[0],
      h = p.radius + this.measurements[1],
      cw = w * dy,
      ch = h * dx;

    if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
      if (cw > ch) {
        if (cw > -ch) {
          // Bottom
          p.y = p.radius + this.bounds[1][1];
          p.vy = Math.abs(p.vy) * cor;
        } else {
          // Left
          p.x = this.bounds[0][0] - p.radius;
          p.vx = -Math.abs(p.vx) * cor;
        }
      } else {
        if (cw > -ch) {
          // Right
          p.x = p.radius + this.bounds[0][1];
          p.vx = Math.abs(p.vx) * cor;
        } else {
          // Top
          p.y = this.bounds[1][0] - p.radius;
          p.vy = -Math.abs(p.vy) * cor;
        }
      }
    }
  }
}

export class Circle extends Environment {
  constructor(id, settings, params) {
    super(id, settings, params);

    this.radius = params.radius;
  }

  static getClassName() {
    return "Circle";
  }

  getClassName() {
    return Circle.getClassName();
  }
}
