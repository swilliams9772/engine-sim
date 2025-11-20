export const PHYSICS_CONSTANTS = {
  // Standard Air Properties
  AIR: {
    GAMMA: 1.35, // Polytropic index for real engines (losses included)
    R: 287, // Gas constant J/(kg·K)
    CV: 718, // Heat capacity at constant volume
    DENSITY_STP: 1.225, // kg/m^3
  },

  // 2.0L Inline-4 Engine Specs (Reference: Modern Turbo 2.0L)
  PISTON_ENGINE: {
    BORE: 0.086, // 86mm
    STROKE: 0.086, // 86mm
    CON_ROD: 0.145, // 145mm
    COMPRESSION_RATIO: 10.5,
    DISPLACEMENT_CC: 499.5, // Per cylinder
    // Combustion
    AFR: 14.7, // Air Fuel Ratio
    FUEL_HEATING_VALUE: 44e6, // Gasoline J/kg
    COMBUSTION_EFFICIENCY: 0.90,
    // Timing
    INTAKE_OPEN: -10, // BTDC
    INTAKE_CLOSE: 230, // ATDC
    EXHAUST_OPEN: 490, // ATDC
    EXHAUST_CLOSE: 10, // ATDC (Overlap)
  },

  // Tesla Model 3 Rear Motor Specs (Approx)
  ELECTRIC_MOTOR: {
    POLE_PAIRS: 3,
    KV: 0.035, // V/(rad/s) back EMF constant
    FLUX_LINKAGE: 0.05, // Webers
    RS: 0.007, // Stator Resistance (Ohm)
    LD: 0.000150, // D-axis Inductance (H)
    LQ: 0.000350, // Q-axis Inductance (H) - IPM motor saliency
    MAX_CURRENT: 800, // Amps
    DC_BUS_VOLTAGE: 400, // Volts
  }
};

