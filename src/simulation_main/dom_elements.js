import { settings } from "../settings";

const { variables: v, toggles: t } = settings;

export const sliders = [
  {
    setting: "gravity",
    options: {
      min: -50,
      max: 50,
      value: v.gravity,
      step: 0.1,
      unit: "ms<sup>-2</sup>",
      name: "Gravity",
    },
  },
  {
    setting: "collision_elasticity",
    options: {
      min: 0,
      max: 100,
      value: v.collision_elasticity,
      step: 1,
      unit: "%",
      name: "Collision Elasticity",
    },
  },
  {
    setting: "drag",
    options: { min: 0, max: 25, value: v.drag, step: 1, unit: "%", name: "Drag" },
  },
  {
    setting: "softening_constant",
    options: {
      value: v.softening_constant,
      step: 0.01,
      name: "Softening Constant",
    },
  },
  {
    setting: "time_factor",
    options: {
      value: v.time_factor,
      min: 1,
      max: 500,
      step: 1,
      unit: "%",
      name: "Simulation Speed",
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
      unit: "px",
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

export const toggles = [
  { setting: "gravity", options: { value: t.gravity, name: "Gravity" } },
  {
    setting: "collision_elasticity",
    options: { value: t.collision_elasticity, name: "Collision Elasticity" },
  },
  { setting: "drag", options: { value: t.drag, name: "Drag" } },
  {
    setting: "softening_constant",
    options: { value: t.softening_constant, name: "Softening Constant" },
  },
  { setting: "lifespan", options: { value: t.lifespan, name: "Particle Decay" } },
  {
    setting: "show_velocity",
    options: { value: t.show_velocity, name: "Velocity Lines" },
  },
  { setting: "show_mass", options: { value: t.show_mass, name: "Show Mass" } },
  {
    setting: "show_lifespan",
    options: { value: t.show_lifespan, name: "Show Lifespan" },
  },
  {
    setting: "animated_environment",
    options: {
      value: t.animated_environment,
      name: "Animated Environment",
    },
  },
  {
    setting: "dynamic_font_colour",
    options: {
      value: t.dynamic_font_colour,
      name: "Dynamic Font Colour",
    },
  },
];
