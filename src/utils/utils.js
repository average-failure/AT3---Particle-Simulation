/**
 * Generates a random colour
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in RGB format
 */
const randColour = (mix, mixEffect = 2) => {
  const colour = [randRangeInt(256), randRangeInt(256), randRangeInt(256)];

  if (mix)
    colour.forEach((elem, idx) => {
      colour[idx] = ~~(
        (elem +
          ((mix instanceof Array ? mix : Object.values(mix))[idx] || elem) * mixEffect) /
        (mixEffect + 1)
      );
    });

  return colour;
};

/**
 * Generates a random hex colour code
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in hexadecimal format
 */
export const randHex = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  return `#${((1 << 24) | (colour[0] << 16) | (colour[1] << 8) | colour[2])
    .toString(16)
    .slice(1)}`;
};

/**
 * Generates a random integer between two provided numbers
 * @param {Number} max The maximum number
 * @param {Number} min The minimum number
 * @returns A random integer between max and min
 */
export const randRangeInt = (max, min = 0) => ~~(Math.random() * (max - min) + min);

/**
 * Generates a random number biased to a given number
 * @param {Number} max The maximum number
 * @param {Number} min The minimum number
 * @param {Number} bias The number that the random is biased to
 * @param {Number} strength The strength of the bias (a number between zero and one)
 * @param {Number} round The number of decimals to round to
 * @returns A random number biased towards the provided bias
 */
export const randBias = (max, min = 0, bias = 0, strength = 1, round) => {
  const mix = Math.random() * strength;
  return Number(
    ((Math.random() * (max - min) + min) * (1 - mix) + bias * mix).toFixed(round)
  );
};

/**
 * Generates a random coordinate inside a given circle
 * @param {Number} x The x coordinate of the center of the circle
 * @param {Number} y The y coordinate of the center of the circle
 * @param {Number} maxR The max radius of the circle
 * @param {Number} minR The minimum radius of the circle
 * @returns A random coordinate within the circle provided
 */
export const randCircle = (x, y, maxR, minR = 0) => {
  const angle = Math.random() * 2 * Math.PI,
    hyp = Math.random() * (maxR - minR) + minR;
  return [x + Math.cos(angle) * hyp, y + Math.sin(angle) * hyp];
};

/**
 * Creates an input element of type range as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the slider
 * @param {String} id The id of the slider element
 * @returns The slider element
 */
export const createSlider = (parentSelector, options, id) => {
  const {
      min = 0,
      max = 1,
      value = (min + max) / 2,
      step = 0.1,
      name = "",
      onChange,
      optionals = "",
      hr,
      unit,
    } = options || {},
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("slider-container");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      ${name ? `<label for="${id}-slider" class="slider-label">${name}</label>` : ""}
      <input id="${id}-slider" class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <input type="number" class="slider-value" min="${min}" max="${max}" value="${value}" step="${step}" />
      ${unit ? `<p>${unit}</p>` : ""}
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="slider-label">${name}</div>` : ""}
      <input class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <input type="number" class="slider-value" min="${min}" max="${max}" value="${value}" step="${step}" />
      ${unit ? `<p>${unit}</p>` : ""}
    `;
  parentElement.appendChild(container);
  if (hr) parentElement.appendChild(document.createElement("hr"));

  const slider = container.querySelector(".slider"),
    sliderValue = container.querySelector(".slider-value");

  slider.addEventListener("input", function () {
    sliderValue.value = this.value;
    onChange?.(this.value);
  });

  sliderValue.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter") this.blur();
  });

  sliderValue.addEventListener("input", function (e) {
    if (e.key !== "Backspace" && e.key !== "Delete") {
      if (this.value > max) this.value = max;
      else if (this.value < min) this.value = min;
    }

    slider.value = this.value;
    onChange?.(this.value);
  });

  return { slider, sliderValue };
};

/**
 * Creates a text input element as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the input
 * @param {String} id The id of the input element
 * @returns The input element
 */
export const createTextInput = (parentSelector, options = {}, id) => {
  const parentElement =
    typeof parentSelector === "string"
      ? document.querySelector(parentSelector)
      : parentSelector;

  const container = document.createElement("div");
  container.classList.add("input-container");
  container.classList.add("container");

  const { name, units, onChange, type, max, min } = options;

  let allowedOptions = ["value", "placeholder"];
  if (type?.toLowerCase() === "number") allowedOptions.push("min", "max", "step");

  let text = "";
  for (const [key, value] of Object.entries(options).filter(([o]) =>
    allowedOptions.includes(o)
  )) {
    text += ` ${key}="${value}"`;
  }

  if (id)
    container.innerHTML = `
      ${name ? `<label for="${id}-input" class="input-label">${name}</label>` : ""}
      <input id="${id}-input" class="text-input" type="number" ${text} />
      ${units ? `<div class="units">${units}</div>` : ""}
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="input-label">${name}</div>` : ""}
      <input class="text-input" type="number" ${text} />
      ${units ? `<div class="units">${units}</div>` : ""}
    `;

  parentElement.appendChild(container);

  const input = container.querySelector(".text-input");

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Enter") this.blur();
  });

  if (type === "number" && (max || min))
    input.addEventListener("input", function (e) {
      if (e.key !== "Backspace" && e.key !== "Delete") {
        if (this.value > max) this.value = max;
        else if (this.value < min) this.value = min;
      }

      onChange?.(this.value);
    });
  else if (onChange)
    input.addEventListener("input", function () {
      onChange(this.value);
    });

  return input;
};

/**
 * Creates a colour picker element as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the colour picker
 * @param {String} id The id of the colour picker element
 * @returns The colour picker element
 */
export const createColourInput = (parentSelector, options = {}, id) => {
  const parentElement =
    typeof parentSelector === "string"
      ? document.querySelector(parentSelector)
      : parentSelector;

  const container = document.createElement("div");
  container.classList.add("colour-container");
  container.classList.add("container");

  const onChange = options.onChange;

  const { name, value } = options;

  if (id)
    container.innerHTML = `
      ${name ? `<label for="${id}-input" class="colour-label">${name}</label>` : ""}
      <input id="${id}-input" class="colour-input" type="color" value="${
      value || "#000000"
    }" />
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="colour-label">${name}</div>` : ""}
      <input class="colour-input" type="color" value="${value || "#000000"}"/>
    `;
  parentElement.appendChild(container);

  const input = container.querySelector(".colour-input");
  if (onChange)
    input.addEventListener("input", function () {
      onChange(this.value);
    });

  return input;
};

/**
 * Creates an input element of type checkbox as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the checkbox
 * @param {String} id The id of the checkbox element
 * @returns The checkbox element
 */
export const createCheckbox = (parentSelector, options, id) => {
  const { value, name, optionals = "", onChange, hr } = options,
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("checkbox-container");
  container.classList.add("container");

  container.innerHTML = `
    <div class="toggle-container">
      <div class="toggle">
        <input id="${id}-checkbox" name="${id}-checkbox" class="checkbox check-checkbox" type="checkbox" ${
    value === true ? "checked" : ""
  } ${optionals} />
        <label class="check-label" for="${id}-checkbox">
          <div class="background"></div>
          <span class="face">
            <span class="face-container">
              <span class="eye left"></span>
              <span class="eye right"></span>
              <span class="mouth"></span>
            </span>
          </span>
        </label>
      </div>
    </div>
    ${name ? `<label for="${id}-checkbox" class="checkbox-label">${name}</label>` : ""}
    `;
  parentElement.appendChild(container);
  if (hr) parentElement.appendChild(document.createElement("hr"));

  const checkbox = container.querySelector(".checkbox");
  if (onChange)
    checkbox.addEventListener("change", function () {
      onChange(this.checked);
    });

  return { checkbox, container: container.querySelector(".toggle-container") };
};

export const detectCircleCollision = (c1, c2, threshold) => {
  const dx = c1.x - c2.x,
    dy = c1.y - c2.y;
  const dSq = dx * dx + dy * dy;

  const r = c1.r + c2.r * threshold;

  return dSq <= r * r;
};

export const circleCollision = (c1, c2, mode, cor) => {
  const dx = c1.x - c2.x,
    dy = c1.y - c2.y;
  const dSq = dx * dx + dy * dy;

  const r = c1.r + c2.r;

  if (!(dSq <= r * r)) return false;

  const d = Math.sqrt(dSq);

  const angle = Math.atan2(dy, dx);

  switch (mode) {
    case "this":
      c1.x = c2.x + r * Math.cos(angle);
      c1.y = c2.y + r * Math.sin(angle);
      break;
    case "other":
      c2.x = c1.x - r * Math.cos(angle);
      c2.y = c1.y - r * Math.sin(angle);
      break;
    case "both":
      const temp = [c1.x, c1.y];

      c1.x = c2.x + r * Math.cos(angle);
      c1.y = c2.y + r * Math.sin(angle);

      c2.x = temp[0] - r * Math.cos(angle);
      c2.y = temp[1] - r * Math.sin(angle);
      break;
    default:
      break;
  }

  const nvx = Number.isFinite(dx / d) ? dx / d : 0,
    nvy = Number.isFinite(dy / d) ? dy / d : 0;

  const rvx = (Number.isFinite(c2.vx) ? c2.vx : 0) - (Number.isFinite(c1.vx) ? c1.vx : 0),
    rvy = (Number.isFinite(c2.vy) ? c2.vy : 0) - (Number.isFinite(c1.vy) ? c1.vy : 0);

  const speed = (rvx * nvx + rvy * nvy) * cor;

  if (speed <= 0) return false;

  return { nvx, nvy, speed };
};

export class FPS {
  constructor(outputElement) {
    this.output = outputElement || {};
  }

  start(filter = 10, updateSpeed = 10, callback = () => {}) {
    let then = performance.now(),
      frameTime = 0,
      count = 0;
    this.stopped = false;
    this.loop(filter, updateSpeed, then, frameTime, count, callback);
  }

  stop() {
    this.stopped = true;
  }

  loop(filter, updateSpeed, then, frameTime, count, callback) {
    const now = performance.now();
    frameTime += (now - then - frameTime) / filter;
    then = now;
    if (count++ % updateSpeed === 0)
      callback((this.output.textContent = (1000 / frameTime).toFixed(1)));
    if (this.stopped === true) return;
    requestAnimationFrame(() => {
      this.loop(filter, updateSpeed, then, frameTime, count, callback);
    });
  }
}

export const complementaryHSLColour = (h, s, l) => {
  if (typeof h === "string")
    [h, s, l] = h.substring(4).split(")")[0].split(",").map(parseFloat);

  h += 180;
  if (h > 360) h -= 360;

  return `hsl(${h},${s}%,${100 - l}%)`;
};

export const hslToHex = (h, s, l) => {
  if (typeof h === "string")
    [h, s, l] = h.substring(4).split(")")[0].split(",").map(parseFloat);

  // Converts hsl to hex... the name is self explanatory and idk how this works
  // icl7126 @ https://stackoverflow.com/a/44134328
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
