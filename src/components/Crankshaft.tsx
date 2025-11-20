import React from 'react';
import { ENGINE_SPECS } from '../constants/engine';

interface CrankshaftProps {
  angle: number; // Current crank angle in radians
}

export const Crankshaft: React.FC<CrankshaftProps> = ({ angle }) => {
  const { crankRadius } = ENGINE_SPECS;

  return (
    <group rotation={[0, 0, -angle]}> 
      {/* Note: We invert angle because Three.js rotation direction vs our math assumption */}
      
      {/* Main Shaft Axis */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 6, 32]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Counterweight Arm */}
      <mesh position={[0, crankRadius / 2, 0]} scale={[1, 1, 0.5]}>
        <boxGeometry args={[1.5, crankRadius * 1.5, 1]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Crank Pin (Where rod connects) */}
      <mesh position={[0, crankRadius, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 2, 32]} />
        <meshStandardMaterial color="#777" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

