import * as PARTICLES from "./particles.mjs";
import * as OBJECTS from "./objects.mjs";

export const sliders = {
  input: [
    {
      gravity: {
        min: -50,
        max: 50,
        value: 9.8,
        step: 0.1,
        name: "Gravity",
      },
    },
    { dt: { value: 0.1, step: 0.01, name: "Time" } },
    {
      coefficient_of_restitution: {
        min: 0.25,
        value: 0.95,
        step: 0.01,
        name: "COR",
      },
    },
    { drag: { min: 0.9, value: 0.999, step: 0.001, name: "Drag" } },
    {
      softening_constant: {
        value: 0.15,
        step: 0.01,
        name: "Softening Constant",
      },
    },
    { attraction_radius: { value: 0.1, name: "Attraction Radius" } },
    {
      attraction_strength: {
        max: 100,
        step: 1,
        name: "Attraction Strength",
      },
    },
    { repulsion_radius: { name: "Repulsion Radius" } },
    {
      repulsion_strength: {
        max: 200,
        step: 1,
        name: "Repulsion Strength",
      },
    },
    {
      flow_size: {
        min: 5,
        max: 50,
        value: 10,
        step: 1,
        name: "Flow Size",
      },
    },
  ],
};

export const toggles = {
  change: [
    { gravity: { value: "checked", name: "Gravity" } },
    { coefficient_of_restitution: { value: "checked", name: "COR" } },
    { drag: { name: "Drag" } },
    { show_velocity: { name: "Velocity" } },
    {
      softening_constant: { value: "checked", name: "Softening Constant" },
    },
  ],
};

export const dropdowns = {
  mouse_mode: {
    name: "Mouse Mode",
    children: ["New Particle", "New Object", "Multi Particle"],
  },
  particle_type: {
    name: "Particle Type",
    children: ["Random", ...Object.keys(PARTICLES)],
    value: "Particle",
  },
  object_type: {
    name: "Object Type",
    children: [...Object.keys(OBJECTS), "FlowControl"],
    value: "Rectangle",
  },
};

export const buttons = {
  reset: {
    content: "Reset Simulation",
    callback: function () {
      for (const element of ["particleCount", "objectCount"]) {
        this[element] = 0;
        this.domElements.stats[element].textContent = 0;
      }
    },
  },
};
