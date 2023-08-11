import { Environment } from "./environment.mjs";

export class FlowControl extends Environment {
  constructor(settings, params) {
    super(null, settings);

    this.flowStrength = params.flowStrength || 0.05;
    this.flowDirection = params.flowDirection || 1;

    this.flow = [];

    this.startFlow(params);
  }

  static getClassName() {
    return "FlowControl";
  }

  getClassName() {
    return FlowControl.getClassName();
  }

  startFlow({ x, y }) {
    this.flow.push(new BeginFlow(this.flowStrength, x, y));
  }

  nextFlow(x, y) {
    const flow = this.flow.at(-1);
    this.flow.push(new Flow(this.flowStrength, flow, x, y));
    flow.addFlow(this.flow.at(-1));
  }

  endFlow(x, y) {
    this.flow.push(new CloseFlow(this.flowStrength, this.flow.at(-1), x, y));
    this.flow.at(-2).addFlow(this.flow.at(-1));
    for (const f of this.flow) f.calcRotation();
    this.finished = true;

    this.genArrow();
  }

  genArrow() {
    const path = new Path2D();
    path.moveTo(-4, 0);
    path.lineTo(4, 0);
    path.lineTo(2, 2);
    path.moveTo(4, 0);
    path.lineTo(2, -2);
    this.arrow = path;
  }

  render(ctx) {
    for (const f of this.flow) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.fillStyle = "#6060FFa0";
      ctx.fillRect(-10, -10, 20, 20);
      ctx.stroke(this.arrow);
      ctx.restore();
    }
  }
}

class FlowBase {
  constructor(strength, x, y) {
    this.x = x;
    this.y = y;

    this.strength = strength;
  }

  calcRotation() {
    this.rotation = Math.atan2(this.dy, this.dx);
  }

  flow(p) {
    if (
      Math.abs(p.x - (this.x + 10)) <= p.r + 10 &&
      Math.abs(p.y - (this.y + 10)) <= p.r + 10
    ) {
      p.vx += this.dx * this.strength;
      p.vy += this.dy * this.strength;
    }
  }
}

class BeginFlow extends FlowBase {
  constructor(strength, x, y) {
    super(strength, x, y);
  }

  static getClassName() {
    return "BeginFlow";
  }

  getClassName() {
    return BeginFlow.getClassName();
  }

  addFlow(flow) {
    this.nextFlow = flow;
  }

  calcRotation() {
    this.dx = this.nextFlow.x - this.x;
    this.dy = this.nextFlow.y - this.y;
    super.calcRotation();
  }
}

class CloseFlow extends FlowBase {
  constructor(strength, preFlow, x, y) {
    super(strength, x, y);

    this.preFlow = preFlow;
  }

  static getClassName() {
    return "CloseFlow";
  }

  getClassName() {
    return CloseFlow.getClassName();
  }

  calcRotation() {
    this.dx = this.x - this.preFlow.x;
    this.dy = this.y - this.preFlow.y;
    super.calcRotation();
  }
}

class Flow extends FlowBase {
  constructor(strength, preFlow, x, y) {
    super(strength, x, y);

    this.preFlow = preFlow;
  }

  static getClassName() {
    return "Flow";
  }

  getClassName() {
    return Flow.getClassName();
  }

  addFlow(flow) {
    this.nextFlow = flow;
  }

  calcRotation() {
    this.dx = this.nextFlow.x - this.preFlow.x;
    this.dy = this.nextFlow.y - this.preFlow.y;
    super.calcRotation();
  }
}
