import { SpatialHash } from "./spatial_hash.mjs";
import { settings } from "./settings.mjs";

class Simulation extends SpatialHash {
  constructor(cellSize, maxRadius) {
    super(cellSize);

    this.maxRadius = maxRadius;

    this.methods = [
      "animate",
      "addCanvas",
      "newParticle",
      "mouseCollision",
      "resizeCanvas",
    ];

    onmessage = this.#onMessage.bind(this);
  }

  #onMessage({ data: message }) {
    for (const method of this.methods.filter((method) =>
      Object.keys(message).includes(method)
    ))
      this[method]?.(message[method]);
  }

  resizeCanvas({ width, height }) {
    this.width = this.canvas.width = this.drawCanvas.width = width;
    this.height = this.canvas.height = this.drawCanvas.height = height;
  }

  addCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d", { alpha: false });
  }

  mouseCollision({ mx, my, bounds }) {
    const x = mx - bounds.left,
      y = my - bounds.top;
    for (const near of this.findNear({ x, y }, 50))
      near.detectCollision({ x, y, radius: 40 });
  }

  #draw() {
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    for (const particle of this.particles) {
      particle.update(this.width, this.height);
      particle.draw(this.drawCtx);
    }

    this.ctx.drawImage(this.drawCanvas, 0, 0);
  }

  #calculations() {
    for (const particle of this.particles)
      for (const near of this.findNear(
        particle,
        particle.radius + this.maxRadius
      ))
        particle.detectCollision(near); // ! findNear does not work properly
  }

  animate() {
    this.#calculations();
    this.#draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

new Simulation(settings.cell_size, settings.max_radius);
