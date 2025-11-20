import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PHYSICS_CONSTANTS } from '../constants/physics';

export interface ElectricMotorState {
  angle: number;        
  phaseCurrents: [number, number, number]; 
  magneticFieldAngle: number; 
  backEMF: number;      
  torque: number;       
  power: number;        
  efficiency: number;
  temperature: number; 
  id: number; 
  iq: number; 
  fluxVector: [number, number, number]; 
}

export const useElectricMotor = (rpm: number, isPaused: boolean = false, manualAngle?: number) => {
  const angleRef = useRef(0);
  const tempRef = useRef(25); 

  const [state, setState] = useState<ElectricMotorState>({
    angle: 0,
    phaseCurrents: [0, 0, 0],
    magneticFieldAngle: 0,
    backEMF: 0,
    torque: 0,
    power: 0,
    efficiency: 0,
    temperature: 25,
    id: 0,
    iq: 0,
    fluxVector: [0, 0, 0]
  });

  const { ELECTRIC_MOTOR: EM } = PHYSICS_CONSTANTS;

  useFrame((_, delta) => {
    if (isPaused && manualAngle !== undefined) {
      angleRef.current = manualAngle;
    } else if (!isPaused) {
      const angularVelocity = (rpm * 2 * Math.PI) / 60;
      angleRef.current += angularVelocity * delta;
    }

    const mechanicalAngle = angleRef.current;
    const electricalAngle = mechanicalAngle * EM.POLE_PAIRS;
    const omega = (rpm * 2 * Math.PI) / 60; 

    // --- Temperature Dependent Resistance ---
    // Copper temp coeff approx 0.00393 per deg C
    const tempRise = tempRef.current - 20;
    const R_phase = EM.RS * (1 + 0.00393 * tempRise);

    // --- FOC Logic ---
    const baseSpeed = 3000; 
    const maxCurrent = 200; 
    
    let iqTarget = maxCurrent;
    let idTarget = 0;

    if (rpm > baseSpeed) {
       const weakeningFactor = baseSpeed / rpm;
       iqTarget = maxCurrent * weakeningFactor;
       idTarget = -maxCurrent * (1 - weakeningFactor) * 0.5; 
    }

    // Inverse Park/Clarke
    const theta = electricalAngle;
    const iAlpha = idTarget * Math.cos(theta) - iqTarget * Math.sin(theta);
    const iBeta  = idTarget * Math.sin(theta) + iqTarget * Math.cos(theta);
    
    const iu = iAlpha;
    const iv = -0.5 * iAlpha + (Math.sqrt(3)/2) * iBeta;
    const iw = -0.5 * iAlpha - (Math.sqrt(3)/2) * iBeta;

    // Physics
    const backEMF = omega * EM.FLUX_LINKAGE * EM.POLE_PAIRS;
    const term1 = EM.FLUX_LINKAGE * iqTarget;
    const term2 = (EM.LD - EM.LQ) * idTarget * iqTarget;
    const torque = 1.5 * EM.POLE_PAIRS * (term1 + term2);
    
    const mechanicalPower = torque * omega; 
    const currentMagnitude = Math.sqrt(idTarget**2 + iqTarget**2);
    
    // --- Thermal Model ---
    const powerLoss = 1.5 * (currentMagnitude ** 2) * R_phase; // Use updated R
    const coolingCoeff = 5.0 + (rpm * 0.01); 
    const tempDiff = tempRef.current - 25; 
    const coolingRate = tempDiff * coolingCoeff;
    
    const massThermal = 5000; 
    const tempChange = (powerLoss - coolingRate) * delta / massThermal;
    
    tempRef.current += tempChange;

    const electricalPower = mechanicalPower + powerLoss;
    const efficiency = electricalPower > 1 ? (mechanicalPower / electricalPower) * 100 : 0;

    const currentAngle = Math.atan2(iBeta, iAlpha);

    setState({
      angle: mechanicalAngle,
      phaseCurrents: [iu, iv, iw],
      magneticFieldAngle: currentAngle / EM.POLE_PAIRS,
      backEMF,
      torque,
      power: mechanicalPower,
      efficiency: Math.min(99.9, Math.max(0, efficiency)),
      temperature: tempRef.current,
      id: idTarget,
      iq: iqTarget,
      fluxVector: [iAlpha, iBeta, 0] 
    });
  });

  return state;
};
