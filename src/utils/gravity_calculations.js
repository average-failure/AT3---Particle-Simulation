function gravity(mode, p1, p2, strength, settings, blackHole) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y;
  const dSq = dx * dx + dy * dy;

  const f =
    ((p1.strength *
      2.5 *
      settings.variables[mode < 0 ? "repulsion_strength" : "attraction_strength"]) /
      (dSq *
        Math.sqrt(
          dSq +
            (settings.toggles.softening_constant
              ? settings.variables.softening_constant
              : 0)
        ))) *
    (Number.isFinite(strength) ? strength : 1);

  const max = mode < 0 ? 300 : 100;

  let a = blackHole ? f / 300 : f / p2.mass;

  if (a > max) a = max;

  return { dx, dy, a };
}

export function attract(p1, p2, settings, strength, blackHole, threshold) {
  const { dx, dy, a } = gravity(1, p1, p2, strength, settings, blackHole);

  if (
    dx * dx + dy * dy < (p1.r * (threshold || 0.1)) ** 2 &&
    blackHole === true &&
    p2.immortal <= 0
  )
    return "EXPLODE";

  const immortal = p2.immortal > 0 ? p2.immortal : 1;

  p2.vx += (a * dx * settings.variables.dt) / immortal;
  p2.vy += (a * dy * settings.variables.dt) / immortal;
}

export function repulse(p1, p2, settings, strength) {
  const { dx, dy, a } = gravity(-1, p1, p2, strength, settings);

  const immortal = p2.immortal > 0 ? p2.immortal : 1;

  p2.vx -= (a * dx * settings.variables.dt) / immortal;
  p2.vy -= (a * dy * settings.variables.dt) / immortal;
}
