import { createCheckbox, createSlider, FPS } from "../utils";
import { settings } from "../settings";
import { BaseMenu } from "./particle_customisation";

export class DOMHandler {
  constructor(preview) {
    this.domElements = {
      stats: {
        particleCount: document.querySelector("#stats #particle-count"),
        objectCount: document.querySelector("#stats #object-count"),
        mainFps: document.querySelector("#stats #mfps"),
        workerFps: document.querySelector("#stats #wfps"),
      },
      sliders: {},
      toggles: {},
      pCustom: {},
      pause: document.getElementById("pause"),
    };

    this.domElements.stats.particleCount.textContent = 0;
    this.domElements.stats.objectCount.textContent = 0;

    this.paused = false;
    this.preview = preview;
    (this.fps = new FPS(this.domElements.stats.mainFps)).start();

    if (!this.preview) this.#initDOMElements();
  }

  reset() {
    this.messageWorker({ reset: true });
  }

  onResize() {
    if (this.preview) return;
    this.overlay.width = window.innerWidth;
    this.overlay.height = window.innerHeight;
    this.ctx.strokeStyle = "#FFFFFF";

    this.menuSize = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    this.domElements.pCustom.content.resize();
  }

  async #initDOMElements() {
    this.#initCustomisationMenu();
    this.#initMenu();
    const { sliders, toggles } = await import("./dom_elements");
    this.#initSliders(sliders);
    this.#initToggles(toggles);
    {
      const right = {
          inner: document.querySelector(".settings.right > .inner-settings"),
          settings: document.querySelector(".settings.right"),
          toggled: false,
        },
        left = {
          inner: document.querySelector(".settings.left > .inner-settings"),
          settings: document.querySelector(".settings.left"),
          toggled: false,
        };
      right.settings.style.setProperty(
        "transform",
        `translate(${getComputedStyle(right.inner).width})`
      );
      left.settings.style.setProperty(
        "transform",
        `translate(${-parseInt(getComputedStyle(left.inner).width, 10)}px)`
      );
      document.querySelector(".settings.right > .arrow").addEventListener("click", () => {
        right.settings.style.setProperty(
          "transform",
          `translate(${right.toggled ? getComputedStyle(right.inner).width : "0px"})`
        );
        right.toggled = !right.toggled;
      });
      document.querySelector(".settings.left > .arrow").addEventListener("click", () => {
        left.settings.style.setProperty(
          "transform",
          `translate(${
            left.toggled ? -parseInt(getComputedStyle(left.inner).width, 10) : 0
          }px)`
        );
        left.toggled = !left.toggled;
      });
    }
  }

  #initCustomisationMenu() {
    const menu = document.getElementById("particle-customisation");
    menu.popover = "manual";
    menu.addEventListener("toggle", (e) => {
      this.customising = !this.customising;
      if (e.newState !== "open") this.resume();
      else this.pause();
    });
    this.customising = false;
    this.params = { particle: {} };

    this.domElements.pCustom.content = new BaseMenu(
      menu,
      settings.constants,
      (params) => {
        this.params.particle = params;
      }
    );
    this.domElements.pCustom.element = menu;
  }

  #initSliders(sliders) {
    for (const { setting, options } of sliders) {
      options.onChange = (value) => {
        this.messageWorker({ updateVariable: [setting, value] });
      };

      this.domElements.sliders[setting] = createSlider(
        ".settings > #sliders",
        options,
        setting
      );
    }
  }

  async #initToggles(toggles) {
    for (const { setting, options } of toggles) {
      const { slider, sliderValue } = this.domElements.sliders[setting] || {};

      options.hr = true;
      options.onChange = (value) => {
        this.messageWorker({
          updateToggle: [setting, value],
        });
        if (slider && sliderValue) {
          slider.parentElement.classList.toggle("disabled");
          slider.disabled = !value;
          sliderValue.disabled = !value;
        }
        this.domElements.toggles[setting].container.parentElement.classList.toggle(
          "disabled"
        );
      };

      this.domElements.toggles[setting] = createCheckbox(
        ".settings > #checkboxes",
        options,
        setting
      );

      if (!options.value) {
        this.domElements.toggles[setting].container.parentElement.classList.toggle(
          "disabled"
        );
        if (slider && sliderValue) {
          slider.parentElement.classList.toggle("disabled");
          slider.disabled = true;
          sliderValue.disabled = true;
        }
      }
    }

    document.querySelector(".settings > #checkboxes > hr:last-child").remove();
  }

  async #initMenu() {
    const { RadialMenu } = await import("../radial_menu/RadialMenu"),
      { PARTICLES, OBJECTS } = await import("../bodies");

    const items = [
      {
        id: "newParticle",
        title: "New Particle",
        items: [{ id: "Random", title: "Random" }],
      },
      {
        id: "newObject",
        title: "New Object",
        items: [{ id: "FlowControl", title: "Flow Control" }],
      },
      {
        id: "multiParticle",
        title: "Multi Particle",
        items: [{ id: "Random", title: "Random" }],
      },
      { id: "toggleWell", title: "Invert Gravity Wells" },
      { id: "customise", title: "Customise Particle" },
      { id: "deleteObject", title: "Delete Objects" },
      { id: "grab", title: "Grab Particles" },
      { id: "reset", title: "Reset" },
      { id: "pause", title: "Pause" },
    ];

    for (const p of Object.keys(PARTICLES)) {
      items[0].items.push({ id: p, title: p });
      items[2].items.push({ id: p, title: p });
    }

    for (const o of Object.keys(OBJECTS)) {
      items[1].items.push({ id: o, title: o });
    }

    const shuffle = () => {
      const a = ["r", "e", "s", "e", "t"];
      const strength = 0.2;

      if (Math.random() < 0.5) a.push("?");

      let n, t, i;

      for (let m = (a.length - 1) * strength; m > 0; m--) {
        n = ~~(m / strength);
        i = ~~(Math.random() * n);
        t = a[n];
        a[n] = Math.random() < 0.3 ? a[i] : a[i].toUpperCase();
        a[i] = Math.random() < 0.3 ? t : t.toUpperCase();
      }

      return a.join("");
    };

    const populateReset = (layer, recursion) => {
      layer.items = [];
      for (let i = 0, len = (Math.random() + 0.5) * 10; i < len; ++i) {
        layer.items.unshift({
          id: "reset",
          title: shuffle(),
        });
        if (Math.random() < recursion) populateReset(layer.items[0], recursion - 0.25);
        else layer.items[0].title = "RESET";
      }
    };

    populateReset(
      items.find(({ id }) => id === "reset"),
      0.75
    );

    const params = {
      parent: (this.domElements.menu = document.getElementById("wrapper")),
      size: this.menuSize,
      menuItems: items,
      defaultSelection: JSON.parse(JSON.stringify(items)),
    };

    const replaceDefault = (i, name) => {
      const item = params.defaultSelection[i].items;
      const index = item.findIndex(({ id }) => id === name);
      if (index < 0) return;
      item.splice(index, 1);
      item.unshift({ id: name, title: name });
    };

    replaceDefault(0, "Particle");
    replaceDefault(1, "Rectangle");
    replaceDefault(2, "Particle");

    params.onClick = (selection) => {
      if (!selection || !Array.isArray(selection)) return;
      if (selection.length > 1) selection.pop();

      switch (selection[0].id) {
        case "reset":
          this.reset();
          break;
        case "pause":
          this.pause();
          break;
        case "customise":
          this.domElements.pCustom.element.showPopover();
          break;
        default:
          this.selection = selection;
          if (selection.length > 1) {
            if (selection[0].id.includes("new")) {
              this.domElements.currentMode.innerHTML = `Mouse Mode: New ${selection[0].id.slice(
                3
              )}<br/>${selection[0].id.slice(3)}: ${selection[1].id}`;
            } else if (selection[0].id.includes("multi")) {
              this.domElements.currentMode.innerHTML = `Mouse Mode: Multi ${selection[0].id.slice(
                5
              )}<br/>${selection[0].id.slice(5)}: ${selection[1].id}`;
            }
          } else if (selection[0].id === "toggleWell") {
            this.domElements.currentMode.innerHTML = "Mouse Mode: Invert Gravity Wells";
          } else if (selection[0].id === "deleteObject") {
            this.domElements.currentMode.innerHTML = "Mouse Mode: Delete Objects";
          } else if (selection[0].id === "grab") {
            this.domElements.currentMode.innerHTML = "Mouse Mode: Grab Particles";
          }

          break;
      }
    };

    this.menu = new RadialMenu(params);
    this.selection = [{ id: "newParticle" }, { id: "Particle" }];
    this.domElements.currentMode = document.getElementById("current-mode");
    this.domElements.currentMode.innerHTML = `Mouse Mode: New ${this.selection[0].id.slice(
      3
    )}<br/>Particle: ${this.selection[1].id}`;

    this.canvas.addEventListener("mousedown", (e) => {
      if (e.button !== 2 || this.customising) return;

      if (this.menu.currentMenu) {
        this.menu.close();
        this.menu.currentMenu = null;
        return;
      }

      this.domElements.menu.style.top = `${
        e.clientY - parseInt(getComputedStyle(this.domElements.menu).height, 10) / 2
      }px`;
      this.domElements.menu.style.left = `${
        e.clientX - parseInt(getComputedStyle(this.domElements.menu).width, 10) / 2
      }px`;

      this.menu.open(this.menuSize);
    });
  }

  initCanvas() {
    const canvas = document.getElementById("canvas");
    if (canvas) this.canvas = canvas;
    else this.canvas = document.body.appendChild(document.createElement("canvas"));

    const envCanvas = document.getElementById("env-canvas");
    if (envCanvas) this.envCanvas = envCanvas;
    else this.envCanvas = document.body.appendChild(document.createElement("canvas"));

    if (this.preview) return;

    const overlay = document.getElementById("overlay");
    if (overlay) this.overlay = overlay;
    else this.overlay = document.body.appendChild(document.createElement("canvas"));
    this.ctx = this.overlay.getContext("2d");
    this.ctx.strokeStyle = "#FFFFFF";

    this.#initListeners();
  }

  #initListeners() {
    document.body.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    document.body.addEventListener("keydown", (e) => {
      if (this.paused === true && !(e.altKey || e.ctrlKey || e.shiftKey)) this.resume();
      else if (this.paused === false && e.key === "Escape") this.pause();
    });

    {
      let resume = false;

      this.domElements.pause.addEventListener("mousedown", (e) => {
        e.preventDefault();
        resume = true;
      });

      this.domElements.pause.addEventListener("mouseup", () => {
        if (resume !== true) return;
        this.resume();
        resume = false;
      });
    }

    this.#handleMouse();
  }

  pause() {
    this.paused = true;
    if (this.mouseDown === true) {
      this.mouseDown = false;
      this.mouseDown2 = true;
    }

    this.fps.stop();

    this.domElements.pause.style.pointerEvents = "all";
    this.domElements.pause.style.opacity = 1;

    this.messageWorker({ pause: true });

    for (const element of document.body.children) {
      if (
        element === this.domElements.pause ||
        [...this.domElements.pCustom.element.children].includes(element) ||
        element === this.domElements.pCustom.element
      ) {
        continue;
      }
      element.classList.add("blur");
    }
  }

  resume() {
    if (this.domElements.pCustom.element.matches(":popover-open")) return;
    this.paused = false;
    if (this.mouseDown2 === true) this.mouseDown = true;
    if (this.mouseEvent === "multi") this.multi();

    this.fps.start();

    this.domElements.pause.style.pointerEvents = "none";
    this.domElements.pause.style.opacity = 0;

    this.messageWorker({ resume: true });

    const blur = document.getElementsByClassName("blur");
    while (blur.length) blur[0].classList.remove("blur");
  }

  #handleMouse() {
    this.mouseDown = false;
    let m, dx, dy, d;
    const pre = [],
      pre2 = [],
      points = [],
      c = [];
    const multiRadius = 80,
      speed = 1;
    let count = 0;

    DOMHandler.prototype.multi = () => {
      if (this.mouseDown !== true || count++ % speed !== 0) return;
      const angle = Math.random() * 2 * Math.PI,
        hyp = Math.sqrt(Math.random()) * (multiRadius - settings.constants.max_radius);
      this.newParticle(
        Object.assign({}, this.params.particle, {
          x: c[0] + Math.cos(angle) * hyp,
          y: c[1] + Math.sin(angle) * hyp,
        }),
        this.selection[1].id
      );
      requestAnimationFrame(this.multi);
    };

    /**
     * A helper method to get the mouse position
     * @param {MouseEvent} event The mouse event to get the position of
     * @returns The mouse position in an array
     */
    const getMousePos = (event) => {
      const bounds = this.canvas.getBoundingClientRect();
      return [event.clientX - bounds.left, event.clientY - bounds.top];
    };

    const mousedown = (event) => {
      event.preventDefault();

      if (
        this.mouseDown === true ||
        event.button !== 0 ||
        this.menu?.currentMenu ||
        this.customising
      )
        return;

      m = getMousePos(event);

      pre[0] = m[0];
      pre[1] = m[1];
      this.mouseDown = true;

      switch (this.selection[0].id) {
        case "newParticle":
          this.mouseEvent = "particle";
          break;
        case "newObject":
          this.mouseEvent = "object";
          if (this.selection[1].id === "FlowControl") {
            points.length = 0;
            this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
            this.messageWorker({ flow: ["new", m] });
          }
          break;
        case "multiParticle":
          c[0] = m[0];
          c[1] = m[1];
          this.mouseEvent = "multi";
          count = 0;
          this.multi();
          this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
          this.ctx.beginPath();
          this.ctx.arc(c[0], c[1], multiRadius, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
        case "toggleWell":
          this.mouseEvent = "well";
          break;
        case "deleteObject":
          this.mouseEvent = "delObj";
          break;
        case "grab":
          this.mouseEvent = "grab";
          this.messageWorker({ grabParticle: m });
          break;
        default:
          break;
      }
    };

    const mousemove = (event) => {
      if (this.mouseDown !== true) return;

      m = getMousePos(event);

      dx = m[0] - pre[0];
      dy = m[1] - pre[1];

      c[0] = m[0];
      c[1] = m[1];

      switch (this.mouseEvent) {
        case "particle":
          this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
          this.ctx.beginPath();
          this.ctx.moveTo(pre[0], pre[1]);
          this.ctx.lineTo(m[0], m[1]);
          this.ctx.stroke();
          this.ctx.closePath();
          break;
        case "object":
          switch (this.selection[1].id) {
            case "Accelerator":
            case "Decelerator":
            case "Rectangle":
              if (Math.abs(dx) > settings.constants.max_width)
                dx = settings.constants.max_width;
              if (Math.abs(dy) > settings.constants.max_height)
                dy = settings.constants.max_height;

              this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
              this.ctx.fillStyle = "#FFFFFFA0";
              this.ctx.fillRect(pre[0], pre[1], dx, dy);
              break;
            case "GravityWell":
            case "BlackHole":
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
              break;
          }
          break;
        case "multi":
          this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
          this.ctx.beginPath();
          this.ctx.arc(c[0], c[1], multiRadius, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
        case "grab":
          this.messageWorker({ moveGrab: m });
          break;
        default:
          break;
      }
    };

    const mouseup = (event) => {
      if (this.mouseDown !== true) return;

      m = getMousePos(event);

      dx = m[0] - pre[0];
      dy = m[1] - pre[1];

      switch (this.mouseEvent) {
        case "object":
          switch (this.selection[1].id) {
            case "Rectangle":
              this.newObject({ x: pre[0], y: pre[1], w: dx, h: dy }, "Rectangle");
              break;
            case "GravityWell":
              d = Math.sqrt(dx ** 2 + dy ** 2);
              this.newObject(
                {
                  x: pre[0],
                  y: pre[1],
                  r: d,
                  strength: d ** 1.5 * 200,
                },
                "GravityWell"
              );
              break;
            case "BlackHole":
              d = Math.sqrt(dx ** 2 + dy ** 2);
              this.newObject(
                {
                  x: pre[0],
                  y: pre[1],
                  r: d,
                  strength: d ** 2 * 300,
                },
                "BlackHole"
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
              break;
            case "Accelerator":
              this.newObject({ x: pre[0], y: pre[1], w: dx, h: dy }, "Accelerator");
              break;
            case "Decelerator":
              this.newObject({ x: pre[0], y: pre[1], w: dx, h: dy }, "Decelerator");
              break;
            default:
              break;
          }
          break;
        case "well":
          this.messageWorker({ toggleWell: m });
          break;
        case "delObj":
          this.deleteObject(...m);
          break;
        case "grab":
          this.messageWorker({ releaseParticle: true });
          break;
        case "particle":
          const params = {
            x: pre[0],
            y: pre[1],
            vx: dx,
            vy: dy,
            mass: this.params.particle.mass,
            radius: this.params.particle.radius,
            lifespan: this.params.particle.lifespan,
            colour: this.params.particle.colour,
            paths: this.params.particle.paths,
          };
          if (this.params.particle.vx) params.vx += this.params.particle.vx;
          if (this.params.particle.vy) params.vy += this.params.particle.vy;
          this.newParticle(params, this.selection[1].id);
          break;
        default:
          break;
      }
      this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
      this.mouseDown = false;
      this.mouseEvent = null;
    };

    this.canvas.addEventListener("mousedown", mousedown);

    this.canvas.addEventListener("mousemove", mousemove);

    this.canvas.addEventListener("mouseup", mouseup);
  }

  dispose() {
    if (this.preview) return;
    for (const element of this.domElements.sliders
      .concat(this.domElements.toggles)
      .flat())
      element.remove();
    this.domElements.pCustom.content.dispose();
  }
}
