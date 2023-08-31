import { settings } from "./settings";

const { variables: v, toggles: t } = settings;

export const sliders = [
  {
    setting: "gravity",
    options: {
      min: -50,
      max: 50,
      value: v.gravity,
      step: 0.1,
      name: "Gravity",
    },
  },
  { setting: "dt", options: { value: v.dt, step: 0.01, name: "Time" } },
  {
    setting: "coefficient_of_restitution",
    options: {
      min: 0.25,
      value: v.coefficient_of_restitution,
      step: 0.01,
      name: "COR",
    },
  },
  { setting: "drag", options: { min: 0.9, value: v.drag, step: 0.001, name: "Drag" } },
  {
    setting: "softening_constant",
    options: {
      value: v.softening_constant,
      step: 0.01,
      name: "Softening Constant",
    },
  },
  {
    setting: "attraction_radius",
    options: { value: v.attraction_radius, name: "Attraction Radius" },
  },
  {
    setting: "attraction_strength",
    options: {
      max: 100,
      value: v.attraction_strength,
      step: 1,
      name: "Attraction Strength",
    },
  },
  {
    setting: "repulsion_radius",
    options: { value: v.repulsion_radius, name: "Repulsion Radius" },
  },
  {
    setting: "repulsion_strength",
    options: {
      max: 200,
      value: v.repulsion_strength,
      step: 1,
      name: "Repulsion Strength",
    },
  },
  {
    setting: "flow_size",
    options: {
      min: 5,
      max: 50,
      value: v.flow_size,
      step: 1,
      name: "Flow Size",
    },
  },
  {
    setting: "flow_strength",
    options: {
      min: 0.1,
      max: 10,
      value: v.flow_strength,
      name: "Flow Strength",
    },
  },
];

export const toggles = {
  change: [
    { gravity: { value: t.gravity, name: "Gravity" } },
    { coefficient_of_restitution: { value: t.coefficient_of_restitution, name: "COR" } },
    { drag: { value: t.drag, name: "Drag" } },
    { lifespan: { value: t.lifespan, name: "Particle Decay" } },
    { show_velocity: { value: t.show_velocity, name: "Velocity" } },
    { show_mass: { value: t.show_mass, name: "Show Mass" } },
    { show_lifespan: { value: t.show_lifespan, name: "Show Lifespan" } },
    {
      softening_constant: { value: t.softening_constant, name: "Softening Constant" },
    },
    {
      animated_environment: {
        value: t.animated_environment,
        name: "Animated Environment",
      },
    },
    {
      dynamic_font_colour: {
        value: t.dynamic_font_colour,
        name: "Dynamic Font Colour",
      },
    },
  ],
};
