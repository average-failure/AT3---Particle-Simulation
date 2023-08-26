import { DOMHandler } from "./dom_handler";

class SimulationMain extends DOMHandler {
  constructor() {
    super();

    this.#initWorker();

    this.onResize();
    addEventListener("resize", this.onResize.bind(this));

    this.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
  }

  /**
   * Handles the response to receiving messages from the worker thread
   * @param {MessageEvent} param0 A message event sent from the worker
   */
  #onMessage({ data: message }) {
    for (const method of this.methods.filter((method) =>
      Object.keys(message).includes(method)
    ))
      this[method](message[method]);
  }

  updateParticleCount(count) {
    this.domElements.stats.particleCount.textContent = count;
  }

  updateObjectCount(count) {
    this.domElements.stats.objectCount.textContent = count;
  }

  updateFps(fps) {
    this.domElements.stats.workerFps.textContent = fps;
  }

  #initWorker() {
    this.initCanvas();

    this.worker = new Worker("src/simulation/canvas_worker.js", { type: "module" });
    this.worker.onmessage = this.#onMessage.bind(this);

    if (!this.canvas.transferControlToOffscreen) {
      alert("Your browser does not support offscreenCanvas");
      return;
    }

    const offscreen = this.canvas.transferControlToOffscreen(),
      envOffscreen = this.envCanvas.transferControlToOffscreen();

    this.worker.postMessage({ addCanvas: [offscreen, envOffscreen] }, [
      offscreen,
      envOffscreen,
    ]);
  }

  onResize() {
    super.onResize();
    // const pixelRatio = window.devicePixelRatio,
    //   width = (this.canvas.clientWidth * pixelRatio) | 0,
    //   height = (this.canvas.clientHeight * pixelRatio) | 0;
    this.messageWorker({
      resizeCanvas: [window.innerWidth, window.innerHeight],
    });
  }

  messageWorker(message) {
    this.worker.postMessage(message);
  }

  newParticle(particle, type) {
    this.messageWorker({ newParticle: [particle, type] });
  }

  newObject(object, type) {
    this.messageWorker({ newObject: [object, type] });
  }
}

const sim = new SimulationMain();
console.log(sim);

// for (let i = 0; i < 100; ++i) sim.newParticle({}, "ChargedParticle");

sim.messageWorker({ animate: true });

/* addEventListener("error", (error) => {
  alert(error.message);
}); */
