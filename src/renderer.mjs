export class Renderer {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;

    this.positionBufferData = new Float32Array(this.settings)
  }
}