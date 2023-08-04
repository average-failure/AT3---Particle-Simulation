import { SpatialHash } from "./spatial_hash.mjs";
import { settings } from "./settings.mjs";

class SimulationWorker extends SpatialHash {
  /**
   * A particle simulation
   * @param {settings} settings The simulation settings
   */
  constructor(settings) {
    super(settings);

    this.methods = [
      "animate",
      "addCanvas",
      "newParticle",
      "mouseCollision",
      "resizeCanvas",
      "updateVariable",
      "updateToggle",
    ];

    onmessage = this.#onMessage.bind(this);
  }

  /**
   * Handles the response to receiving messages from the main thread
   * @param {MessageEvent} param0 A message event sent to the worker
   */
  #onMessage({ data: message }) {
    for (const method of this.methods.filter((method) =>
      Object.keys(message).includes(method)
    ))
      this[method]?.(message[method]);
  }

  /**
   * Resizes the canvas to a given width and height
   * @param {Object} param0 An object containing a width and a height to resize the canvas to
   */
  resizeCanvas({ width, height }) {
    this.width = this.canvas.width = this.drawCanvas.width = width;
    this.height = this.canvas.height = this.drawCanvas.height = height;
  }

  /**
   * Initialises the output canvas and offscreen canvas
   * @param {OffscreenCanvas} canvas The canvas to draw the simulation on
   */
  addCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.drawCtx = (this.drawCanvas = new OffscreenCanvas(
      (this.width = canvas.width),
      (this.height = canvas.height)
    )).getContext("2d", { alpha: false });
  }

  /**
   * Updates a specified variable simulation setting with a given value
   * @param {Object} param0 An object that contains a setting and a value
   */
  updateVariable({ setting, value }) {
    this.settings.variables[setting] = value * 1;
  }

  /**
   * Updates a specified toggle simulation setting with a given value
   * @param {Object} param0 An object that contains a setting and a value
   */
  updateToggle({ setting, value }) {
    this.settings.toggles[setting] = value;
  }

  /**
   * Handles the collision of particles with the mouse
   * @param {Object} param0 An object containing mouse x and y coordinates
   */
  mouseCollision({ mx, my }) {
    for (const near of this.findNear(
      { mx, my },
      this.settings.variables.mouse_collision_radius +
        this.settings.constants.max_radius
    ))
      near.detectCollision({
        mx,
        my,
        radius: this.settings.variables.mouse_collision_radius,
      });
  }

  /**
   * Handles the calculations of a given particle
   * @param {Particle} particle The particle to do the calculations for
   */
  #calculations(particle) {
    // console.time("remove");
    this.removeParticle(particle); // ! too laggy or something; causes visual glitches
    // console.timeEnd("remove");

    // console.time("update");
    particle.update(this.width, this.height);
    // console.timeEnd("update");

    // console.time("collision");
    for (const near of this.findNear(
      particle,
      particle.radius + this.settings.constants.max_radius
    ))
      particle.detectCollision(near);
    // console.timeEnd("collision");

    // console.time("new");
    this.addParticle(particle); // ! too laggy or something; causes visual glitches
    // console.timeEnd("new");
  }

  /**
   * The main animation loop
   */
  animate() {
    // console.time("animate");
    this.drawCtx.clearRect(0, 0, this.width, this.height);
    // console.time("calc&draw");
    for (const particle of this.particles) {
      // console.time("calc");
      this.#calculations(particle);
      // console.timeEnd("calc");
      // console.time("draw");
      particle.draw(this.drawCtx);
      // console.timeEnd("draw");
    }
    // console.timeEnd("calc&draw");

    // ! something wrong with the colours; idk why they're transparent

    /* const p = this.particles[0],
      rad = p.radius + this.maxRadius;
    this.drawCtx.fillColour = "rgba(255,0,0,0.4)";

    this.drawCtx.beginPath();
    this.drawCtx.fillRect(p.x - rad, p.y - rad, rad * 2, rad * 2);
    this.drawCtx.closePath();

    for (const near of this.findNear(p, rad)) near.colour = "blue"; */

    this.ctx.drawImage(this.drawCanvas, 0, 0);
    // console.timeEnd("animate");

    requestAnimationFrame(this.animate.bind(this));
  }
}

console.log(new SimulationWorker(settings));
