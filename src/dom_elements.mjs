import * as PARTICLES from "./particles.mjs";
import * as OBJECTS from "./objects.mjs";
import { settings } from "./settings.mjs";

const { variables: v, toggles: t } = settings;

export const sliders = {
  input: [
    {
      gravity: {
        min: -50,
        max: 50,
        value: v.gravity,
        step: 0.1,
        name: "Gravity",
      },
    },
    { dt: { value: v.dt, step: 0.01, name: "Time" } },
    {
      coefficient_of_restitution: {
        min: 0.25,
        value: v.coefficient_of_restitution,
        step: 0.01,
        name: "COR",
      },
    },
    { drag: { min: 0.9, value: v.drag, step: 0.001, name: "Drag" } },
    {
      softening_constant: {
        value: v.softening_constant,
        step: 0.01,
        name: "Softening Constant",
      },
    },
    { attraction_radius: { value: v.attraction_radius, name: "Attraction Radius" } },
    {
      attraction_strength: {
        max: 100,
        value: v.attraction_strength,
        step: 1,
        name: "Attraction Strength",
      },
    },
    { repulsion_radius: { value: v.repulsion_radius, name: "Repulsion Radius" } },
    {
      repulsion_strength: {
        max: 200,
        value: v.repulsion_strength,
        step: 1,
        name: "Repulsion Strength",
      },
    },
    {
      flow_size: {
        min: 5,
        max: 50,
        value: v.flow_size,
        step: 1,
        name: "Flow Size",
      },
    },
    {
      flow_strength: {
        min: 0.1,
        max: 10,
        value: v.flow_strength,
        name: "Flow Strength",
      },
    },
  ],
};

export const toggles = {
  change: [
    { gravity: { value: t.gravity, name: "Gravity" } },
    { coefficient_of_restitution: { value: t.coefficient_of_restitution, name: "COR" } },
    { drag: { value: t.drag, name: "Drag" } },
    { show_velocity: { value: t.show_velocity, name: "Velocity" } },
    {
      softening_constant: { value: t.softening_constant, name: "Softening Constant" },
    },
    {
      animated_environment: {
        value: t.animated_environment,
        name: "Animated Environment",
      },
    },
  ],
};

export const dropdowns = {
  mouse_mode: {
    name: "Mouse Mode",
    children: ["New Particle", "New Object", "Multi Particle", "Change Well Force"],
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
  pause: {
    content: "Pause Simulation",
    callback: function () {
      this.pause();
    },
  },
};
