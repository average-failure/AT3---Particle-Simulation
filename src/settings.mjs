export const settings = {
  /**
   * Returns a radius based on the given mass and the mass radius ratio
   * @param {number} mass
   * @returns radius
   */
  radius(mass) {
    return ~~(mass / this.constants.mass_radius_ratio);
  },
  constants: {
    cell_size: 15, // * need to find what is the optimal cell size
    max_radius: 20,
    min_radius: 3,
    get max_mass() {
      delete this.max_mass;
      this.max_mass = this.max_radius * this.mass_radius_ratio;
      return this.max_mass;
    },
    get min_mass() {
      delete this.min_mass;
      this.min_mass = this.min_radius * this.mass_radius_ratio;
      return this.min_mass;
    },
    mass_radius_ratio: 10,
  },
  variables: {
    /* mouse_collision_radius: 100,
    get mouse_collision_mass() {
      return this.mouse_collision_radius * this.mouse_mass_radius_ratio;
    },
    mouse_mass_radius_ratio: 10,
    mouse_collision_velocity: 0.01, */
    gravity: 9.8,
    softening_constant: 0.15,
    attraction_radius: 0.1,
    attraction_strength: 50,
    repulsion_radius: 0.5,
    repulsion_strength: 100,
    dt: 0.1,
    coefficient_of_restitution: 0.99,
    drag: 0.999,
    flow_size: 10,
    flow_strength: 3,
  },
  toggles: {
    gravity: true,
    softening_constant: true,
    coefficient_of_restitution: true,
    drag: false,
    show_velocity: false,
    animated_environment: false,
  },
  pause: false,
};
