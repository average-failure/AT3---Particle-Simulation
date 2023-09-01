export const settings = {
  constants: {
    get cell_size() {
      delete this.cell_size;
      this.cell_size = (this.max_radius - this.min_radius) / 2;
      return this.cell_size;
    },
    max_radius: 100,
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
    get max_random_mass() {
      delete this.max_random_mass;
      this.max_random_mass = this.max_mass / 4;
      return this.max_random_mass;
    },
    get max_random_radius() {
      delete this.max_random_radius;
      this.max_random_radius = this.max_radius / 4;
      return this.max_random_radius;
    },
    mass_radius_ratio: 10,
  },
  variables: {
    gravity: 9.8,
    softening_constant: 0.15,
    attraction_radius: 0.1,
    attraction_strength: 50,
    repulsion_radius: 0.5,
    repulsion_strength: 100,
    get dt() {
      return this.time_factor / 1000;
    },
    time_factor: 100,
    get coefficient_of_restitution() {
      return this.collision_elasticity / 100;
    },
    collision_elasticity: 95,
    drag: 3,
    flow_size: 10,
    flow_strength: 3,
  },
  toggles: {
    gravity: true,
    softening_constant: true,
    coefficient_of_restitution: true,
    drag: false,
    lifespan: true,
    show_velocity: false,
    show_mass: false,
    show_lifespan: false,
    animated_environment: false,
    dynamic_font_colour: true,
  },
  pause: false,
};
