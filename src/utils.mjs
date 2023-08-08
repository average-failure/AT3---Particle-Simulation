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
      elem = Math.floor(
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
      name,
      onChange,
    } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
  container.classList.add("sliderContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Slider" class="sliderLabel">${name}</label>
      <input id="${id}Slider" class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" />
      <div class="sliderValue">${value}</div>
    `;
  else
    container.innerHTML = `
      <div class="sliderLabel">${name}</div>
      <input class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" />
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
  const { value, name } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
  container.classList.add("checkboxContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Checkbox" class="checkboxLabel">${name}</label>
      <input id="${id}Checkbox" class="checkbox" type="checkbox" ${value} />
    `;
  else
    container.innerHTML = `
      <div class="checkboxLabel">${name}</div>
      <input class="checkbox" type="checkbox" ${value} />
    `;
  parentElement.appendChild(container);

  return container.querySelector(id ? `#${id}Checkbox` : ".checkbox");
};

/**
 * Creates an input element of type select as a child of the given parent
 * @param {String} parentSelector A string containing a css selector for the parent element
 * @param {Object} options An object containing options for the dropdown
 * @param {String} id The id of the select element
 * @returns The select element
 */
export const createSelect = (parentSelector, options, id) => {
  const { value, name, children } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
  container.classList.add("selectContainer");
  container.classList.add("container");

  if (id)
    container.innerHTML = `
      <label for="${id}Select" class="selectLabel">${name}</label>
      <select id="${id}Select" class="select"></select>
    `;
  else
    container.innerHTML = `
      <div class="selectLabel">${name}</div>
      <select class="select"></select>
    `;

  const element = container.querySelector(id ? `#${id}Select` : ".select");

  for (const child of children || []) element.options.add(new Option(child));

  if (value) element.value = value;

  parentElement.appendChild(container);

  return element;
};
