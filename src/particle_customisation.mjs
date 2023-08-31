import { PARTICLES } from "./bodies";
import {
  createSlider,
  createTextInput,
  createColourInput,
  hslToHex,
  createCheckbox,
} from "./utils";

export class BaseMenu {
  constructor(parent, constants, callback) {
    this.parent = parent;
    this.constants = constants;

    if (!(this.canvasContainer = parent.querySelector(".canvasContainer"))) {
      parent.appendChild((this.canvasContainer = document.createElement("div")));
      this.canvasContainer.className = "canvasContainer";
    }
    parent.appendChild((this.heading = document.createElement("h2")));
    this.heading.innerHTML = "Customise your particle... do <i>whatever</i> you want 😧";

    this.parentStyle = getComputedStyle(parent);
    this.parentWidth = parseInt(this.parentStyle.width, 10) / 100;
    this.parentHeight = parseInt(this.parentStyle.height, 10) / 100;

    if (!(this.drawCtrlContainer = parent.querySelector(".drawCtrlContainer"))) {
      parent.appendChild((this.drawCtrlContainer = document.createElement("div")));
      this.drawCtrlContainer.className = "drawCtrlContainer";
    }
    this.drawCtrlContainer.innerHTML = "<h2>🖌️ Draw Style 🖌️</h2>";

    parent.appendChild((this.doneButton = document.createElement("button")));
    this.doneButton.className = "doneButton";
    this.doneButton.textContent = "Finish Customisation";

    this.doneButton.addEventListener("click", () => {
      parent.hidePopover();
      this.drawCtrlContainer.hidePopover();

      this.inputs.drawing.toggle.checked = false;
      this.drawing.toggle = false;

      const params = {
        paths: this.paths,
        mass: parseFloat(this.mass),
        radius: parseFloat(this.radius),
        lifespan: parseFloat(this.lifespan) * 2,
      };

      if (this.colour !== hslToHex(PARTICLES.Particle.getColour(0, 0))) {
        params.colour = this.colour;
      }

      callback(params);
    });

    this.paths = [];
    this.drawing = {};

    this.init();
  }

  dispose() {
    for (const child of this.parent.children) child.remove();
    for (const prop of Object.keys(this)) delete this[prop];
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.canvasContainer.appendChild(this.canvas);

    this.inputs = {
      mass: createTextInput(
        this.parent,
        {
          name: "Mass: ",
          type: "number",
          placeholder: `Random (${this.constants.min_mass}-${this.constants.max_random_mass})`,
          onChange: (value) => {
            this.mass = value;
            if (!this.customRadius)
              this.radius = Math.min(
                Math.max(
                  Math.ceil(this.mass / this.constants.mass_radius_ratio),
                  this.constants.min_radius
                ),
                this.constants.max_radius
              );
            this.draw();
          },
        },
        "mass"
      ),
      radius: createTextInput(
        this.parent,
        {
          name: "Radius: ",
          type: "number",
          max: this.constants.max_radius,
          placeholder: `Random (${this.constants.min_radius}-${this.constants.max_random_radius})`,
          onChange: (value) => {
            this.customRadius = this.radius =
              value < this.constants.min_radius ? 0 : value;
            this.draw();
          },
          units: "px",
        },
        "radius"
      ),
      lifespan: createTextInput(
        this.parent,
        {
          name: "Lifespan: ",
          type: "number",
          placeholder: "Random (500-5000)",
          onChange: (value) => {
            this.lifespan = value;
          },
        },
        "lifespan"
      ),
      colour: createColourInput(
        this.parent,
        {
          name: "Colour: ",
          value: (this.colour = hslToHex(PARTICLES.Particle.getColour(0, 0))),
          onChange: (value) => {
            this.colour = value;
            this.draw();
          },
        },
        "colour"
      ),
      drawing: {
        toggle: createCheckbox(
          this.canvasContainer,
          {
            name: "Free Draw: ",
            value: (this.drawing.toggle = false),
            onChange: (value) => {
              this.drawing.toggle = value;
              this.drawCtrlContainer.togglePopover();
              if (!this.warned) {
                this.warning.showPopover();
                this.warned = true;
              }
            },
          },
          "drawing"
        ),
        colour: createColourInput(
          this.drawCtrlContainer,
          {
            name: "Stroke Colour: ",
            value: (this.drawing.colour = "#ffffff"),
            onChange: (value) => {
              this.drawing.colour = value;
            },
          },
          "colour"
        ),
        width: createSlider(
          this.drawCtrlContainer,
          {
            name: "Stroke Width: ",
            min: 1,
            max: 10,
            value: (this.drawing.width = 3),
            onChange: (value) => {
              this.drawing.width = value;
            },
          },
          "width"
        ),
        precision: createSlider(
          this.drawCtrlContainer,
          {
            name: "Stroke Precision: ",
            min: 1,
            max: 30,
            value: (this.drawing.precision = 20),
            onChange: (value) => {
              this.drawing.precision = 30 - value;
            },
          },
          "precision"
        ),
      },
    };

    this.drawCtrlContainer.appendChild((this.warning = document.createElement("h1")));
    this.warning.popover = "auto";
    this.warning.innerHTML =
      "<h1>⚠️ BEWARE: drawing is laggy 😭</h1><p>Click anywhere to close...</p>";
    this.warning.className = "warning";

    this.drawCtrlContainer.appendChild(
      (this.inputs.drawing.reset = document.createElement("button"))
    );
    this.inputs.drawing.reset.textContent = "Clear Drawing";
    this.inputs.drawing.reset.className = "resetDrawing";
    this.inputs.drawing.reset.addEventListener("click", () => {
      this.clearCanvas();
      this.paths.length = 0;
      this.draw();
    });

    this.canvas.style.setProperty("background-color", "black");
    this.drawCtrlContainer.popover = "manual";

    const m = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left - this.hcw,
        y: e.clientY - rect.top - this.hch,
      };
    };
    const points = [];
    let mouseDown, pos1, pos2;
    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (mouseDown === true || this.drawing.toggle !== true) return;
      mouseDown = true;

      points.push((pos1 = m(e)));
    });
    this.canvas.addEventListener("mousemove", (e) => {
      pos2 = m(e);
      if (
        mouseDown !== true ||
        (pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2 < this.drawing.precision ** 2
      )
        return;

      points.push((pos1 = m(e)));

      this.draw();
      this.ctx.strokeStyle = this.drawing.colour;
      this.ctx.lineWidth = this.drawing.width;
      this.ctx.drawCurve(points);
    });
    this.canvas.addEventListener("mouseup", (e) => {
      if (mouseDown !== true) return;
      mouseDown = false;

      points.push(m(e));

      this.paths.push({
        path: this.ctx.drawCurve(points, 1, new Path2D()).p.toSVGString(),
        colour: this.drawing.colour,
        width: this.drawing.width,
      });

      this.draw();

      points.length = 0;
    });
  }

  draw() {
    this.clearCanvas();

    this.ctx.fillStyle = this.colour || "white";
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius || 10, 0, Math.PI * 2);
    this.ctx.fill();

    for (const { path, colour, width } of this.paths) {
      this.ctx.strokeStyle = colour;
      this.ctx.lineWidth = width;
      this.ctx.stroke(new Path2D(path));
    }
  }

  resize() {
    this.width = window.innerWidth * this.parentWidth;
    this.height = window.innerHeight * this.parentHeight;

    this.canvas.width = this.width * 0.8;
    this.canvas.height = this.height * 0.4;

    this.hcw = this.canvas.width / 2;
    this.hch = this.canvas.height / 2;

    this.ctx.setTransform(1, 0, 0, 1, this.hcw, this.hch);
    this.ctx.lineCap = "round";
    this.draw();
  }

  clearCanvas() {
    this.ctx.clearRect(-this.hcw, -this.hch, this.canvas.width, this.canvas.height);
  }
}
