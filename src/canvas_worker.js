import * as PARTICLES from "./particles.mjs";
import * as OBJECTS from "./objects.mjs";
import { FlowControl } from "./flow_control.mjs";
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

    this.env = { FlowControl: [] };
    for (const o of Object.keys(OBJECTS)) this.env[o] = [];

    this.methods = [
      "animate",
      "addCanvas",
      "newParticle",
      "mouseCollision",
      "resizeCanvas",
      "updateVariable",
      "updateToggle",
      "newObject",
      "flow",
      "onButton",
    ];

    this.availableParticles = {
      Particle: null,
      AttractorParticle: (particle) => [
        this.findNearParticles(
          particle,
          this.settings.constants.max_radius +
            particle.strength * this.settings.variables.attraction_radius
        ),
      ],
      RepulserParticle: (particle) => [
        this.findNearParticles(
          particle,
          this.settings.constants.max_radius +
            particle.strength * this.settings.variables.repulsion_radius
        ),
      ],
      ChargedParticle: (particle) => [
        this.findNearParticles(
          particle,
          this.settings.constants.max_radius +
            particle.strength *
              ((this.settings.variables.attraction_radius +
                this.settings.variables.repulsion_radius) /
                2)
        ),
      ],
    };

    this.availableObjects = {
      Rectangle: (object) => [
        this.findNearParticles(
          { x: object.x + object.w / 2, y: object.y + object.h / 2 },
          Math.sqrt(object.measurements[0] ** 2 + object.measurements[1] ** 2) +
            this.settings.constants.max_radius
        ),
      ],
      Circle: (object) => [
        this.findNearParticles(
          { x: object.x, y: object.y },
          object.r + this.settings.constants.max_radius
        ),
      ],
      GravityWell: (object) => [this.findNearParticles(object, object.r)],
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
    this.envRenderer.resizeCanvas(width, height, this.env);
    this.width = width;
    this.height = height;
  }

  /**
   * Initialises the renderer
   * @param {OffscreenCanvas} canvas The canvas to draw the simulation on
   * @param {OffscreenCanvas} envCanvas The canvas to draw the background on
   */
  addCanvas([canvas, envCanvas]) {
    this.renderer = new Renderer((this.canvas = canvas), this.settings);
    this.envRenderer = new EnvironmentRenderer(
      (this.envCanvas = envCanvas),
      this.settings
    );
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

  onButton(event) {
    switch (event) {
      case "reset":
        this.reset();
        break;
    }
  }

  flow([mode, [x, y]]) {
    switch (mode) {
      case "new":
        this.env.FlowControl.push(new FlowControl(this.settings, { x, y }));
        break;
      case "next":
        this.env.FlowControl.at(-1).nextFlow(x, y);
        break;
      case "end":
        this.env.FlowControl.at(-1).endFlow(x, y);
        this.envRenderer.render(this.env);
        break;
    }
  }

  /**
   * A helper method to create instances of a selected particle type
   * @param {String} type The type of particle to create
   * @param  {Object} params The parameters of the particle
   * @param {settings} settings The settings of the particle
   * @returns A new instance of the selected particle type
   */
  #createParticleInstance(type, settings, params) {
    const SelectedClass =
      PARTICLES[type] ||
      Object.values(PARTICLES)[~~(Math.random() * Object.keys(PARTICLES).length)];

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

    const d1 = {
      mass: randRangeInt(
        this.settings.constants.max_mass,
        this.settings.constants.min_mass
      ),
    };

    Object.assign(d1, particle);

    const d2 = {
      x: randRangeInt(
        this.width - this.settings.radius(d1.mass),
        this.settings.radius(d1.mass)
      ),
      y: randRangeInt(
        this.height - this.settings.radius(d1.mass),
        this.settings.radius(d1.mass)
      ),
    };

    Object.assign(d2, d1);

    const p =
      particle instanceof PARTICLES.Particle
        ? particle
        : this.#createParticleInstance(type, this.settings, d2);

    this.newClient(p);
    this.particles.push(p);
  }

  /**
   * Deletes the specified particle from the grid and array
   * @param {Particle} particle The instance of Particle to remove
   */
  deleteParticle(particle) {
    this.removeClient(particle);
    particle.dispose();
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
    if (type === "GravityWell") params.ctx = this.envRenderer.drawCtx;

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
        Object.values(this.env).flat().length <
        this.settings.constants.max_environment_objects
      )
    )
      return alert("Max particles reached!"); // TODO: Alert doesn't work (it is a method of the global window object); send message to main thread instead

    const d = {
      x: randRangeInt(this.width, 0),
      y: randRangeInt(this.height, 0),
    };

    Object.assign(d, object);

    const o =
      object instanceof Environment
        ? object
        : this.#createObjectInstance(type, this.settings, d);

    this.newClient(o);
    this.env[o.getClassName()].push(o);

    this.envRenderer.render(this.env);
  }

  findNearParticles(p, r) {
    return this.findNear(p, r).filter((n) => n instanceof PARTICLES.Particle);
  }

  findNearObjects(p, r) {
    return this.findNear(p, r).filter((n) => n instanceof Environment);
  }

  // /**
  //  * Handles the collision of particles with the mouse
  //  * @param {Object} param0 An object containing mouse x and y coordinates
  //  */
  // mouseCollision({ mx: x, my: y }) {
  //   for (const near of this.findNearParticles(
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

  reset() {
    while (this.particles.length > 0) this.deleteParticle(this.particles[0]);
    for (const key of Object.keys(this.env)) {
      for (const env of this.env[key]) env.dispose();
      this.env[key].length = 0;
    }

    this.pIds = this.oIds = -1;

    this.renderer.dispose();
    this.envRenderer.dispose();

    this.addCanvas([this.canvas, this.envCanvas]);
    this.resizeCanvas([this.width, this.height]);
  }

  /**
   * Handles the calculations of a given particle
   * @param {Particle} particle The particle to do the calculations for
   */
  #calculations(particle) {
    this.removeClient(particle);

    particle.update(
      this.width,
      this.height,
      this.availableParticles[particle.getClassName()]?.(particle)
    );

    for (const near of this.findNearParticles(
      particle,
      particle.r + this.settings.constants.max_radius
    ))
      particle.detectCollision(near);

    // for (const near of this.findNearParticles(
    //   particle,
    //   Math.sqrt(particle.vx ** 2 + particle.vy ** 2)
    // ))
    //   particle.projectCollision(near);

    this.newClient(particle);
  }

  #envCalculations(object) {
    object.update?.(this.availableObjects[object.getClassName()]?.(object));
    for (const flow of this.env.FlowControl) {
      if (flow.finished === true) {
        const size = Math.sqrt(2 * flow.size ** 2) + this.settings.constants.max_radius;
        for (const f of flow.flow) {
          for (const near of this.findNearParticles(f, size)) {
            f.flow(near);
          }
        }
      }
    }
  }

  /**
   * The main animation loop
   */
  animate() {
    for (const p of this.particles) this.#calculations(p);

    for (const o of Object.values(this.env).flat()) this.#envCalculations(o);

    this.renderer.render(this.particles);

    requestAnimationFrame(this.animate.bind(this));
  }
}

console.log(new SimulationWorker(settings));
