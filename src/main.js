class SimulationMain {
  constructor() {
    this.#initCanvas();
    this.#initWorker();

    this.#onResize();
    addEventListener("resize", this.#onResize.bind(this));

    // this.canvas.addEventListener("mousemove", (event) => {
    //   const bounds = this.canvas.getBoundingClientRect();
    //   this.messageWorker({
    //     mouseCollision: {
    //       mx: event.clientX - bounds.left,
    //       my: event.clientY - bounds.top,
    //     },
    //   });
    // });
    // TODO

    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    this.canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();
      const bounds = this.canvas.getBoundingClientRect();
      this.newParticle({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    });

    this.domElements = {
      particleCount: document.getElementById("particleCount"),
    };
    this.particleCount = 0;
  }

  #initCanvas() {
    const canvas = document.getElementById("canvas");
    canvas
      ? (this.canvas = canvas)
      : document.body.appendChild(
          (this.canvas = document.createElement("canvas"))
        );
  }

  #initWorker() {
    this.worker = new Worker("src/canvas_worker.js", { type: "module" });

    if (!this.canvas.transferControlToOffscreen) {
      alert("Your browser does not support offscreenCanvas");
      return;
    }

    const offscreen = this.canvas.transferControlToOffscreen();
    this.worker.postMessage({ addCanvas: offscreen }, [offscreen]);
  }

  #onResize() {
    const pixelRatio = window.devicePixelRatio,
      width = (this.canvas.clientWidth * pixelRatio) | 0,
      height = (this.canvas.clientHeight * pixelRatio) | 0;
    this.messageWorker({ resizeCanvas: { width, height } });
  }

  messageWorker(message) {
    this.worker.postMessage(message);
  }

  newParticle(particle, type) {
    this.messageWorker({ newParticle: { particle, type } });
    this.domElements.particleCount.textContent = ++this.particleCount;
  }
}

import { createCheckbox, createSlider } from "./utils.mjs";

const variable_settings = {
  input: [
    { gravity: { min: -50, max: 50, value: 9.8, step: 0.1, name: "Gravity" } },
    { dt: { value: 0.1, step: 0.01, name: "Time" } },
    {
      coefficient_of_restitution: {
        min: 0.25,
        value: 0.95,
        step: 0.01,
        name: "COR",
      },
    },
    { drag: { min: 0.99, value: 0.999, step: 0.001, name: "Drag" } },
    {
      softening_constant: {
        value: 0.15,
        step: 0.01,
        name: "Softening Constant",
      },
    },
    { attraction_radius: { value: 0.1, name: "Attraction Radius" } },
    { attraction_strength: { max: 100, step: 1, name: "Attraction Strength" } },
  ],
};

const toggle_settings = {
  change: [
    { gravity: { value: "checked", name: "Gravity" } },
    { coefficient_of_restitution: { value: "checked", name: "COR" } },
    { drag: { name: "Drag" } },
    { show_velocity: { name: "Velocity" } },
    { softening_constant: { value: "checked", name: "Softening Constant" } },
  ],
};

for (const [event, settings] of Object.entries(variable_settings))
  for (const pair of settings)
    for (const [setting, options] of Object.entries(pair)) {
      const slider = createSlider("#settings", options, setting);
      slider.addEventListener(event, function () {
        sim.messageWorker({ updateVariable: { setting, value: this.value } });
      });
    }

for (const [event, settings] of Object.entries(toggle_settings))
  for (const pair of settings)
    for (const [setting, options] of Object.entries(pair)) {
      const checkbox = createCheckbox("#settings", options, setting),
        sliderList = document.querySelector(`#settings #${setting}Slider`)
          ?.parentElement.classList;
      if (!options.value) sliderList?.add("hidden");
      checkbox.addEventListener(event, function () {
        sim.messageWorker({
          updateToggle: { setting, value: this.checked },
        });
        sliderList?.[this.checked === true ? "remove" : "add"]("hidden");
      });
    }

const sim = new SimulationMain();
console.log(sim);

for (let i = 0; i < 100; ++i) sim.newParticle({}, "ChargedParticle");

sim.messageWorker({ animate: true });

/* addEventListener("error", (error) => {
  alert(error.message);
}); */
