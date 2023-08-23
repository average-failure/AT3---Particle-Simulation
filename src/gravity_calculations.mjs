function gravity(mode, p1, p2, strength, settings) {
  const dx = p1.x - p2.x,
    dy = p1.y - p2.y;
  const dSq = dx * dx + dy * dy;

  let f =
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
  if (f > max) f = max;

  return { dx, dy, f };
}

export function attract(p1, p2, settings, strength, blackHole, threshold) {
  const { dx, dy, f } = gravity(1, p1, p2, strength, settings);

  if (
    dx * dx + dy * dy < (p1.r * (threshold || 0.1)) ** 2 &&
    blackHole === true &&
    p2.immortal <= 0
  )
    return "EXPLODE";

  const immortal = p2.immortal > 0 ? p2.immortal : 1;

  p2.vx += (f * dx * settings.variables.dt) / immortal;
  p2.vy += (f * dy * settings.variables.dt) / immortal;
}

export function repulse(p1, p2, settings, strength) {
  const { dx, dy, f } = gravity(-1, p1, p2, strength, settings);

  const immortal = p2.immortal > 0 ? p2.immortal : 1;

  p2.vx -= (f * dx * settings.variables.dt) / immortal;
  p2.vy -= (f * dy * settings.variables.dt) / immortal;
}
