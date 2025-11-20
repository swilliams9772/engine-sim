import { PHYSICS_CONSTANTS } from '../constants/physics';
import { ENGINE_SPECS } from '../constants/engine';

export type StrokePhase = 'Intake' | 'Compression' | 'Power' | 'Exhaust';

export const calculateOttoCycle = (cycleAngle: number, rpm: number) => {
  const { PISTON_ENGINE: PE, AIR } = PHYSICS_CONSTANTS;
  const { crankRadius: r_vis, rodLength: l_vis } = ENGINE_SPECS;

  // --- ADVANCED KINEMATICS ---
  const meanPistonSpeed = 2 * PE.STROKE * rpm / 60;

  // --- VOLUMETRIC EFFICIENCY (VE) MODEL ---
  const peakRpm = 4500;
  const veBase = 0.95; 
  const rpmNorm = rpm / peakRpm;
  let ve = veBase * (1 - 0.5 * Math.pow(rpmNorm - 1, 2));
  if (meanPistonSpeed > 20) ve *= 0.8; 
  ve = Math.max(0.2, Math.min(1.0, ve));

  // Air Mass
  const airFlow = (PE.DISPLACEMENT_CC * 1e-6) * (rpm / 60) * 0.5 * AIR.DENSITY_STP * ve * 1000; // g/s
  const V_DISP = PE.DISPLACEMENT_CC * 1e-6; 
  const V_CLEARANCE = V_DISP / (PE.COMPRESSION_RATIO - 1);
  const trappedMass = AIR.DENSITY_STP * V_DISP * ve; 

  // Phase
  let phase: StrokePhase = 'Intake';
  if (cycleAngle < Math.PI) phase = 'Intake';
  else if (cycleAngle < 2 * Math.PI) phase = 'Compression';
  else if (cycleAngle < 3 * Math.PI) phase = 'Power';
  else phase = 'Exhaust';

  // Kinematics
  const r = PE.STROKE / 2;
  const l = PE.CON_ROD;
  const sinT = Math.sin(cycleAngle);
  const cosT = Math.cos(cycleAngle);
  const lambda = r / l;
  
  // Visual Piston Y
  const termVis = l_vis * l_vis - r_vis * r_vis * sinT * sinT;
  const pistonY = r_vis * cosT + Math.sqrt(Math.max(0, termVis));

  // Real Physics Position (s from TDC)
  const pistonPosS = r * (1 - cosT) + l * (1 - Math.sqrt(1 - lambda * lambda * sinT * sinT));
  const currentVolM3 = V_CLEARANCE + (Math.PI * (PE.BORE / 2) ** 2 * pistonPosS);
  const currentVolCC = currentVolM3 * 1e6;

  // --- THERMODYNAMICS (NEXT LEVEL) ---
  let pressure = 101325;
  let temperature = 300;
  
  // Variable Gamma approximation (Gamma drops as T increases)
  // gamma = 1.4 - 7e-5 * T (rough linear approx for air)
  // We apply this iteratively or just at key points. 
  // For loop calculation we use mean Gamma.
  // const getGamma = (T: number) => 1.4 - (0.00007 * (T - 300));

  // WIEBE FUNCTION for Combustion (Mass Fraction Burned)
  // x_b = 1 - exp( -a * ((theta - theta_start) / delta_theta)^(m+1) )
  // a = 5 (efficiency parameter), m = 2 (shape), delta_theta = combustion duration
  const wiebe = (theta: number) => {
     const start = 2 * Math.PI - (20 * Math.PI / 180); // 20 deg BTDC
     const duration = 60 * Math.PI / 180; // 60 deg burn
     if (theta < start) return 0;
     if (theta > start + duration) return 1;
     
     const norm = (theta - start) / duration;
     return 1 - Math.exp(-5 * Math.pow(norm, 3));
  };

  if (phase === 'Intake') {
     const intakeLoss = (rpm * rpm) * 0.00005; 
     pressure = 101325 - intakeLoss;
     temperature = 300;
  } else if (phase === 'Compression') {
     const vStart = V_CLEARANCE + V_DISP;
     const cr = vStart / currentVolM3;
     const gammaAvg = 1.35; 
     pressure = 101325 * Math.pow(cr, gammaAvg);
     temperature = 300 * Math.pow(cr, gammaAvg - 1);
  } else if (phase === 'Power') {
     // Advanced Combustion
     // We model the process from BDC compression (180 deg / PI) to current angle
     // This creates a continuous P-V curve
     // However, calculating path dependent variable gamma in real-time analytic form is hard.
     // We stick to Otto cycle baseline but modulate P with Wiebe heat release.
     
     // Base Adiabatic Compression line (if no combustion)
     const vStart = V_CLEARANCE + V_DISP;
     const cr = vStart / currentVolM3;
     // const p_motoring = 101325 * Math.pow(cr, 1.32);
     const t_motoring = 300 * Math.pow(cr, 0.32);
     
     // Heat Energy addition
     const fuelMass = trappedMass / PE.AFR;
     const Q_total = fuelMass * PE.FUEL_HEATING_VALUE * PE.COMBUSTION_EFFICIENCY;
     
     // Current burn fraction
     // Cycle angle 0 = TDC Intake. 
     // Power stroke starts at 360 deg (2PI). 
     // But Wiebe runs across TDC (360).
     // Our cycleAngle is 0-720.
     // TDC Compression is 360 (2PI).
     
     const xb = wiebe(cycleAngle);
     
     // Pressure Rise from Combustion: dP approx proportional to dQ/V
     // Simplified: P_total = P_motoring + (P_combustion_rise * xb * (V_tdc / V_curr))
     // Ideal constant volume pressure rise at TDC:
     const cv = AIR.CV; // Assume constant CV for simplicity here
     // const deltaT_ideal = Q_total / (trappedMass * cv);
     // const T_peak_ideal = t_motoring + deltaT_ideal; // at TDC
     // const P_peak_ideal = p_motoring * (T_peak_ideal / t_motoring); // Ratio
     
     // Interpolate between motoring and fired state based on Wiebe
     // This is a rough approximation of the integral P = P_mot + integral(dQ)
     // Better: P = P_mot * (1 + (Q_released / (P_mot * V * Cv/(R))) ) ? 
     // Ideal Gas: PV = mRT. P = mRT/V.
     // T = T_motoring + (xb * Q_total) / (m * Cv)
     // P = m * R * T / V
     
     const T_current = t_motoring + (xb * Q_total) / (trappedMass * cv);
     pressure = (trappedMass * AIR.R * T_current) / currentVolM3;
     temperature = T_current;

  } else {
     pressure = 101325 + (rpm * 2);
     temperature = 800;
  }

  // Torque & Dynamics
  const area = Math.PI * (PE.BORE / 2) ** 2;
  const fGas = (pressure - 101325) * area;
  
  // Inertial Forces (F = ma)
  // a = r * w^2 * (cos(theta) + lambda * cos(2*theta))
  // Acceleration is away from crank center towards piston head (positive up?)
  // Position s is measured from TDC downwards? No, s=0 at TDC.
  // x = r cos theta + ... (from center).
  // accel = d2x/dt2.
  // F_inertia = - m_recip * accel.
  const massRecip = 0.4; // kg (piston + part of rod)
  const omega = rpm * 2 * Math.PI / 60;
  // const accel = r * omega * omega * (Math.cos(cycleAngle) + lambda * Math.cos(2 * cycleAngle));
  // const fInertia = -massRecip * accel; 
  // Note: At TDC (angle=0/360), cos=1. Accel is positive (upwards/outwards)?  
  // Wait, standard derivation: x is defined from crank center positive towards cylinder head.
  // x = r cos theta + l cos beta.
  // accel = -r w^2 (cos theta + ...)
  // So at TDC (theta=0), accel is negative (downwards/inwards). 
  // Force = - m a. So Force is Positive (pulling rod up).
  // Gas Force pushes down (opposing x).
  // Total Force on rod = F_gas (down) + F_inertia (up).
  // Let's define positive Force as pushing the piston DOWN (creating torque).
  // F_gas is positive.
  // F_inertia: At TDC, piston stops and reverses. It "pulls" up on the rod. So it opposes gas.
  // At BDC, piston stops and reverses up. It "pushes" down on rod. Adds to gas (or lack thereof).
  // So F_total = F_gas - F_inertia_force_upwards.
  // At TDC 360 (Firing): F_gas huge down. F_inertia pulls up.
  // Accel formula above gives positive at TDC? No, cos(0)=1. r*w^2 is positive magnitude.
  // If x is dist from center, accel is negative at TDC (max extension).
  // So if `accel` var is magnitude of deceleration?
  // Let's stick to: F_inertia_term = - m * r * w^2 * cos(theta).
  // At TDC (0), F = -mrw^2 (Up).
  // At 90, F = 0 approx.
  // At BDC (180), F = +mrw^2 (Down).
  
  const fInertiaLoad = -massRecip * r * omega * omega * (Math.cos(cycleAngle) + lambda * Math.cos(2 * cycleAngle));
  // This term is negative at TDC (pulling up), positive at BDC (pushing down).
  
  // Friction
  // const fFriction = 200 + (meanPistonSpeed * 50); 
  
  const sinBeta = lambda * sinT;
  const cosBeta = Math.sqrt(1 - sinBeta * sinBeta);
  const geomFactor = sinT + (lambda * sinT * cosT) / cosBeta;
  
  // Torque is Force * Moment Arm
  // F_down is positive.
  // const fPiston = fGas + fInertiaLoad - (Math.sign(meanPistonSpeed)*fFriction); // Friction opposes motion?
  // Simplified friction just subtracts from torque power generally
  
  let torque = (fGas + fInertiaLoad) * r * geomFactor;
  if (phase === 'Compression' || phase === 'Exhaust') torque -= 5; // Pumping/Friction constant drag

  return {
    phase,
    pistonY,
    pressure: pressure / 100000, // Bar
    temperature,
    volume: currentVolCC,
    torque,
    metrics: {
      ve,
      airFlow,
      meanPistonSpeed,
      fuelFlow: airFlow / PE.AFR 
    }
  };
};
