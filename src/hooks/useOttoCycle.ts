import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { calculateOttoCycle } from '../utils/physics';
import type { StrokePhase } from '../utils/physics';

interface OttoCycleState {
  angle: number;
  phase: StrokePhase;
  pistonY: number;
  pressure: number;
  temperature: number;
  volume: number;
  torque: number;
  workDone: number;
  // Advanced Metrics
  ve: number;
  airFlow: number;
  pistonSpeed: number;
}

export const useOttoCycle = (rpm: number, isPaused: boolean = false, manualAngle?: number) => {
  const angleRef = useRef(0);
  const [state, setState] = useState<OttoCycleState>({
    angle: 0,
    phase: 'Intake',
    pistonY: 1,
    pressure: 1,
    temperature: 300,
    volume: 500,
    torque: 0,
    workDone: 0,
    ve: 0,
    airFlow: 0,
    pistonSpeed: 0
  });

  useFrame((_, delta) => {
    if (isPaused && manualAngle !== undefined) {
      angleRef.current = manualAngle;
    } else if (!isPaused) {
      const angularVelocity = (rpm * 2 * Math.PI) / 60;
      angleRef.current += angularVelocity * delta;
    }

    const cycleAngle = ((angleRef.current % (4 * Math.PI)) + 4 * Math.PI) % (4 * Math.PI);
    
    const physics = calculateOttoCycle(cycleAngle, rpm);

    setState({
      angle: cycleAngle,
      phase: physics.phase,
      pistonY: physics.pistonY,
      pressure: physics.pressure,
      temperature: physics.temperature,
      volume: physics.volume,
      torque: physics.torque,
      workDone: 0,
      ve: physics.metrics.ve,
      airFlow: physics.metrics.airFlow,
      pistonSpeed: physics.metrics.meanPistonSpeed
    });
  });

  return state;
};
