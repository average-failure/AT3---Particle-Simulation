import * as PARTICLES from "./particles.mjs";
import * as OBJECTS from "./objects.mjs";
import { Environment } from "./environment.mjs";
import { randRangeInt } from "./utils.mjs";
import { SpatialHash } from "./spatial_hash.mjs";
import { settings } from "./settings.mjs";
import { Renderer } from "./renderer.mjs";
import { EnvironmentRenderer } from "./environment_renderer.mjs";

class SimulationWorker extends SpatialHash {
  /**
   * A particle simulation
   * @param {settings} settings The simulation settings
   */
  constructor(settings) {
    super(settings);

    onmessage = this.#onMessage.bind(this);

    this.pIds = this.oIds = -1;
    this.particles = [];
    this.envObjects = [];

    this.methods = [
      "animate",
      "addCanvas",
      "newParticle",
      "mouseCollision",
      "resizeCanvas",
      "updateVariable",
      "updateToggle",
      "newObject",
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
  resizeCanvas([width, height]) {
    this.renderer.resizeCanvas(width, height);
    this.envRenderer.resizeCanvas(width, height);
    this.width = width;
    this.height = height;
  }

  /**
   * Initialises the renderer
   * @param {OffscreenCanvas} canvas The canvas to draw the simulation on
   * @param {OffscreenCanvas} envCanvas The canvas to draw the background on
   */
  addCanvas([canvas, envCanvas]) {
    this.renderer = new Renderer(canvas, this.settings);
    this.envRenderer = new EnvironmentRenderer(envCanvas, this.settings);
  }

  /**
   * Updates a specified variable simulation setting with a given value
   * @param {Object} param0 An object that contains a setting and a value
   */
  updateVariable([setting, value]) {
    this.settings.variables[setting] = value * 1;
  }

  /**
   * Updates a specified toggle simulation setting with a given value
   * @param {Object} param0 An object that contains a setting and a value
   */
  updateToggle([setting, value]) {
    this.settings.toggles[setting] = value;
  }

  /**
   * A helper method to create instances of a selected particle type
   * @param {String} type The type of particle to create
   * @param  {Object} params The parameters of the particle
   * @param {settings} settings The settings of the particle
   * @returns A new instance of the selected particle type
   */
  #createParticleInstance(type, settings, params) {
    const SelectedClass = PARTICLES[type] || PARTICLES.Particle;
    // Object.values(PARTICLES)[
    //   ~~(Math.random() * Object.keys(PARTICLES).length)
    // ];

    return new SelectedClass(++this.pIds, settings, params);
  }

  /**
   * Adds a new Particle to the spatial hash grid and particles array
   * @param {Particle} particle An instance of a Particle or an object containing parameters for the Particle to add to the hash
   * @param {String} type A string containing the type of particle to create
   */
  newParticle([particle, type]) {
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
        : this.#createParticleInstance(type, this.settings, defaults);

    this.newClient(p);
    this.particles.push(p);

    this.renderer.resizeBuffers(this.particles);
    this.renderer.updateRadiusBuffer(p);
  }

  /**
   * Deletes the specified particle from the grid and array
   * @param {Particle} particle The instance of Particle to remove
   */
  deleteParticle(particle) {
    this.removeClient(particle);
    const index = this.particles.indexOf(particle);
    if (index > -1) this.particles.splice(index, 1);
  }

  /**
   * A helper method to create instances of a selected environment object type
   * @param {String} type The type of object to create
   * @param  {Object} params The parameters of the object
   * @param {settings} settings The settings of the object
   * @returns A new instance of the selected object type
   */
  #createObjectInstance(type, settings, params) {
    const SelectedClass = OBJECTS[type] || OBJECTS.Rectangle;
    // Object.values(OBJECTS)[
    //   ~~(Math.random() * Object.keys(OBJECTS).length)
    // ];

    return new SelectedClass(++this.oIds, settings, params);
  }

  /**
   * Adds a new environment object to the spatial hash grid
   * @param {Environment} object An instance of an environment object or an object containing parameters for the environment object to add to the hash
   * @param {String} type A string containing the type of environment object to create
   */
  newObject([object, type]) {
    if (
      !(
        this.envObjects.length < this.settings.constants.max_environment_objects
      )
    )
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

    Object.assign(defaults, object);

    const o =
      object instanceof Environment
        ? object
        : this.#createObjectInstance(type, this.settings, defaults);

    this.newClient(o);
    this.envObjects.push(o);

    this.envRenderer.render(this.envObjects);
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
    this.removeClient(particle);
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
    this.newClient(particle);
    // console.timeEnd("new");
  }

  #envCalculations(object) {
    for (const near of this.findNear(
      { x: object.x + object.width / 2, y: object.y + object.height / 2 },
      Math.max(object.width, object.height) / 2 +
        this.settings.constants.max_radius
    ))
      object.detectCollision(near);
  }

  /**
   * The main animation loop
   */
  animate() {
    for (const p of this.particles) this.#calculations(p);

    for (const o of this.envObjects) this.#envCalculations(o);

    this.renderer.render(this.particles);

    requestAnimationFrame(this.animate.bind(this));
  }
}

console.log(new SimulationWorker(settings));
