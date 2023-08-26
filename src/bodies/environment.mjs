export class Environment {
  constructor(id, settings, { x, y } = {}) {
    if (!settings) throw "Error: Settings not provided.";
    this.id = id;
    this.settings = settings;
    this.x = x;
    this.y = y;
  }

  static getClassName() {
    return "Environment";
  }

  getClassName() {
    return Environment.getClassName();
  }

  dispose() {
    for (const prop of Object.keys(this)) delete this[prop];
  }
}
