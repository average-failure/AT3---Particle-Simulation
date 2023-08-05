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
    max_radius: 10,
    min_radius: 5,
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
    mouse_collision_radius: 40,
    gravity: 9.81,
    dt: 0.1,
    coefficient_of_restitution: 0.95,
    drag: 0.999,
  },
  toggles: {
    gravity: true,
    coefficient_of_restitution: true,
    drag: false,
    show_velocity: false,
  },
};
