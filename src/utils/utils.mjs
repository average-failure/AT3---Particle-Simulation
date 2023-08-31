/**
 * Generates a random colour
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in RGB format
 */
// * UNUSED
const randColour = (mix, mixEffect = 2) => {
  const colour = [randInt(256), randInt(256), randInt(256)];

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
// * UNUSED
export const randHex = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  return `#${((1 << 24) | (colour[0] << 16) | (colour[1] << 8) | colour[2])
    .toString(16)
    .slice(1)}`;
};

/**
 * Generates a random rgb colour
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in css rgb format
 */
// * UNUSED
export const randRGB = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  return `rgb(${colour[0]},${colour[1]},${colour[2]})`;
};

/**
 * Generates a random hsl colour
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in hsl format
 */
// * UNUSED
export const randHSL = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  // Convert rgb to hsl
  // Crashalot @ https://stackoverflow.com/a/58426404

  // Scale r, g, b into a ratio
  let r = (colour[0] /= 255),
    g = (colour[1] /= 255),
    b = (colour[2] /= 255);

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  // Calculate hue
  // No difference
  if (delta == 0) h = 0;
  // Red is max
  else if (cmax == r) h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g) h = (b - r) / delta + 2;
  // Blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `hsl(${h},${s}%,${l}%)`;
};

/**
 * Generates a random integer
 * @param {Number} max The maximum number to generate
 * @param {Number} offset The amount to offset the random number by
 * @returns A random integer
 */
// * UNUSED
export const randInt = (max, offset = 0) => ~~(Math.random() * max) + offset;

/**
 * Generates a random integer between two provided numbers
 * @param {Number} max The maximum number
 * @param {Number} min The minimum number
 * @returns A random integer between max and min
 */
export const randRangeInt = (max, min = 0) => ~~(Math.random() * (max - min) + min);

/**
 * Generates a random number between two provided numbers
 * @param {Number} max The maximum number
 * @param {Number} min The minimum number
 * @param {Number} round The number of decimals to round to
 * @returns A random number rounded to round between max and min
 */
// * UNUSED
export const randRange = (max, min = 0, round) =>
  Number((Math.random() * (max - min) + min).toFixed(round));

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
 * Generates a random integer biased to a given number
 * @param {Number} max The maximum number
 * @param {Number} min The minimum number
 * @param {Number} bias The number that the random is biased to
 * @param {Number} strength The strength of the bias
 * @returns A random integer biased towards the provided bias
 */
// * UNUSED
export const randBiasInt = (max, min = 0, bias = 0, strength = 1) => {
  const mix = Math.random() * strength;
  return ~~((Math.random() * (max - min) + min) * (1 - mix) + bias * mix);
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

// * UNUSED
export const randBool = () => Math.random() < 0.5;

/**
 * Returns a promise that resolves on an event
 * @param {EventTarget} item The item to attach the event listener to
 * @param {String} event A string containing the event to listen to
 * @returns A promise that will resolve when the listener is triggered
 */
// Get a Promise from an event...
// Claude @ https://stackoverflow.com/a/70789108
// * UNUSED
export const getPromiseFromEvent = (item, event) =>
  new Promise((resolve) => {
    const listener = () => {
      item.removeEventListener(event, listener);
      resolve();
    };
    item.addEventListener(event, listener);
  });

/**
 * Waits for a given function to return true
 * @param {Function} conditionFunction The function to wait for to be true
 * @returns A promise that resolves when conditionFunction is true
 */
// Waits for conditionFunction to be true
// Lightbeard @ https://stackoverflow.com/a/52652681
// * UNUSED
export const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
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
    } = options || {},
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("sliderContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Slider" class="sliderLabel">${name}</label>
      <input id="${id}Slider" class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <input type="number" class="sliderValue" min="${min}" max="${max}" value="${value}" step="${step}" />
    `;
  else
    container.innerHTML = `
      <div class="sliderLabel">${name}</div>
      <input class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <input type="number" class="sliderValue" min="${min}" max="${max}" value="${value}" step="${step}" />
    `;
  parentElement.appendChild(container);

  const slider = container.querySelector(".slider"),
    sliderValue = container.querySelector(".sliderValue");

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

  return slider;
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
  container.classList.add("inputContainer");
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
      ${name ? `<label for="${id}Input" class="inputLabel">${name}</label>` : ""}
      <input id="${id}Input" class="textInput" type="number" ${text} />
      ${units ? `<div class="units">${units}</div>` : ""}
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="inputLabel">${name}</div>` : ""}
      <input class="textInput" type="number" ${text} />
      ${units ? `<div class="units">${units}</div>` : ""}
    `;

  parentElement.appendChild(container);

  const input = container.querySelector(".textInput");

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
  container.classList.add("colourContainer");
  container.classList.add("container");

  const onChange = options.onChange;

  const { name, value } = options;

  if (id)
    container.innerHTML = `
      ${name ? `<label for="${id}Input" class="colourLabel">${name}</label>` : ""}
      <input id="${id}Input" class="colourInput" type="color" value="${
      value || "#000000"
    }" />
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="colourLabel">${name}</div>` : ""}
      <input class="colourInput" type="color" value="${value || "#000000"}"/>
    `;
  parentElement.appendChild(container);

  const input = container.querySelector(".colourInput");
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
  const { value, name, optionals = "", onChange } = options,
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("checkboxContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      ${name ? `<label for="${id}Checkbox" class="checkboxLabel">${name}</label>` : ""}
      <input id="${id}Checkbox" class="checkbox" type="checkbox" ${
      value === true ? "checked" : ""
    } ${optionals} />
    `;
  else
    container.innerHTML = `
      ${name ? `<div class="checkboxLabel">${name}</div>` : ""}
      <input class="checkbox" type="checkbox" ${
        value === true ? "checked" : ""
      } ${optionals} />
    `;
  parentElement.appendChild(container);

  const checkbox = container.querySelector(".checkbox");
  if (onChange)
    checkbox.addEventListener("change", function () {
      onChange(this.checked);
    });

  return checkbox;
};

/**
 * Creates a select element as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the dropdown
 * @param {String} id The id of the select element
 * @returns The select element
 */
export const createSelect = (parentSelector, options, id) => {
  const { value, name = "", children = [], optionals = "" } = options,
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("selectContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Select" class="selectLabel">${name}</label>
      <select id="${id}Select" class="select" ${optionals}></select>
    `;
  else
    container.innerHTML = `
      <div class="selectLabel">${name}</div>
      <select class="select" ${optionals}></select>
    `;

  const element = container.querySelector(id ? `#${id}Select` : ".select");

  for (const child of children) element.options.add(new Option(child));

  if (value) element.value = value;

  parentElement.appendChild(container);

  return element;
};

/**
 * Creates a button as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the dropdown
 * @param {String} id The id of the button element
 * @returns The button element
 */
export const createButton = (parentSelector, options, id) => {
  const { optionals = "", name = "", content = "" } = options,
    parentElement =
      typeof parentSelector === "string"
        ? document.querySelector(parentSelector)
        : parentSelector;

  const container = document.createElement("div");
  container.classList.add("buttonContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Button" class="buttonLabel">${name}</label>
      <button id="${id}Button" class="button" ${optionals}>${content}</button>
    `;
  else
    container.innerHTML = `
      <div class="selectLabel">${name}</div>
      <button class="button" ${optionals}>${content}</button>
    `;

  parentElement.appendChild(container);

  return container.querySelector(id ? `#${id}Button` : ".button");
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
      // TODO: do this properly
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

// * UNUSED
export const complementaryHexColour = (hex) => {
  // Deekshant Kumar @ https://stackoverflow.com/a/67425060

  let r = hex.length == 4 ? parseInt(hex[1] + hex[1], 16) : parseInt(hex.slice(1, 3), 16);
  let g = hex.length == 4 ? parseInt(hex[2] + hex[2], 16) : parseInt(hex.slice(3, 5), 16);
  let b = hex.length == 4 ? parseInt(hex[3] + hex[3], 16) : parseInt(hex.slice(5), 16);

  [r, g, b] = complementaryRGBColour(r, g, b);

  return (
    "#" +
    (r < 16 ? "0" + r.toString(16) : r.toString(16)) +
    (g < 16 ? "0" + g.toString(16) : g.toString(16)) +
    (b < 16 ? "0" + b.toString(16) : b.toString(16))
  );
};

// * UNUSED
export const complementaryRGBColour = (r, g, b) => {
  // Deekshant Kumar @ https://stackoverflow.com/a/67425060

  if (Math.max(r, g, b) == Math.min(r, g, b)) {
    return [255 - r, 255 - g, 255 - b];
  } else {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min;
    let h,
      l = (max + min) / 2,
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = Math.round(h * 60 + 180) % 360;
    h /= 360;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
};

export const complementaryHSLColour = (h, s, l) => {
  if (typeof h === "string")
    [h, s, l] = h.substring(4).split(")")[0].split(",").map(parseFloat);

  h += 180;
  if (h > 360) h -= 360;

  return `hsl(${h},${s}%,${100 - l}%)`;
};

// * UNUSED
export const test = (testFn, outerIterations = 10, innerIterations = 10000, ...args) => {
  if (typeof testFn !== "function") return;
  let previousTime = performance.now(),
    totalTime = 0;
  for (let n = 0; n < outerIterations; ++n) {
    previousTime = performance.now();
    for (let i = 0; i < innerIterations; ++i) testFn(...args);
    totalTime += performance.now() - previousTime;
  }
  return totalTime / outerIterations;
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

export class ListenerHandler {
  constructor() {
    this.handlers = {};
  }

  addListener(node, event, handler, capture = false) {
    if (!(event in this.handlers)) this.handlers[event] = [];

    this.handlers[event].push({ node, handler, capture });
    node.addEventListener(event, handler, capture);
  }

  removeListeners(targetNode, event) {
    for (const { node, handler, capture } of this.handlers[event].filter(
      ({ node }) => node === targetNode
    )) {
      node.removeEventListener(event, handler, capture);
    }

    this.handlers[event] = this.handlers[event].filter(({ node }) => node !== targetNode);
  }

  removeAllListeners() {
    for (const [event, value] of Object.entries(this.handlers)) {
      for (const { node, handler, capture } of value) {
        node.removeEventListener(event, handler, capture);
      }
    }

    this.handlers = {};
  }
}
