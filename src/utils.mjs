/**
 * Generates a random colour
 * @param {Array} mix An array containing r, g, and b values to mix with the random colour
 * @param {Number} mixEffect How much the provided mix affects the random colour
 * @returns An random colour in RGB format
 */
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

/**
 * Returns a promise that resolves on an event
 * @param {EventTarget} item The item to attach the event listener to
 * @param {String} event A string containing the event to listen to
 * @returns A promise that will resolve when the listener is triggered
 */
// Get a Promise from an event...
// Claude @ https://stackoverflow.com/a/70789108
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
export const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
};

/**
 * Fades a given element in or out
 * @param {Element} element The element to fade in or out
 * @param {String} type Either in or out
 */
export const fadeInOut = (element, type) => {
  const cStyle = getComputedStyle(element),
    style = element.style;
  let count;
  if (type === "in" && cStyle.visibility === "hidden") {
    count = 0;
    style.visibility = "visible";
    const fadeIn = () => {
      style.opacity = count;
      count += 0.1;
      if (count < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);
  } else if (type === "out" && cStyle.visibility === "visible") {
    count = 1;
    let fadeDone;
    const fadeOut = () => {
      style.opacity = count;
      count -= 0.1;
      if (count > 0) requestAnimationFrame(fadeOut);
      else fadeDone = true;
    };
    requestAnimationFrame(fadeOut);
    waitFor(() => fadeDone).then(() => (style.visibility = "hidden"));
  }
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
    } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
  container.classList.add("sliderContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Slider" class="sliderLabel">${name}</label>
      <input id="${id}Slider" class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <div class="sliderValue">${value}</div>
    `;
  else
    container.innerHTML = `
      <div class="sliderLabel">${name}</div>
      <input class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" ${optionals} />
      <div class="sliderValue">${value}</div>
    `;
  parentElement.appendChild(container);

  const slider = container.querySelector(".slider"),
    sliderValue = container.querySelector(".sliderValue"),
    change = function () {
      sliderValue.textContent = this.value;
      onChange?.(this.value);
    };
  slider.addEventListener("input", change);
  slider.addEventListener("change", change);

  return container.querySelector(id ? `#${id}Slider` : ".slider");
};

/**
 * Creates an input element of type checkbox as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the checkbox
 * @param {String} id The id of the checkbox element
 * @returns The checkbox element
 */
export const createCheckbox = (parentSelector, options, id) => {
  const { value = "", name = "", optionals = "" } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
  container.classList.add("checkboxContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Checkbox" class="checkboxLabel">${name}</label>
      <input id="${id}Checkbox" class="checkbox" type="checkbox" ${
      value === true ? "checked" : ""
    } ${optionals} />
    `;
  else
    container.innerHTML = `
      <div class="checkboxLabel">${name}</div>
      <input class="checkbox" type="checkbox" ${
        value === true ? "checked" : ""
      } ${optionals} />
    `;
  parentElement.appendChild(container);

  return container.querySelector(id ? `#${id}Checkbox` : ".checkbox");
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
    parentElement = document.querySelector(parentSelector);

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
    parentElement = document.querySelector(parentSelector);

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

export const initRectShape = (x, y, w, h) => {
  const defaultSize = 50;
  const threshold = 25;

  if (!w || Math.abs(w) < threshold) {
    w = defaultSize;
    x -= w / 2;
  }

  if (!h || Math.abs(h) < threshold) {
    h = defaultSize;
    y -= h / 2;
  }

  if (w < 0) {
    x += w;
    w = Math.abs(w);
  }

  if (h < 0) {
    y += h;
    h = Math.abs(h);
  }

  return { x, y, w, h, measurements: new Int16Array([w / 2, h / 2]) };
};

export const circleCollision = (c1, c2, mode, cor) => {
  const dx = c1.x - c2.x,
    dy = c1.y - c2.y;
  const dSq = dx ** 2 + dy ** 2;

  const r = c1.r + c2.r;

  if (!(dSq <= r * r)) return false;

  const d = Math.sqrt(dSq);

  const angle = Math.atan2(dy, dx);

  switch (mode) {
    case "none":
      break;
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

  if (speed < 0) return false;

  return { nvx, nvy, speed };
};
