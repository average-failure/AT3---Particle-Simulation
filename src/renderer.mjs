export class Renderer {
  constructor(canvas, settings) {
    this.ctx = (this.canvas = canvas).getContext("2d");
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d");

    this.settings = settings;

    this.positionBufferData = new Float32Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_particles * 2 * 4,
      })
    );
    this.velocityBufferData = new Float32Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_particles * 2 * 4,
      })
    );
    this.radiusBufferData = new Float32Array(
      new ArrayBuffer(0, {
        maxByteLength: this.settings.constants.max_particles * 4,
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
  }

  /**
   * Resizes the buffers to contain the particle data
   * @param {Array} particles An array containing particles
   */
  resizeBuffers(particles) {
    this.positionBufferData.buffer.resize(particles.length * 2 * 4);
    this.velocityBufferData.buffer.resize(particles.length * 2 * 4);
    this.radiusBufferData.buffer.resize(particles.length * 4);
  }

  /**
   * Updates the buffers with the particle data
   * @param {Array} particles An array containing particles
   */
  updateData(particles) {
    particles.forEach((p, i) => {
      this.positionBufferData[i * 2] = p.x;
      this.positionBufferData[i * 2 + 1] = p.y;

      this.velocityBufferData[i * 2] = p.vx;
      this.velocityBufferData[i * 2 + 1] = p.vy;
    });
  }

  updateRadiusBuffer(p) {
    this.radiusBufferData[p.id] = p.r;
  }

  drawParticles(particles) {
    for (let i = 0, len = particles.length; i < len; i++) {
      const x = this.positionBufferData[i * 2],
        y = this.positionBufferData[i * 2 + 1],
        vx = this.velocityBufferData[i * 2],
        vy = this.velocityBufferData[i * 2 + 1],
        r = this.radiusBufferData[i];

      this.drawCtx.fillStyle = particles[i].colour;
      this.drawCtx.beginPath();
      this.drawCtx.arc(x, y, r, 0, Math.PI * 2);
      this.drawCtx.fill();
      this.drawCtx.closePath();

      if (!this.settings.toggles.show_velocity) continue;

      this.drawCtx.strokeStyle = particles[i].colour;
      this.drawCtx.beginPath();
      this.drawCtx.moveTo(x, y);
      this.drawCtx.lineTo(x + vx, y + vy);
      this.drawCtx.stroke();
      this.drawCtx.closePath();
    }
  }

  render(particles) {
    this.updateData(particles);

    this.drawCtx.clearRect(0, 0, this.width, this.height);
    this.drawParticles(particles);

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.drawCanvas, 0, 0);
  }
}
