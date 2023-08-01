import { SpatialHash } from "./spatial_hash.mjs";

class Simulation extends SpatialHash {
  constructor(cellSize) {
    super(cellSize);

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
      if (message[method] !== undefined) this[method]?.(message[method]);
    }
  }

  resizeCanvas({ width, height }) {
    this.canvas.width = this.drawCanvas.width = width;
    this.canvas.height = this.drawCanvas.height = height;
  }

  addCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.drawCanvas = new OffscreenCanvas(
      this.canvas.width,
      this.canvas.height
    );
    this.drawCtx = this.drawCanvas.getContext("2d", { alpha: false });
    console.log(this);
  }

  mouseCollision({ mx, my, bounds }) {
    const x = mx - bounds.left,
      y = my - bounds.top;
    for (const near of this.findNear({ x, y }, 50))
      near.detectCollision({ x, y, radius: 40 });
  }

  #draw() {
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    for (const particle of this.particles) {
      particle.update(this.drawCanvas.width, this.drawCanvas.height);
      particle.draw(this.drawCtx);
    }

    this.ctx.drawImage(this.drawCanvas, 0, 0);
  }

  #calculations() {
    for (const particle of this.particles)
      for (const near of this.findNear(particle, particle.radius * 2))
        particle.detectCollision(near);
  }

  animate() {
    this.#calculations();
    this.#draw();
    requestAnimationFrame(this.animate.bind(this));
  }
}

new Simulation(15);
