import { DOMHandler } from "./dom_handler.mjs";

class SimulationMain extends DOMHandler {
  constructor() {
    super();

    this.#initWorker();

    this.#onResize();
    addEventListener("resize", this.#onResize.bind(this));
  }

  #initWorker() {
    this.initCanvas();

    this.worker = new Worker("src/canvas_worker.js", { type: "module" });

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

  #onResize() {
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
    this.domElements.stats.particleCount.textContent = ++this.particleCount;
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
