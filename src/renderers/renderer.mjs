import { RenderBase } from "./render_base";
import { complementaryHSLColour } from "../utils";

export class Renderer extends RenderBase {
  constructor(canvas, settings) {
    super(canvas, settings);

    new FontFace(
      "Roboto Slab",
      "url('../../fonts/RobotoSlab-Regular.woff2') format('woff2')",
      { weight: 400 }
    )
      .load()
      .then((font) => {
        self.fonts.add(font);
      });
  }

  render(particles) {
    super.render(particles);
  }

  draw(particles) {
    for (const p of particles) {
      this.translate(p.x, p.y);

      this.drawCtx.fillStyle = p.colour;
      this.drawCtx.fill(p.path);

      if (typeof p.extra === "function") p.extra(this.drawCtx);

      if (p.paths) {
        for (const { path, colour, width } of p.paths) {
          this.drawCtx.strokeStyle = colour;
          this.drawCtx.lineWidth = width;
          this.drawCtx.stroke(path);
        }
      }

      if (!this.settings.toggles.show_velocity) continue;

      this.drawCtx.strokeStyle = p.colour;
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(0, 0);
      this.drawCtx.lineTo(p.vx, p.vy);
      this.drawCtx.stroke();
      this.drawCtx.closePath();
    }

    if (this.settings.toggles.show_mass || this.settings.toggles.show_lifespan)
      this.drawInfo(particles, this.settings.toggles.dynamic_font_colour);
  }

  drawInfo(particles, dynamicColour) {
    if (!dynamicColour) this.drawCtx.fillStyle = "#ffffff";
    for (const p of particles) {
      this.translate(p.x, p.y);

      if (dynamicColour) this.drawCtx.fillStyle = complementaryHSLColour(p.colour);
      const size = Math.max(14, p.r ** 0.75);
      this.drawCtx.font = `${size}px "Roboto Slab"`;

      let text, text2;
      if (this.settings.toggles.show_lifespan) {
        text = `Lifespan: ${~~(p.lifespan - p.initialLife / 2)}`;
        if (this.settings.toggles.show_mass) {
          text2 = `Mass: ${p.mass}`;
        }
      } else if (this.settings.toggles.show_mass) {
        text = `Mass: ${p.mass}`;
      }

      let x1 = this.drawCtx.measureText(text).width,
        x2;
      let y1 = -size * 0.5,
        y2;

      if (text2) {
        x2 = this.drawCtx.measureText(text2).width;
        y2 = -size * 1.5;
      }

      const r = p.r * 1.1;

      if (p.x + r + (x2 ? Math.max(x1, x2) : x1) > this.width) {
        x1 = -(x1 + r);
        x2 = -(x2 + r);
      } else x1 = x2 = r;

      if (p.y + (y2 ? Math.min(y1, y2) : y1) < 0) {
        y1 = -y1;
        y2 = -y2;
      }

      this.drawCtx.fillText(text, x1, y1);
      if (text2) this.drawCtx.fillText(text2, x2, y2);
    }
  }
}
