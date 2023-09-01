export class RenderBase {
  constructor(canvas, settings, alpha) {
    this.ctx = (this.canvas = canvas).getContext("2d", { alpha });
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d", { alpha });

    this.settings = settings;

    this.view = [1, 0, 0, 1, 0, 0];
  }

  /**
   * Resize the canvas to a given width and height
   * @param {Number} width The width to resize the canvas to
   * @param {Number} height The height to resize the canvas to
   */
  resizeCanvas(width, height) {
    this.width = this.canvas.width = this.drawCanvas.width = width;
    this.height = this.canvas.height = this.drawCanvas.height = height;
    // this.drawCtx.textAlign = "center";
    // this.drawCtx.textBaseline = "middle";
  }

  translate(x, y) {
    this.view[4] = x;
    this.view[5] = y;
    this.updateView();
  }

  updateView() {
    this.drawCtx.setTransform(...this.view);
  }

  resetView() {
    this.view = [1, 0, 0, 1, 0, 0];
    this.updateView();
  }

  render(objects) {
    this.drawCtx.resetTransform();
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.draw(objects);

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.drawCanvas, 0, 0);
  }

  dispose() {
    for (const prop of Object.keys(this)) delete this[prop];
  }
}
