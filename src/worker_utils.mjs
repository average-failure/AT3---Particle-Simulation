export class QueryableWorker {
  #worker;
  #id;
  #onResult;
  constructor(url, id) {
    this.#worker = new Worker(url, { type: "module" });
    this.#id = id;
    this.listeners = {};
    this.#onResult = null;
    this.#worker.onmessage = (event) => this.#onMessage(event.data);
    this.#worker.onerror = () => console.error("Something went wrong :/");
  }

  get id() {
    return this.#id;
  }

  #onMessage = (message) => {
    if (
      message instanceof Object &&
      message.hasOwnProperty("listener") &&
      message.hasOwnProperty("args")
    )
      this.listeners[message.listener]?.apply(this, message.args);
    else console.error(message);

    const onResult = this.#onResult;
    this.#onResult = null;
    onResult?.(message);
  };

  postMessage = (message, transfer) =>
    this.#worker.postMessage(message, transfer);

  terminate = () => this.#worker.terminate();

  addListener = (name, listener) => (this.listeners[name] = listener);

  removeListener = (name) => delete this.listeners[name];

  sendQuery = (onResult, method, ...args) => {
    this.#onResult = onResult;
    this.postMessage({ method, args });
  };

  sendCanvas = (canvas) => {
    if (!canvas.transferControlToOffscreen) {
      alert("Your browser does not support offscreenCanvas");
      return;
    }
    document.body.appendChild(canvas);
    const offscreen = canvas.transferControlToOffscreen();
    this.postMessage({ canvas: offscreen }, [offscreen]);
  };

  sendId = () => this.postMessage({ id: this.#id });
}

export class WorkerPool {
  #pool;
  #free;
  #busy;
  #queue;
  #cvs;
  constructor(size, url, { canvas } = {}) {
    this.#pool = [...Array(size)].map(
      (elem, id) => new QueryableWorker(url, id)
    );
    this.#free = [...this.#pool];
    this.#busy = {};
    this.#queue = [];
    this.#sendId();
    if (canvas) this.#cvs = this.#sendCanvas();
  }

  get length() {
    return this.#pool.length;
  }

  get isBusy() {
    return this.#queue.length > 0 || Object.keys(this.#busy).length > 0;
  }

  get canvases() {
    if (!this.#cvs) this.#cvs = this.#sendCanvas();
    return this.#cvs;
  }

  queueQuery = (onResult, method, ...args) => {
    this.#queue.push([onResult, method, args]);
    this.#updateQueue();
  };

  #updateQueue = () => {
    while (this.#free.length > 0 && this.#queue.length > 0) {
      const worker = this.#free.pop();
      this.#busy[worker.id] = worker;

      const [onResult, method, args] = this.#queue.shift();

      worker.sendQuery(
        (result) => {
          delete this.#busy[worker.id];
          this.#free.push(worker);
          onResult?.(result);
          this.#updateQueue();
        },
        method,
        ...args
      );
    }
  };

  terminate = () => {
    for (const worker of this.#pool) worker.terminate();
  };

  addListener = (name, listener) => {
    for (const worker of this.#pool) worker.addListener(name, listener);
  };

  addListeners = (...listeners) => {
    for (const listener of listeners) {
      this.addListener(...listener);
    }
  };

  removeListener = (...names) => {
    for (const name of names)
      for (const worker of this.#pool) worker.removeListener(name);
  };

  #sendCanvas = () => {
    const cvs = [];
    for (const worker of this.#pool) {
      const canvas = document.createElement("canvas");
      cvs.push(canvas);
      worker.sendCanvas(canvas);
    }
    return cvs;
  };

  #sendId = () => {
    for (const worker of this.#pool) worker.sendId();
  };
}

export class WorkerCode {
  #queryableFunctions;
  #canvas;
  #ctx;
  #id;
  constructor() {
    this.#queryableFunctions = {};
  }

  get functions() {
    return this.#queryableFunctions;
  }

  get canvas() {
    return this.#canvas;
  }

  get ctx() {
    return this.#ctx;
  }

  onMessage = (message) => {
    if (
      message instanceof Object &&
      message.hasOwnProperty("method") &&
      message.hasOwnProperty("args")
    )
      this.#queryableFunctions[message.method]?.apply(this, message.args);
    else if (message.hasOwnProperty("canvas")) {
      this.#canvas = message.canvas;
      this.#ctx = this.#canvas.getContext("2d", { alpha: false });
    }
    if (message.hasOwnProperty("id")) this.#id = message.id;
  };

  reply = (listener, ...args) => {
    postMessage({ listener, args: [{ id: this.#id }, ...args] });
  };

  addFunction = (name, fn) => {
    this.#queryableFunctions[name] = fn;
  };

  addFunctions = (...fns) => {
    for (const fn of fns) {
      this.addFunction(...fn);
    }
  };
}
