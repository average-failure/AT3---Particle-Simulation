import { RenderBase } from "./render_base";
import { complementaryHSLColour } from "../utils";

export class Renderer extends RenderBase {
  constructor(canvas, settings) {
    super(canvas, settings);
  }

  draw(particles) {
    for (const p of particles) {
      this.translate(p.x, p.y);

      this.drawCtx.fillStyle = p.colour;
      this.drawCtx.beginPath();
      this.drawCtx.arc(0, 0, p.r, 0, Math.PI * 2);
      this.drawCtx.fill();

      if (typeof p.extra === "function") p.extra(this.drawCtx);
      else if (this.settings.toggles.show_mass && p.r > 5) {
        this.drawCtx.fillStyle = complementaryHSLColour(p.colour);
        this.drawCtx.font = `${p.r}px sans-serif`;
        this.drawCtx.fillText(p.mass, 0, 0);
      }

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
