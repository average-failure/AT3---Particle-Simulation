import { DOMHandler } from "./simulation_main";

class SimulationMain extends DOMHandler {
  constructor(preview) {
    super(preview);

    this.#initWorker();

    this.onResize();
    addEventListener("resize", this.onResize.bind(this));

    this.methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
  }

  /**
   * Handles the response to receiving messages from the worker thread
   * @param {MessageEvent} param0 A message event sent from the worker
   */
  #onMessage({ data: message }) {
    for (const method of this.methods.filter((method) =>
      Object.keys(message).includes(method)
    ))
      this[method](message[method]);
  }

  updateParticleCount(count) {
    this.domElements.stats.particleCount.textContent = count;
  }

  updateObjectCount(count) {
    this.domElements.stats.objectCount.textContent = count;
  }

  updateFps(fps) {
    this.domElements.stats.workerFps.textContent = fps;
  }

  #initWorker() {
    this.initCanvas();

    this.worker = new Worker("src/simulation_worker/canvas_worker", { type: "module" });
    this.worker.onmessage = this.#onMessage.bind(this);

    if (!this.canvas.transferControlToOffscreen) {
      alert("Your browser does not support offscreenCanvas");
      return;
    }

    const offscreen = this.canvas.transferControlToOffscreen(),
      envOffscreen = this.envCanvas.transferControlToOffscreen();

    this.worker.postMessage({ addCanvas: [offscreen, envOffscreen] }, [
      offscreen,
      envOffscreen,
    ]);
  }

  onResize() {
    super.onResize();

    this.messageWorker({
      resizeCanvas: [window.innerWidth, window.innerHeight],
    });
  }

  messageWorker(message) {
    this.worker.postMessage(message);
  }

  newParticle(particle, type) {
    this.messageWorker({ newParticle: [particle, type] });
  }

  newObject(object, type) {
    this.messageWorker({ newObject: [object, type] });
  }

  deleteParticle(x, y, type) {
    this.messageWorker({ removeParticle: [[x, y, type]] });
  }

  deleteObject(x, y, type) {
    this.messageWorker({ deleteObject: [[x, y], type] });
  }

  dispose() {
    super.dispose();
    this.worker.terminate();
    document.body.outerHTML = document.body.outerHTML;
  }
}

// Really scuffed code I made at the end because I was running out of time :/
{
  let preview = new SimulationMain(true);
  preview.messageWorker({ animate: true });
  const populateParticles = () => {
    for (let i = 0, len = 100 * Math.random() + 1; i < len; ++i)
      preview.newParticle({
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 0.5) * 300,
      });
  };
  populateParticles();
  {
    let playing = true;
    {
      let a = 0;
      const playIdle = () => {
        if (playing) requestAnimationFrame(playIdle);
        else return;
        if (a % 1800 === 0) {
          preview.reset();
          populateParticles();
        }
        if (a++ % ~~(Math.random() * 50) !== 0) return;

        for (let i = 0, len = ~~(Math.random() * 5); i < len; ++i) {
          preview.newParticle({
            vx: (Math.random() - 0.5) * 300,
            vy: (Math.random() - 0.5) * 300,
          });
          if (Math.random() < 0.3) preview.deleteParticle();
        }

        if (Math.random() < 0.3) preview.newObject();
        if (Math.random() < 0.03) preview.deleteObject();
      };
      playIdle();
    }
    {
      const welcome = document.getElementById("welcome");
      welcome.popover = "manual";
      welcome.showPopover();
      welcome.addEventListener("toggle", (e) => {
        if (e.newState !== "open") {
          playing = false;
          preview.dispose();
          preview = null;
          new SimulationMain().messageWorker({ animate: true });
          document.getElementById("tutorial").style.setProperty("display", "block");
        }
      });
      document.body.addEventListener(
        "click",
        () => {
          welcome.hidePopover();
        },
        { once: true }
      );
    }
  }
  {
    let count = 0;
    let done = false;

    const handler = (text) => {
      const tutorial = document.getElementById("tutorial");
      if (done) {
        document.removeEventListener("click", click);
        document.removeEventListener("mousedown", down);
        document.removeEventListener("mouseup", up);
        document.removeEventListener("keypress", skip);
        tutorial.style.setProperty("font-size", 0);
        const close = tutorial.querySelector("p");
        if (close) close.style.setProperty("font-size", 0);
        tutorial.addEventListener(
          "transitionend",
          function () {
            this.remove();
          },
          { once: true }
        );
        return;
      }
      if (!text) return;
      tutorial.style.setProperty("font-size", `${10 / Math.cbrt(text.length)}vmin`);
      tutorial.innerHTML = text;
      count++;
    };
    const click = () => {
      let text;
      switch (count) {
        case 0:
          text =
            "Left click anywhere to spawn your first particle!<p>(Press enter to skip the tutorial)</p>";
          break;
        case 1:
          text = "Nice!";
          setTimeout(click, 800);
          break;
        case 2:
          text = "Hold right click to open the menu...";
          break;
        case 5:
          text = "Now open the menu again...";
          break;
        case 8:
          text = "Go down the menus until the end...";
          break;
        case 9:
          text =
            "Nah just kidding! Click outside of the menu to reset the simulation if you don't want to go through all the menus.";
          break;
        case 10:
          text =
            "And see those arrows on the sides of your screen? Click them to open the simulation settings.";
          break;
        case 11:
          text = "Here is where you change the general settings of the simulation.";
          break;
        case 12:
          text = "Alright! I'll leave you to explore the rest on your own!";
          break;
        case 13:
          done = true;
          break;
        default:
          break;
      }
      handler(text);
    };
    const down = () => {
      let text;
      switch (count) {
        case 3:
          text = "Release the mouse button over the option you want to select...";
          break;
        case 6:
          text = "And select reset.";
          break;
        default:
          break;
      }
      handler(text);
    };
    const up = () => {
      let text;
      switch (count) {
        case 4:
          text = "And if there is a submenu, just click the option you want!";
          break;
        case 7:
          text = "You see all the options? Pick any one of them.";
          break;
        default:
          break;
      }
      handler(text);
    };
    const skip = (e) => {
      if (e.key !== "Enter" || preview) return;
      done = true;
      handler();
    };
    document.addEventListener("click", click);
    document.addEventListener("mousedown", down);
    document.addEventListener("mouseup", up);
    document.addEventListener("keypress", skip);
  }
}
{
  document
    .querySelector(".settings.right")
    .style.setProperty(
      "transform",
      `translate(${
        getComputedStyle(document.querySelector(".settings.right > .inner-settings"))
          .width
      })`
    );
  document
    .querySelector(".settings.left")
    .style.setProperty(
      "transform",
      `translate(${-parseInt(
        getComputedStyle(document.querySelector(".settings.left > .inner-settings"))
          .width,
        10
      )}px)`
    );
}
