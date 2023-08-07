import { createCheckbox, createSelect, createSlider } from "./utils.mjs";
import { settings } from "./settings.mjs";

export class DOMHandler {
  constructor() {
    this.domElements = {
      temp: document.getElementById("temp"),
      stats: {
        particleCount: document.querySelector("#stats > #particleCount"),
      },
      sliders: {},
      toggles: {},
      dropdowns: {},
    };
    this.particleCount = 0;

    this.#initDOMElements();
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
              this.messageWorker({ updateVariable: [setting, this.value] });
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
            this.messageWorker({
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

  initCanvas() {
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

    this.#initListeners();
  }

  #initListeners() {
    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    this.#handleMouse();

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
  }

  #getMousePos(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return [event.clientX - bounds.left, event.clientY - bounds.top];
  }

  #handleMouse() {
    this.canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();

      if (this.mouseDown === true) return;

      const m = this.#getMousePos(event);

      switch (this.domElements.dropdowns.mouse_mode.value) {
        case "New Object":
          this.mouseDown = true;
          this.pre = [m[0], m[1]];

          const style = this.domElements.temp.style;

          style.display = "block";
          style.left = m[0] + "px";
          style.top = m[1] + "px";

          break;
        default:
          this.newParticle(
            { x: m[0], y: m[1] },
            this.domElements.dropdowns.particle_type.value
          );
          break;
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!(this.mouseDown === true)) return;

      const m = this.#getMousePos(event);

      const style = this.domElements.temp.style;

      let dx = m[0] - this.pre[0],
        dy = m[1] - this.pre[1];

      if (Math.abs(dx) > settings.constants.max_width)
        dx = settings.constants.max_width;
      if (Math.abs(dy) > settings.constants.max_height)
        dy = settings.constants.max_height;

      style.width = dx;
      style.height = dy;

      if (dx < 0) {
        style.left = m[0];
        style.width = Math.abs(dx);
      }

      if (dy < 0) {
        style.top = m[1];
        style.height = Math.abs(dy);
      }
    });

    this.canvas.addEventListener("mouseup", (event) => {
      if (!(this.mouseDown === true)) return;

      const m = this.#getMousePos(event);

      switch (this.domElements.dropdowns.object_type.value) {
        case "Circle":
          this.newObject({
            x: this.pre[0],
            y: this.pre[1],
            r: 3 /**change this later */,
          });
          break;
        default:
          this.newObject({
            x: this.pre[0],
            y: this.pre[1],
            w: m[0] - this.pre[0],
            h: m[1] - this.pre[1],
          });
          break;
      }

      this.mouseDown = false;

      const style = this.domElements.temp.style;

      style.display = "none";
      style.width = style.height = 0;
    });
  }
}
