import { SpatialHash } from "./spatial_hash.mjs";

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
    for (const method of this.methods) {
      if (message.hasOwnProperty(method)) {
        this[method]?.(message[method]);
      }
    }
  }

  resizeCanvas({ width, height }) {
    this.width = this.canvas.width = this.drawCanvas.width = width;
    this.height = this.canvas.height = this.drawCanvas.height = height;
  }

  addCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    );
    this.drawCtx = this.drawCanvas.getContext("2d", { alpha: false });
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
        particle.detectCollision(near);
  }

  animate() {
    this.#calculations();
    this.#draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

const CELL_SIZE = 15,
  MAX_RADIUS = 50;
new Simulation(CELL_SIZE, MAX_RADIUS);
