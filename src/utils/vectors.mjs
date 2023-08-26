export class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
  }

  addVectors(v1, v2) {
    this.x = v1.x + v2.x;
    this.y = v1.y + v2.y;
  }

  addScalar(s) {
    this.x += s;
    this.y += s;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
  }

  subVectors(v1, v2) {
    this.x = v1.x - v2.x;
    this.y = v1.y - v2.y;
  }

  subScalar(s) {
    this.x -= s;
    this.y -= s;
  }

  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;
  }

  multiplyVectors(v1, v2) {
    this.x = v1.x * v2.x;
    this.y = v1.y * v2.y;
  }

  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
  }

  divide(v) {
    this.x /= v.x;
    this.y /= v.y;
  }

  divideVectors(v1, v2) {
    this.x = v1.x / v2.x;
    this.y = v1.y / v2.y;
  }

  divideScalar(s) {
    this.x /= s;
    this.y /= s;
  }

  powerOf(v) {
    this.x **= v.x;
    this.y **= v.y;
  }

  powerOfVectors(v1, v2) {
    this.x = v1.x ** v2.x;
    this.y = v1.y ** v2.y;
  }

  powerOfScalar(s) {
    this.x **= s;
    this.y **= s;
  }

  get lengthSq() {
    return this.x ** 2 + this.y ** 2;
  }

  get length() {
    return Math.sqrt(this.lengthSq);
  }

  normalise() {
    const len = this.length;
    if (len === 0) throw "Error: Origin vector cannot be normalised.";
    this.divideScalar(len);
    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  angleBetweenRad(v) {
    return Math.acos(this.dot(v));
  }

  angleBetweenDeg(v) {
    return Math.acos(this.dot(v)) * (180 / Math.PI);
  }

  xDist(v) {
    return this.x - v.x;
  }

  yDist(v) {
    return this.y - v.y;
  }

  distanceBetweenSq(v) {
    return this.xDist(v) ** 2 + this.yDist(v) ** 2;
  }

  distanceBetween(v) {
    return Math.sqrt(this.distanceBetweenSq(v));
  }

  getNormal() {
    return new Vector2(-this.y, this.x);
  }

  projectOn(axis) {
    return this.dot(axis.normalise());
  }
}
