const randColour = (mix, mixEffect = 2) => {
  const colour = [randInt(256), randInt(256), randInt(256)];

  if (mix)
    colour.forEach((elem, idx) => {
      elem = Math.floor(
        (elem +
          ((mix instanceof Array ? mix : Object.values(mix))[idx] || elem) *
            mixEffect) /
          (mixEffect + 1)
      );
    });

  return colour;
};

export const randHex = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  return `#${((1 << 24) | (colour[0] << 16) | (colour[1] << 8) | colour[2])
    .toString(16)
    .slice(1)}`;
};

export const randRGB = (mix, mixEffect) => {
  const colour = randColour(mix, mixEffect);

  return `rgb(${colour[0]},${colour[1]},${colour[2]})`;
};

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

export const randInt = (max, offset = 0) => ~~(Math.random() * max) + offset;

export const randRangeInt = (max, min = 0) =>
  ~~(Math.random() * (max - min)) + min;

export const randRange = (max, min = 0, round) =>
  Number((Math.random() * (max - min) + min).toFixed(round));

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

// Waits for conditionFunction to be true
// Lightbeard @ https://stackoverflow.com/a/52652681
export const waitFor = (conditionFunction) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise(poll);
};

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
  if (id)
    container.innerHTML = `
      <label for="${id}Slider" class="sliderLabel">${name}</label>
      <input id="${id}Slider" class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" />
    `;
  else
    container.innerHTML = `
      <div class="sliderLabel">${name}</div>
      <input class="slider" type="range" min="${min}" max="${max}" value="${value}" step="${step}" />
    `;
  parentElement.appendChild(container);

  if (!onChange) return;

  const slider = parentElement.querySelector(".slider"),
    change = (event) => {
      const value = event.target.value;
      onChange(value * step);
    };
  slider.addEventListener("input", change);
  slider.addEventListener("change", change);
};

export const createCheckbox = (parentSelector, options, id) => {
  const { value, name } = options,
    parentElement = document.querySelector(parentSelector);

  const container = document.createElement("div");
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
};
