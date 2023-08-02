export const settings = {
  cell_size: 15,
  max_radius: 50,
  get max_mass() {
    return this.max_radius * 10;
  },
  radius(mass) {
    return mass / this.mass_radius_ratio;
  },
  mass_radius_ratio: 10,
  gravity: 9.8,
  dt: 0.1,
  drag: 0.9999,
};
