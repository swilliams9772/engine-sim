import React from 'react';
import { Crankshaft } from './Crankshaft';
import { PistonAssembly } from './PistonAssembly';
import { EngineBlock } from './EngineBlock';
import { ValveSystem } from './ValveSystem';
import { CombustionChamber } from './CombustionChamber';
import { FlowParticles } from './FlowParticles';
import type { StrokePhase } from '../hooks/useEngineCycle';

interface EngineProps {
  angle: number;
  phase: StrokePhase;
  pistonY: number;
  showBlock: boolean;
}

export const Engine: React.FC<EngineProps> = ({ angle, phase, pistonY, showBlock }) => {
  return (
    <group position={[0, -3, 0]}>
      <Crankshaft angle={angle} />
      <PistonAssembly angle={angle} pistonY={pistonY} />
      
      {showBlock && <EngineBlock />}
      
      <ValveSystem angle={angle} />
      <CombustionChamber pistonY={pistonY} phase={phase} />
      
      {/* Particle Effects */}
      <FlowParticles angle={angle} type="Intake" count={100} />
      <FlowParticles angle={angle} type="Exhaust" count={100} />
    </group>
  );
};
