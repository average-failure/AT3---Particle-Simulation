function gravity(mode, p1, p2, settings) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y;
  const dSq = dx * dx + dy * dy;

  let f =
    (p1.strength *
      2.5 *
      settings.variables[mode < 0 ? "repulsion_strength" : "attraction_strength"]) /
    (dSq *
      Math.sqrt(
        dSq +
          (settings.toggles.softening_constant
            ? settings.variables.softening_constant
            : 0)
      ));

  const max = mode < 0 ? 300 : 100;
  if (f > max) f = max;

  return { dx, dy, f };
}

export function attract(p1, p2, settings, blackHole, threshold) {
  if (p2.immortal === true) return;

  const { dx, dy, f } = gravity(1, p1, p2, settings);

  if (dx * dx + dy * dy < (p1.r * (threshold || 0.1)) ** 2 && blackHole === true)
    return "EXPLODE";

  p2.vx += f * dx * settings.variables.dt;
  p2.vy += f * dy * settings.variables.dt;
}

export function repulse(p1, p2, settings) {
  const { dx, dy, f } = gravity(-1, p1, p2, settings);

  p2.vx -= f * dx * settings.variables.dt;
  p2.vy -= f * dy * settings.variables.dt;
}
