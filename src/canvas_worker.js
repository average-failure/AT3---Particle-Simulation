import * as PARTICLES from "./particles.mjs";
import * as OBJECTS from "./objects.mjs";
import { FlowControl } from "./flow_control.mjs";
import { Environment } from "./environment.mjs";
import { FPS, randRangeInt } from "./utils.mjs";
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

    (this.fps = new FPS()).start(
      10,
      10,
      function (fps) {
        postMessage({ updateFps: fps });
      }.bind(this)
    );

    this.pIds = this.oIds = -1;
    this.particles = [];

    this.counter = 0;

    this.env = { FlowControl: [] };
    for (const o of Object.keys(OBJECTS)) this.env[o] = [];

    this.ctx = new OffscreenCanvas(0, 0).getContext("2d", { alpha: false });

    this.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

    this.availableParticles = {
      Particle: () => {},
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
      MergeParticle: (particle) => [
        this.findNearParticles(particle, particle.r + this.settings.constants.max_radius),
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
      Accelerator: (object) => [
        this.findNearParticles(
          { x: object.x + object.w / 2, y: object.y + object.h / 2 },
          Math.sqrt(object.measurements[0] ** 2 + object.measurements[1] ** 2) +
            this.settings.constants.max_radius
        ),
      ],
      Decelerator: (object) => [
        this.findNearParticles(
          { x: object.x + object.w / 2, y: object.y + object.h / 2 },
          Math.sqrt(object.measurements[0] ** 2 + object.measurements[1] ** 2) +
            this.settings.constants.max_radius
        ),
      ],
      BlackHole: () => [this.particles],
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
      this[method](message[method]);
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

  toggleWell([x, y]) {
    for (const well of this.env.GravityWell) {
      if (this.envRenderer.ctx.isPointInPath(well.path, x - well.x, y - well.y))
        well.reverseForce();
    }
    this.envRenderer.render(this.env);
  }

  pause() {
    this.settings.pause = true;

    this.fps.stop();
  }

  resume() {
    this.settings.pause = false;
    if (this.running !== true) this.animate();

    this.fps.start(10, 10, (fps) => {
      postMessage({ updateFps: fps });
    });
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
    const d1 = {
      mass: randRangeInt(
        this.settings.constants.max_mass / 5,
        this.settings.constants.min_mass
      ),
    };

    Object.assign(d1, particle);

    const radius = ~~(d1.mass / this.settings.constants.mass_radius_ratio);

    const d2 = {
      x: randRangeInt(this.width - radius, radius),
      y: randRangeInt(this.height - radius, radius),
    };

    Object.assign(d2, d1);

    const p =
      particle instanceof PARTICLES.Particle
        ? particle
        : this.#createParticleInstance(type, this.settings, d2);

    this.newClient(p);
    this.particles.push(p);

    postMessage({ updateParticleCount: this.particles.length });

    return p;
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
    postMessage({ updateParticleCount: this.particles.length });
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
    if (type === "GravityWell" || type === "BlackHole") params.ctx = this.ctx;

    return new SelectedClass(++this.oIds, settings, params);
  }

  /**
   * Adds a new environment object to the spatial hash grid
   * @param {Environment} object An instance of an environment object or an object containing parameters for the environment object to add to the hash
   * @param {String} type A string containing the type of environment object to create
   */
  newObject([object, type]) {
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

    postMessage({ updateObjectCount: Object.values(this.env).flat().length });

    return o;
  }

  findNearParticles(p, r) {
    return this.findNear(p, r).filter((n) => n instanceof PARTICLES.Particle);
  }

  findNearObjects(p, r) {
    return this.findNear(p, r).filter((n) => n instanceof Environment);
  }

  splitParticle(p, blackHole) {
    let r = p.mass * 0.95;

    const masses = [],
      min = this.settings.constants.min_mass,
      parts = Math.min(
        ~~((r / Math.sqrt(r)) * (Math.random() * 0.5 + 0.5)) + 2,
        Math.max(r / (min * 2), 2)
      ),
      m = r - min * parts,
      c = ~~(m / parts),
      d = c * 0.3;

    for (let i = 0; i < parts; i++) {
      if (r < min) break;
      const offset = ~~((Math.random() - 0.5) * 2 * d);
      const p = c + offset + min;
      masses.push(p);
      r -= p;
    }

    for (const mass of masses) {
      const angle = (Math.random() - 0.5) * Math.min(parts / 10, Math.PI),
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      this.newParticle([
        Object.assign({}, p, {
          x: p.x + (Math.random() - 0.5) * parts,
          y: p.y + (Math.random() - 0.5) * parts,
          vx: p.vx * cos - p.vy * sin,
          vy: p.vx * sin + p.vy * cos,
          mass,
          radius: blackHole ? 1 : null,
          immortal: 30 * (Math.random() * 2 + 0.5),
        }),
        p.getClassName(),
      ]);
    }

    this.deleteParticle(p);
  }

  mergeParticles(mode, ...particles) {
    const max = particles.reduce((prev, curr) => (prev.mass > curr.mass ? prev : curr));

    const massSum = particles.reduce((sum, { mass }) => sum + mass, 0);

    let mass = max.mass,
      vx = max.vx * (max.mass / massSum),
      vy = max.vy * (max.mass / massSum);

    mode = mode ? Math.sign(mode) : 1;

    for (const p of particles) {
      if (p === max) continue;
      mass += p.mass * mode;
      vx += p.vx * (p.mass / massSum);
      vy += p.vy * (p.mass / massSum);
    }

    vx /= particles.length;
    vy /= particles.length;

    mass = mass >= 30 ? mass : 30;

    this.newParticle([
      Object.assign({}, max, {
        vx,
        vy,
        mass,
        immortal:
          particles.reduce((sum, { immortal }) => sum + immortal, 0) / particles.length,
      }),
      max.getClassName(),
    ]);

    for (const p of particles) this.deleteParticle(p);
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

    const returnValue = particle.update(
      this.width,
      this.height,
      this.availableParticles[particle.getClassName()](particle)
    );

    switch (returnValue?.type) {
      case "merge":
        if (returnValue.merge?.length)
          this.mergeParticles(1, particle, ...returnValue.merge);
        break;
      default:
        break;
    }

    if (particle.collision <= 0) {
      for (const near of this.findNearParticles(
        particle,
        particle.r + this.settings.constants.max_radius
      ).filter((p) => p.collision <= 0)) {
        particle.detectCollision(near);
      }
    }

    // for (const near of this.findNearParticles(
    //   particle,
    //   Math.sqrt(particle.vx ** 2 + particle.vy ** 2)
    // ))
    //   particle.projectCollision(near);

    this.newClient(particle);
  }

  #envCalculations(object) {
    const returnValue = object.update?.(
      this.availableObjects[object.getClassName()](object)
    );

    if (returnValue instanceof Array && returnValue.length)
      for (const r of returnValue) {
        if (r.mass <= this.settings.constants.min_mass) this.deleteParticle(r);
        else this.splitParticle(r, true);
      }

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
    this.running = true;

    for (const p of this.particles) this.#calculations(p);

    for (const o of Object.values(this.env).flat()) this.#envCalculations(o);

    this.renderer.render(this.particles);
    if (this.settings.toggles.animated_environment === true)
      this.envRenderer.render(this.env);

    if (this.settings.pause === true) {
      this.running = false;
      return;
    }

    requestAnimationFrame(this.animate.bind(this));
  }
}

console.log(new SimulationWorker(settings));
