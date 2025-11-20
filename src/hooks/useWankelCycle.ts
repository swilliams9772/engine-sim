import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PHYSICS_CONSTANTS } from '../constants/physics';

export interface RotaryState {
  angle: number; // Output shaft angle (0-1080 for full thermodynamic cycle of one face)
  rotorAngle: number; // Rotor spins 1/3 speed of shaft
  chamberVolumes: [number, number, number]; // Volumes of the 3 faces
  phases: [string, string, string]; // Phase for each face
  pressure: number; // Main face pressure
  temperature: number;
  torque: number;
  volume: number; // Main face volume
}

export const useWankelCycle = (rpm: number, isPaused: boolean = false, manualAngle?: number) => {
  const angleRef = useRef(0);
  const [state, setState] = useState<RotaryState>({
    angle: 0,
    rotorAngle: 0,
    chamberVolumes: [1, 1, 1],
    phases: ['Intake', 'Exhaust', 'Power'],
    pressure: 1,
    temperature: 300,
    torque: 0,
    volume: 500
  });
  
  const { AIR } = PHYSICS_CONSTANTS;
  // Wankel Constants
  const R = 0.10; // Generating Radius (m)
  const e = 0.015; // Eccentricity (m)
  const width = 0.07; // Housing width (m)
  // const V_MAX = Math.sqrt(3) * 3 * e * R * width * 1e6; 
  // Actually Wankel displacement is simpler: V_swept = 3 * sqrt(3) * e * R * width
  // For simulation, let's match the Piston engine displacement approx
  const V_DISP = 654; // 1.3L 2-rotor = ~654cc per rotor chamber
  const V_MIN = V_DISP / 9; // 9.0 compression ratio
  
  useFrame((_, delta) => {
    if (isPaused && manualAngle !== undefined) {
      angleRef.current = manualAngle;
    } else if (!isPaused) {
      const angularVelocity = (rpm * 2 * Math.PI) / 60;
      angleRef.current += angularVelocity * delta;
    }

    const shaftAngle = angleRef.current;
    const rotorAngle = shaftAngle / 3;
    
    // Calculate Thermodynamics for Face 1 (The tracking face)
    // Cycle is 1080 shaft degrees (3 turns)
    const cycleAngle = ((shaftAngle % (3 * 2 * Math.PI)) + 6 * Math.PI) % (6 * Math.PI);
    // const normCycle = cycleAngle / (3 * 2 * Math.PI); 
    
    // Simplified Volume function for Wankel (Sine wave approx)
    // V = V_min + 0.5 * (V_max - V_min) * (1 - cos(2/3 * theta)) ?
    // Actually quite complex. Let's approximate with sinusoidal based on phase.
    // Intake (0-270), Comp (270-540), Power (540-810), Exhaust (810-1080)
    
    let phase = 'Intake';
    let progress = 0; // 0-1 within phase
    
    if (cycleAngle < 1.5 * Math.PI) { // 0 - 270 deg (4.71 rad)
        phase = 'Intake';
        progress = cycleAngle / (1.5 * Math.PI);
    } else if (cycleAngle < 3 * Math.PI) { // 270 - 540 deg
        phase = 'Compression';
        progress = (cycleAngle - 1.5 * Math.PI) / (1.5 * Math.PI);
    } else if (cycleAngle < 4.5 * Math.PI) { // 540 - 810 deg
        phase = 'Power';
        progress = (cycleAngle - 3 * Math.PI) / (1.5 * Math.PI);
    } else { // 810 - 1080 deg
        phase = 'Exhaust';
        progress = (cycleAngle - 4.5 * Math.PI) / (1.5 * Math.PI);
    }
    
    // Volume Curve approximation
    // Intake: V increases min->max
    // Comp: V decreases max->min
    // Power: V increases min->max
    // Exhaust: V decreases max->min
    let currentVol = 0;
    if (phase === 'Intake' || phase === 'Power') {
        currentVol = V_MIN + (V_DISP) * (0.5 - 0.5 * Math.cos(progress * Math.PI));
    } else {
        currentVol = V_MIN + (V_DISP) * (0.5 + 0.5 * Math.cos(progress * Math.PI));
    }
    
    // Thermodynamics (Reused logic from Otto for consistency)
    let pressure = 101325;
    let temperature = 300;
    
    if (phase === 'Intake') {
        pressure = 101325;
    } else if (phase === 'Compression') {
        const vStart = V_MIN + V_DISP;
        pressure = 101325 * Math.pow(vStart / (currentVol * 1e-6), AIR.GAMMA);
        temperature = 300 * Math.pow(vStart / (currentVol * 1e-6), AIR.GAMMA - 1);
    } else if (phase === 'Power') {
      // Heat addition at start
      // const vStart = V_MIN + V_DISP; 
      // T2 (end of comp)
      const T2 = 300 * Math.pow(9.0, AIR.GAMMA - 1); // 9.0 CR
      const T3 = T2 + 1800; // Heat add
      const P3 = 101325 * Math.pow(9.0, AIR.GAMMA) * (T3 / T2);
      
      const expansionRatio = (currentVol * 1e-6) / (V_MIN * 1e-6);
        pressure = P3 * Math.pow(1 / expansionRatio, AIR.GAMMA);
        temperature = T3 * Math.pow(1 / expansionRatio, AIR.GAMMA - 1);
    } else {
        pressure = 101325 * 1.1; // slight backpressure
        temperature = 900;
    }
    
    // Torque (Simplified, proportional to pressure * eccentricity * sin(angle))
    // Wankel torque is very flat.
    const area = width * R; // rough area
    const fGas = (pressure - 101325) * area;
    // Torque arm varies. Max torque at 90 deg of shaft rotation in power phase?
    // Peak torque roughly middle of power phase.
    const torqueFactor = phase === 'Power' ? Math.sin(progress * Math.PI) : (phase === 'Compression' ? -0.5 * Math.sin(progress * Math.PI) : 0);
    const torque = fGas * e * torqueFactor * 3; // 3 faces contribute? No, calculated for one.

    setState({
      angle: shaftAngle,
      rotorAngle,
      chamberVolumes: [1, 1, 1],
      phases: [phase, 'Unknown', 'Unknown'],
      pressure: pressure / 100000,
      temperature,
      torque,
      volume: currentVol
    });
  });

  return state;
};
