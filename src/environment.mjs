export class Environment {
  constructor(id, settings, { x, y }) {
    if (!Number.isInteger(id)) throw "Error: Id not provided.";
    if (!(Number.isInteger(x) && Number.isInteger(y)))
      throw "Error: Position not provided.";
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
}
