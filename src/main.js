class CanvasWrapper {
  constructor() {
    this.#initCanvas();
    this.#initWorker();

    this.#onResize();
    addEventListener("resize", this.#onResize.bind(this));

    /* this.canvas.addEventListener("mousemove", (event) =>
      this.messageWorker({
        mouseCollision: {
          mx: event.clientX,
          my: event.clientY,
          bounds: this.canvas.getBoundingClientRect(),
        },
      })
    ); */

    this.canvas.addEventListener("mousedown", (event) => {
      const bounds = this.canvas.getBoundingClientRect();
      this.newParticle({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
    });
  }

  #initCanvas() {
    const canvas = document.getElementById("canvas");
    canvas
      ? (this.canvas = canvas)
      : document.body.appendChild(
          (this.canvas = document.createElement("canvas"))
        );

    this.#resizeCanvas();
  }

  #initWorker() {
    this.worker = new Worker("src/canvas_worker.js", { type: "module" });

    if (!this.canvas.transferControlToOffscreen) {
      alert("Your browser does not support offscreenCanvas");
      return;
    }

    const offscreen = this.canvas.transferControlToOffscreen();
    this.worker.postMessage({ addCanvas: offscreen }, [offscreen]);
  }

  #resizeCanvas() {
    const pixelRatio = window.devicePixelRatio;
    this.width = this.canvas.width = (this.canvas.clientWidth * pixelRatio) | 0;
    this.height = this.canvas.height =
      (this.canvas.clientHeight * pixelRatio) | 0;
  }

  #onResize() {
    const pixelRatio = window.devicePixelRatio,
      width = (this.canvas.clientWidth * pixelRatio) | 0,
      height = (this.canvas.clientHeight * pixelRatio) | 0;
    this.messageWorker({ resizeCanvas: { width, height } });
  }

  messageWorker(message) {
    this.worker.postMessage(message);
  }

  newParticle(particle) {
    this.messageWorker({ newParticle: particle });
  }
}

const wrapper = new CanvasWrapper();
console.log(wrapper);

for (let i = 0; i < 100; ++i) wrapper.newParticle();

/* for (let x = 0; x < wrapper.width; x += 36)
  for (let y = 0; y < wrapper.height; y += 36)
    wrapper.messageWorker({ newParticle: { x, y, radius: 3 } }); */

wrapper.messageWorker({ animate: true });
