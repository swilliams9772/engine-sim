import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ENGINE_SPECS } from '../constants/engine';

export type StrokePhase = 'Intake' | 'Compression' | 'Power' | 'Exhaust';

interface EngineState {
  angle: number; // 0 to 4PI (720 degrees)
  phase: StrokePhase;
  pistonY: number; // Normalized 0-1 (or physical units)
}

export const useEngineCycle = (rpm: number, isPaused: boolean = false, manualAngle?: number) => {
  const angleRef = useRef(0);
  const [engineState, setEngineState] = useState<EngineState>({
    angle: 0,
    phase: 'Intake',
    pistonY: 1,
  });

  const { crankRadius: r, rodLength: l } = ENGINE_SPECS;

  useFrame((_, delta) => {
    // Handle Manual Override or Automatic Update
    if (isPaused && manualAngle !== undefined) {
      angleRef.current = manualAngle;
    } else if (!isPaused) {
      // RPM to radians per second
      const angularVelocity = (rpm * 2 * Math.PI) / 60;
      angleRef.current += angularVelocity * delta;
    }

    // Normalize to 0 - 4PI (2 full rotations for 4 strokes)
    // We use modulo but ensure positive result for negative inputs
    const cycleAngle = ((angleRef.current % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
    
    // Determine Phase
    let phase: StrokePhase = 'Intake';
    if (cycleAngle < Math.PI) phase = 'Intake';
    else if (cycleAngle < 2 * Math.PI) phase = 'Compression';
    else if (cycleAngle < 3 * Math.PI) phase = 'Power';
    else phase = 'Exhaust';

    // Calculate Piston Position (Standard Slider-Crank mechanism)
    const sinTheta = Math.sin(cycleAngle);
    const cosTheta = Math.cos(cycleAngle);
    
    const term = l * l - r * r * sinTheta * sinTheta;
    const pistonY = r * cosTheta + Math.sqrt(Math.max(0, term));

    setEngineState({
      angle: cycleAngle,
      phase,
      pistonY,
    });
  });

  return engineState;
};
