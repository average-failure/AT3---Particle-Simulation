import { FlowControl } from "./flow_control.mjs";
import { RenderBase } from "./render_base.mjs";

export class EnvironmentRenderer extends RenderBase {
  constructor(canvas, settings) {
    super(canvas, settings, false);
  }

  resizeCanvas(width, height, objects) {
    super.resizeCanvas(width, height);
    this.render(objects);
  }

  draw({ Rectangle, Circle, FlowControl, Accelerator, Decelerator, GravityWell }) {
    // Drawing is separate to get correct rendering order

    for (const o of Accelerator.concat(Decelerator, GravityWell)) {
      this.translate(o.x, o.y);
      this.drawCtx.fillStyle = o.fill;
      this.drawCtx.fill(o.path);

      if (o.hasOwnProperty("extra")) {
        if (o.extra.hasOwnProperty("width")) this.drawCtx.lineWidth = o.extra.width;
        this.drawCtx[o.extra.mode + "Style"] = o.extra.colour;
        this.drawCtx[o.extra.mode](o.extra.path);
      }
    }
    for (const o of FlowControl) o.render(this.drawCtx);

    for (const o of Rectangle.concat(Circle)) {
      this.translate(o.x, o.y);
      this.drawCtx.fillStyle = "#AAAAAAF0";
      this.drawCtx.fill(o.path);
    }
  }
}
