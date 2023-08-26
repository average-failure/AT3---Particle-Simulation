import { FlowControl } from "../bodies";
import { RenderBase } from "./render_base";

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
    } = objects;

    const renderOrder = [acc, dec, gw, fc, rect, circle].flat();

    for (const o of renderOrder) {
      if (o instanceof FlowControl && o.finished === true) {
        o.render(this.drawCtx);
        continue;
      }

      this.translate(o.x, o.y);
      this.drawCtx.fillStyle = o.fill || "#AAAAAAF0";
      this.drawCtx.fill(o.path);

      if (typeof o.extra === "function") o.extra(this.drawCtx);
    }

    this.drawBlackHoles(objects.BlackHole);
  }

  drawBlackHoles(blackHoles) {
    for (const bh of blackHoles) {
      this.translate(bh.x, bh.y);
      this.drawCtx.fillStyle = bh.fill;
      this.drawCtx.fill(bh.path);

      this.drawCtx.lineWidth = 1;
      for (let i = 0, len = bh.extra.path.length; i < len; i++) {
        this.updateView();
        this.drawCtx.rotate(bh.extra.rotation[i]);
        this.drawCtx.strokeStyle = bh.extra.colour[i];
        this.drawCtx.stroke(bh.extra.path[i]);
        bh.extra.rotation[i] += bh.extra.rotateSpeed[i];
      }
    }
  }
}
