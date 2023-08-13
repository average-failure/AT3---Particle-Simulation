import { createCheckbox, createSelect, createSlider, createButton } from "./utils.mjs";
import { settings } from "./settings.mjs";

export class DOMHandler {
  constructor() {
    this.domElements = {
      stats: {
        particleCount: document.querySelector("#stats > #particleCount"),
        objectCount: document.querySelector("#stats > #objectCount"),
      },
      sliders: {},
      toggles: {},
      dropdowns: {},
      buttons: {},
    };
    this.particleCount = 0;
    this.objectCount = 0;

    this.#initDOMElements();
  }

  onResize() {
    this.overlay.width = window.innerWidth;
    this.overlay.height = window.innerHeight;
    this.ctx.strokeStyle = "#FFFFFF";
  }

  async #initDOMElements() {
    await this.#initSliders();
    this.#initToggles();
    this.#initDropdowns();
    this.#initButtons();
  }

  #initSliders() {
    return new Promise(async (resolve) => {
      const { sliders } = await import("./dom_elements.mjs");

      for (const [event, settings] of Object.entries(sliders)) {
        for (const pair of settings) {
          for (const [setting, options] of Object.entries(pair)) {
            const slider = createSlider(".settings > #sliders", options, setting);

            slider.addEventListener(event, () => {
              this.messageWorker({ updateVariable: [setting, slider.value] });
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
          const checkbox = createCheckbox(".settings > #checkboxes", options, setting),
            sliderList = this.domElements.sliders[setting]?.parentElement.classList;

          if (!options.value) sliderList?.add("hidden");

          checkbox.addEventListener(event, () => {
            this.messageWorker({
              updateToggle: [setting, checkbox.checked],
            });
            sliderList?.[checkbox.checked === true ? "remove" : "add"]("hidden");
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

  async #initButtons() {
    const { buttons } = await import("./dom_elements.mjs");

    for (const [event, options] of Object.entries(buttons)) {
      const button = createButton(".settings > #buttons", options, event);

      button.addEventListener("click", () => {
        this.messageWorker({ onButton: event });
      });

      if (options.callback) button.addEventListener("click", options.callback.bind(this));

      this.domElements.buttons[event] = button;
    }
  }

  initCanvas() {
    const canvas = document.getElementById("canvas");
    if (canvas) this.canvas = canvas;
    else document.body.appendChild((this.canvas = document.createElement("canvas")));

    const envCanvas = document.getElementById("envCanvas");
    if (envCanvas) this.envCanvas = envCanvas;
    else document.body.appendChild((this.envCanvas = document.createElement("canvas")));

    const overlay = document.getElementById("overlay");
    if (overlay) this.overlay = overlay;
    else document.body.appendChild((this.overlay = document.createElement("canvas")));
    this.ctx = this.overlay.getContext("2d");
    this.ctx.strokeStyle = "#FFFFFF";

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

  /**
   * A helper method to get the mouse position
   * @param {Event} event The mouse down, move, up or click event
   * @returns The mouse position in an array
   */
  #getMousePos(event) {
    const bounds = this.canvas.getBoundingClientRect();
    return [event.clientX - bounds.left, event.clientY - bounds.top];
  }

  #handleMouse() {
    let m, mouseDown, mouseEvent, dx, dy, d;
    const pre = [],
      pre2 = [],
      points = [];

    this.canvas.addEventListener("mousedown", (event) => {
      event.preventDefault();

      if (mouseDown === true) return;

      m = this.#getMousePos(event);

      pre[0] = m[0];
      pre[1] = m[1];
      mouseDown = true;

      switch (this.domElements.dropdowns.mouse_mode.value) {
        case "New Object":
          mouseEvent = "object";
          if (this.domElements.dropdowns.object_type.value === "FlowControl") {
            points.length = 0;
            this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
            this.messageWorker({ flow: ["new", m] });
          }
          break;
        default:
          mouseEvent = "particle";
          break;
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!(mouseDown === true)) return;

      m = this.#getMousePos(event);

      dx = m[0] - pre[0];
      dy = m[1] - pre[1];

      switch (mouseEvent) {
        case "object":
          switch (this.domElements.dropdowns.object_type.value) {
            case "GravityWell":
            case "Circle":
              this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
              this.ctx.beginPath();
              this.ctx.fillStyle = "#FFFFFFA0";
              this.ctx.arc(pre[0], pre[1], Math.sqrt(dx ** 2 + dy ** 2), 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.closePath();
              break;
            case "FlowControl":
              if ((pre2[0] - m[0]) ** 2 + (pre2[1] - m[1]) ** 2 < 100) break;

              points.push({ x: m[0], y: m[1] });
              this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
              this.ctx.drawCurve(points);

              this.messageWorker({ flow: ["next", m] });

              pre2[0] = m[0];
              pre2[1] = m[1];
              break;
            default:
              if (Math.abs(dx) > settings.constants.max_width)
                dx = settings.constants.max_width;
              if (Math.abs(dy) > settings.constants.max_height)
                dy = settings.constants.max_height;

              this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
              this.ctx.fillStyle = "#FFFFFFA0";
              this.ctx.fillRect(pre[0], pre[1], dx, dy);
              break;
          }
          break;
        case "particle":
          this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
          this.ctx.beginPath();
          this.ctx.moveTo(pre[0], pre[1]);
          this.ctx.lineTo(m[0], m[1]);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
      }
    });

    this.canvas.addEventListener("mouseup", (event) => {
      if (!(mouseDown === true)) return;

      m = this.#getMousePos(event);

      dx = m[0] - pre[0];
      dy = m[1] - pre[1];

      switch (mouseEvent) {
        case "object":
          switch (this.domElements.dropdowns.object_type.value) {
            case "GravityWell":
              d = Math.sqrt(dx ** 2 + dy ** 2);
              this.newObject(
                {
                  x: pre[0],
                  y: pre[1],
                  r: d,
                  strength: d ** 1.5,
                },
                "GravityWell"
              );
              break;
            case "Circle":
              this.newObject(
                {
                  x: pre[0],
                  y: pre[1],
                  r: Math.sqrt(dx ** 2 + dy ** 2),
                },
                "Circle"
              );
              break;
            case "FlowControl":
              this.messageWorker({ flow: ["end", m] });
              this.domElements.stats.objectCount.textContent = ++this.objectCount;
              break;
            default:
              this.newObject({ x: pre[0], y: pre[1], w: dx, h: dy }, "Rectangle");
              break;
          }

          break;
        case "particle":
          this.newParticle(
            { x: pre[0], y: pre[1], vx: dx, vy: dy },
            this.domElements.dropdowns.particle_type.value
          );

          break;
      }
      this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
      mouseDown = false;
    });
  }
}
