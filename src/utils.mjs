export const randHex = (mix, mixEffect = 2) => {
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

  return `#${((1 << 24) | (colour[0] << 16) | (colour[1] << 8) | colour[2])
    .toString(16)
    .slice(1)}`;
};

export const randInt = (max, offset = 0) =>
  Math.floor(Math.random() * max) + offset;

export const randRangeInt = (max, min = 0) =>
  Math.floor(Math.random() * (max - min)) + min;

export const randRange = (max, min = 0, round) =>
  (Math.random() * (max - min) + min).toFixed(round);

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
