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
    for (const o of Object.values(objects).flat()) {
      if (o instanceof FlowControl) {
        o.render(this.drawCtx);
        continue;
      }
      this.translate(o.x, o.y);
      this.drawCtx.fillStyle = o.fill || "white";
      this.drawCtx.fill(o.path);
    }
  }
}
