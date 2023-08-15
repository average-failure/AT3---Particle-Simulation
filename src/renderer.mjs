import { RenderBase } from "./render_base.mjs";

export class Renderer extends RenderBase {
  constructor(canvas, settings) {
    super(canvas, settings);
  }

  draw(particles) {
    for (const p of particles) {
      this.translate(p.x, p.y);

      this.drawCtx.fillStyle = p.colour;
      this.drawCtx.fill(p.path);

      if (!this.settings.toggles.show_velocity) continue;

      this.drawCtx.strokeStyle = p.colour;
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(0, 0);
      this.drawCtx.lineTo(p.vx, p.vy);
      this.drawCtx.stroke();
      this.drawCtx.closePath();
    }
  }
}
