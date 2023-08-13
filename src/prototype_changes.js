if (CanvasRenderingContext2D != undefined) {
  CanvasRenderingContext2D.prototype.drawCurve = function (points, tension, path) {
    const p = path instanceof Path2D ? path : new Path2D();

    p.moveTo(points[0].x, points[0].y);

    const t = Number.isFinite(tension) ? tension : 1;

    const segments = [];

    for (let i = 0, len = points.length; i < len - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[0];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i != points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + ((p2.x - p0.x) / 6) * t;
      const cp1y = p1.y + ((p2.y - p0.y) / 6) * t;

      const cp2x = p2.x - ((p3.x - p1.x) / 6) * t;
      const cp2y = p2.y - ((p3.y - p1.y) / 6) * t;

      p.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);

      segments.push([p0, { x: cp1x, y: cp1y }, { x: cp2x, y: cp2y }, p2]);
    }

    this.stroke(p);

    return { p, segments };
  };
}
