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

  draw(objects) {
    const {
      Rectangle: rect,
      Circle: circle,
      FlowControl: fc,
      Accelerator: acc,
      Decelerator: dec,
      GravityWell: gw,
      BlackHole: bh,
    } = objects;

    const renderOrder = [acc, dec, gw, bh, fc, rect, circle].flat();

    for (const o of renderOrder) {
      if (o instanceof FlowControl && o.finished === true) {
        o.render(this.drawCtx);
        continue;
      }

      this.translate(o.x, o.y);
      this.drawCtx.fillStyle = o.fill || "#AAAAAAF0";
      this.drawCtx.fill(o.path);

      if (o.hasOwnProperty("extra")) {
        if (o.extra.hasOwnProperty("width")) this.drawCtx.lineWidth = o.extra.width;
        this.drawCtx[o.extra.mode + "Style"] = o.extra.colour;
        if (o.extra.path instanceof Array)
          for (let i = 0, len = o.extra.path.length; i < len; i++) {
            this.drawCtx[o.extra.mode + "Style"] = o.extra.colour[i];
            this.drawCtx[o.extra.mode](o.extra.path[i]);
          }
        else this.drawCtx[o.extra.mode](o.extra.path);
      }
    }
  }
}
