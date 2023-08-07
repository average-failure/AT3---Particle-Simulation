export class EnvironmentRenderer {
  constructor(canvas, settings) {
    this.ctx = (this.canvas = canvas).getContext("2d");
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d");

    this.settings = settings;

    this.boundsBufferData = new Int16Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_environment_objects * 4 * 2,
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

    if (this.objects) this.render(this.objects);
  }

  /**
   * Resizes the buffers to contain the object data
   * @param {Array} objects An array containing objects
   */
  resizeBuffers(objects) {
    this.boundsBufferData.buffer.resize(objects.length * 4 * 2);
  }

  /**
   * Updates the buffers with the object data
   * @param {Array} objects An array containing objects
   */
  updateData(objects) {
    objects.forEach((o, i) => {
      this.boundsBufferData[i * 4] = o.bounds[0][0];
      this.boundsBufferData[i * 4 + 1] = o.bounds[0][1];
      this.boundsBufferData[i * 4 + 2] = o.bounds[1][0];
      this.boundsBufferData[i * 4 + 3] = o.bounds[1][1];
    });
  }

  drawEnvironment(objects) {
    for (let i = 0, len = objects.length; i < len; i++) {
      const x1 = this.boundsBufferData[i * 4],
        x2 = this.boundsBufferData[i * 4 + 1],
        y1 = this.boundsBufferData[i * 4 + 2],
        y2 = this.boundsBufferData[i * 4 + 3];

      this.drawCtx.fillStyle = "#FFFFFF";
      this.drawCtx.fillRect(x1, y1, x2 - x1, y2 - y1);
    }
  }

  render(objects) {
    this.resizeBuffers(objects);
    this.updateData(objects);

    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.drawEnvironment(objects);

    this.ctx.drawImage(this.drawCanvas, 0, 0);

    this.objects = objects;
  }
}
