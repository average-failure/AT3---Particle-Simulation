import { GravityWell } from "./objects.mjs";

export class EnvironmentRenderer {
  constructor(canvas, settings) {
    this.ctx = (this.canvas = canvas).getContext("2d", { alpha: false });
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d", { alpha: false });

    this.settings = settings;

    this.boundsBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 4 * 2,
      })
    );
    this.positionBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 2 * 2,
      })
    );
    this.radiusBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 2,
      })
    );
  }

  /**
   * Resize the canvas to a given width and height
   * @param {Number} width The width to resize the canvas to
   * @param {Number} height The height to resize the canvas to
   */
  resizeCanvas(width, height) {
    this.width = this.canvas.width = this.drawCanvas.width = width;
    this.height = this.canvas.height = this.drawCanvas.height = height;

    this.drawCtx.fillStyle = "#FFFFFF";

    if (this.objects) this.render(this.objects);
  }

  /**
   * Resizes the buffers to contain the object data
   * @param {Array} objects An array containing objects
   */
  resizeBoundsBuffer({ Rectangle, Circle, GravityWell }) {
    this.boundsBufferData.buffer.resize(Rectangle.length * 4 * 2);
    this.positionBufferData.buffer.resize((Circle.length + GravityWell.length) * 2 * 2);
    this.radiusBufferData.buffer.resize((Circle.length + GravityWell.length) * 2);
  }

  /**
   * Updates the bounds buffer with the object data
   * @param {Array} objects An array containing objects
   */
  updateBoundsData(objects) {
    objects.forEach((o, i) => {
      this.boundsBufferData[i * 4] = o.bounds[0][0];
      this.boundsBufferData[i * 4 + 1] = o.bounds[0][1];
      this.boundsBufferData[i * 4 + 2] = o.bounds[1][0];
      this.boundsBufferData[i * 4 + 3] = o.bounds[1][1];
    });
  }

  updateCircleData(objects) {
    objects.forEach((o, i) => {
      this.positionBufferData[i * 2] = o.x;
      this.positionBufferData[i * 2 + 1] = o.y;
      this.radiusBufferData[i] = o.r;
    });
  }

  updateData(objects) {
    this.resizeBoundsBuffer(objects);
    this.updateBoundsData(objects.Rectangle);
    this.updateCircleData(objects.Circle.concat(objects.GravityWell));
  }

  drawRect(objects) {
    let x1, x2, y1, y2;
    for (let i = 0, len = objects.length; i < len; i++) {
      x1 = this.boundsBufferData[i * 4];
      x2 = this.boundsBufferData[i * 4 + 1];
      y1 = this.boundsBufferData[i * 4 + 2];
      y2 = this.boundsBufferData[i * 4 + 3];

      this.drawCtx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  }

  drawCircle(objects) {
    let x, y, r;
    for (let i = 0, len = objects.length; i < len; i++) {
      x = this.positionBufferData[i * 2];
      y = this.positionBufferData[i * 2 + 1];
      r = this.radiusBufferData[i];

      if (objects[i] instanceof GravityWell) {
        const o = objects[i],
          grd = this.drawCtx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, o.force > 0 ? "#2020FFC0" : "#FF2020C0");
        grd.addColorStop(1, "#00000000");
        this.drawCtx.fillStyle = grd;
      }

      this.drawCtx.beginPath();
      this.drawCtx.arc(x, y, r, 0, Math.PI * 2);
      this.drawCtx.fill();
      this.drawCtx.closePath();
      this.drawCtx.fillStyle = "#FFFFFF";
    }
  }

  draw({ Rectangle, Circle, GravityWell }) {
    this.drawRect(Rectangle);
    this.drawCircle(Circle.concat(GravityWell));
  }

  render(objects) {
    this.updateData(objects);

    this.drawCtx.clearRect(0, 0, this.width, this.height);

    this.draw(objects);

    this.ctx.drawImage(this.drawCanvas, 0, 0);

    this.objects = objects;
  }
}
