import { createCheckbox, createSelect, createSlider } from "./utils.mjs";

class SimulationMain {
  constructor() {
    this.domElements = {
      stats: {
        particleCount: document.querySelector("#stats > #particleCount"),
      },
      sliders: {},
      toggles: {},
      dropdowns: {},
    };
    this.particleCount = 0;

    this.#initDOMElements();

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

      switch (this.domElements.dropdowns.mouse_mode.value) {
        case "New Object":
          this.newObject(
            {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            },
            this.domElements.dropdowns.object_type.value
          );
          break;
        default:
          this.newParticle(
            {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            },
            this.domElements.dropdowns.particle_type.value
          );
          break;
      }
    });
  }

  async #initDOMElements() {
    await this.#initSliders();
    this.#initToggles();
    this.#initDropdowns();
  }

  #initSliders() {
    return new Promise(async (resolve) => {
      const { sliders } = await import("./dom_elements.mjs");

      for (const [event, settings] of Object.entries(sliders)) {
        for (const pair of settings) {
          for (const [setting, options] of Object.entries(pair)) {
            const slider = createSlider(
              ".settings > #sliders",
              options,
              setting
            );

            slider.addEventListener(event, function () {
              sim.messageWorker({ updateVariable: [setting, this.value] });
            });

            this.domElements.sliders[setting] = slider;
          }
        }
      }

      resolve();
    });
  }

  async #initToggles() {
    const { toggles } = await import("./dom_elements.mjs");

    for (const [event, settings] of Object.entries(toggles)) {
      for (const pair of settings) {
        for (const [setting, options] of Object.entries(pair)) {
          const checkbox = createCheckbox(
              ".settings > #checkBoxes",
              options,
              setting
            ),
            sliderList =
              this.domElements.sliders[setting]?.parentElement.classList;

          if (!options.value) sliderList?.add("hidden");

          checkbox.addEventListener(event, function () {
            sim.messageWorker({
              updateToggle: [setting, this.checked],
            });
            sliderList?.[this.checked === true ? "remove" : "add"]("hidden");
          });

          this.domElements.toggles[setting] = checkbox;
        }
      }
    }
  }

  async #initDropdowns() {
    const { dropdowns } = await import("./dom_elements.mjs");

    for (const [setting, options] of Object.entries(dropdowns)) {
      this.domElements.dropdowns[setting] = createSelect(
        ".settings > #dropdowns",
        options,
        setting
      );
    }
  }

  #initCanvas() {
    const canvas = document.getElementById("canvas");
    if (canvas) this.canvas = canvas;
    else
      document.body.appendChild(
        (this.canvas = document.createElement("canvas"))
      );

    const envCanvas = document.getElementById("envCanvas");
    if (envCanvas) this.envCanvas = envCanvas;
    else
      document.body.appendChild(
        (this.envCanvas = document.createElement("canvas"))
      );
  }

  #initWorker() {
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
