import * as PARTICLES from "./particles.mjs";
import { randRangeInt } from "./utils.mjs";
import { SpatialHash } from "./spatial_hash.mjs";
import { settings } from "./settings.mjs";
import { Renderer } from "./renderer.mjs";

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

    this.availableParticles = {
      Particle: null,
      AttractorParticle: (particle) => [
        this.findNear(
          particle,
          this.settings.constants.max_radius +
            particle.strength * this.settings.variables.attraction_radius
        ),
      ],
      RepulserParticle: (particle) => [
        this.findNear(
          particle,
          this.settings.constants.max_radius +
            particle.strength * this.settings.variables.repulsion_radius
        ),
      ],
      ChargedParticle: (particle) => [
        this.findNear(
          particle,
          this.settings.constants.max_radius +
            particle.strength *
              ((this.settings.variables.attraction_radius +
                this.settings.variables.repulsion_radius) /
                2)
        ),
      ],
    };

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
    this.renderer.resizeCanvas(width, height);
    this.width = width;
    this.height = height;
  }

  /**
   * Initialises the renderer
   * @param {OffscreenCanvas} canvas The canvas to draw the simulation on
   */
  addCanvas(canvas) {
    this.renderer = new Renderer(canvas, this.settings);
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
   * A helper method to create instances of a selected particle type
   * @param {String} type The type of particle to create
   * @param  {Object} params The parameters of the particle
   * @param {settings} settings The settings of the particle
   * @returns A new instance of the selected particle type
   */
  #createInstance(type, settings, params) {
    const SelectedClass = PARTICLES[type] || PARTICLES.Particle;
    // Object.values(PARTICLES)[~~(Math.random() * 3)];

    return new SelectedClass(++this.ids, settings, params);
  }

  /**
   * Adds a new Particle to the spatial hash grid and particles array
   * @param {Particle} particle An instance of a Particle or an object containing parameters for the Particle to add to the hash
   * @param {String} type A string containing the type of particle to create
   */
  newParticle({ particle, type }) {
    if (!(this.particles.length < this.settings.constants.max_particles))
      return alert("Max particles reached!"); // TODO: Alert doesn't work (it is a method of the global window object); send message to main thread instead

    const defaults = {
      mass: randRangeInt(
        this.settings.constants.max_mass,
        this.settings.constants.min_mass
      ),
      x: randRangeInt(
        this.width - this.settings.radius(this.mass),
        this.settings.radius(this.mass)
      ),
      y: randRangeInt(
        this.height - this.settings.radius(this.mass),
        this.settings.radius(this.mass)
      ),
    };

    Object.assign(defaults, particle);

    const p =
      particle instanceof PARTICLES.Particle
        ? particle
        : this.#createInstance(type, this.settings, defaults);

    this.newClient(p);
    this.particles.push(p);

    this.renderer.resizeBuffers(this.particles);
    this.renderer.updateRadiusBuffer(p);
  }

  // /**
  //  * Handles the collision of particles with the mouse
  //  * @param {Object} param0 An object containing mouse x and y coordinates
  //  */
  // mouseCollision({ mx: x, my: y }) {
  //   for (const near of this.findNear(
  //     { x, y },
  //     this.settings.variables.mouse_collision_radius +
  //       this.settings.constants.max_radius
  //   ))
  //     near.mouseCollision({
  //       x,
  //       y,
  //       radius: this.settings.variables.mouse_collision_radius,
  //       mass: this.settings.variables.mouse_collision_mass,
  //     });
  // }
  // TODO: handle mouse collision by dragging around a solid object (maybe)

  /**
   * Handles the calculations of a given particle
   * @param {Particle} particle The particle to do the calculations for
   */
  #calculations(particle) {
    // console.time("remove");
    this.removeParticle(particle);
    // console.timeEnd("remove");

    // console.time("update");
    particle.update(
      this.width,
      this.height,
      this.availableParticles[particle.getClassName()]?.(particle)
    );
    // console.timeEnd("update");

    // console.time("collision");
    for (const near of this.findNear(
      particle,
      particle.radius + this.settings.constants.max_radius
    ))
      particle.detectCollision(near);
    // console.timeEnd("collision");

    // console.time("new");
    this.addParticle(particle);
    // console.timeEnd("new");
  }

  /**
   * The main animation loop
   */
  animate() {
    for (const p of this.particles) this.#calculations(p);

    this.renderer.render(this.particles);

    requestAnimationFrame(this.animate.bind(this));
  }
}

console.log(new SimulationWorker(settings));
