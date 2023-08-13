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
    this.circlePositionBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 2 * 2,
      })
    );
    this.circleRadiusBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 2,
      })
    );
    this.wellPositionBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 2 * 2,
      })
    );
    this.wellRadiusBufferData = new Int16Array(
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
  resizeBuffers({ Rectangle, Circle, GravityWell }) {
    this.boundsBufferData.buffer.resize(Rectangle.length * 4 * 2);
    this.circlePositionBufferData.buffer.resize(Circle.length * 2 * 2);
    this.circleRadiusBufferData.buffer.resize(Circle.length * 2);
    this.wellPositionBufferData.buffer.resize(GravityWell.length * 2 * 2);
    this.wellRadiusBufferData.buffer.resize(GravityWell.length * 2);
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
      this.circlePositionBufferData[i * 2] = o.x;
      this.circlePositionBufferData[i * 2 + 1] = o.y;
      this.circleRadiusBufferData[i] = o.r;
    });
  }

  updateWellData(objects) {
    objects.forEach((o, i) => {
      this.wellPositionBufferData[i * 2] = o.x;
      this.wellPositionBufferData[i * 2 + 1] = o.y;
      this.wellRadiusBufferData[i] = o.r;
    });
  }

  updateData(objects) {
    this.resizeBuffers(objects);
    this.updateBoundsData(objects.Rectangle);
    this.updateCircleData(objects.Circle);
    this.updateWellData(objects.GravityWell);
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
      x = this.circlePositionBufferData[i * 2];
      y = this.circlePositionBufferData[i * 2 + 1];
      r = this.circleRadiusBufferData[i];

      this.drawCtx.beginPath();
      this.drawCtx.arc(x, y, r, 0, Math.PI * 2);
      this.drawCtx.fill();
      this.drawCtx.closePath();
    }
  }

  drawWell(objects) {
    let x, y, r;
    for (let i = 0, len = objects.length; i < len; i++) {
      x = this.wellPositionBufferData[i * 2];
      y = this.wellPositionBufferData[i * 2 + 1];
      r = this.wellRadiusBufferData[i];

      const grd = this.drawCtx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, objects[i].force > 0 ? "#2020FFC0" : "#FF2020C0");
      grd.addColorStop(0.9, objects[i].force > 0 ? "#2020FF20" : "#FF202020");
      grd.addColorStop(1, objects[i].force > 0 ? "#2020FF00" : "#FF202000");
      this.drawCtx.fillStyle = grd;

      this.drawCtx.beginPath();
      this.drawCtx.arc(x, y, r, 0, Math.PI * 2);
      this.drawCtx.fill();
      this.drawCtx.closePath();
    }
  }

  draw({ Rectangle, Circle, GravityWell, FlowControl }) {
    this.drawWell(GravityWell);
    for (const f of FlowControl) f.render(this.drawCtx);
    this.drawCtx.fillStyle = "#FFFFFF";
    this.drawCircle(Circle);
    this.drawRect(Rectangle);
  }

  render(objects) {
    this.updateData(objects);

    this.drawCtx.clearRect(0, 0, this.width, this.height);

    this.draw(objects);

    this.ctx.drawImage(this.drawCanvas, 0, 0);

    this.objects = objects;
  }

  dispose() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const prop of Object.keys(this)) delete this[prop];
  }
}
