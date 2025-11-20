import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StrokePhase } from '../utils/physics';
import { ENGINE_SPECS } from '../constants/engine';

interface CombustionChamberProps {
  pistonY: number;
  phase: StrokePhase;
}

export const CombustionChamber: React.FC<CombustionChamberProps> = ({ pistonY, phase }) => {
  const { pistonRadius, pistonHeight } = ENGINE_SPECS;
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate chamber dimensions
  const headY = 9.5; // Fixed top of cylinder space
  const pistonTopY = pistonY + pistonHeight / 2;
  const chamberHeight = Math.max(0.1, headY - pistonTopY);
  const midY = pistonTopY + chamberHeight / 2;

  // Dynamic Visuals
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const time = state.clock.elapsedTime;

    // Base Colors
    const cIntake = new THREE.Color('#3b82f6'); // Blue
    const cComp = new THREE.Color('#f97316');   // Orange
    const cPower = new THREE.Color('#ef4444');  // Red
    const cExhaust = new THREE.Color('#555555');// Grey

    // Turbulence / Noise effect on opacity
    const turbulence = Math.sin(time * 20) * 0.1 + 0.9;

    switch (phase) {
      case 'Intake':
        material.color.lerp(cIntake, 0.1);
        material.emissive.setHex(0x000000);
        material.opacity = 0.3 * turbulence;
        break;
      case 'Compression':
        material.color.lerp(cComp, 0.1);
        material.emissive.setHex(0x000000);
        material.opacity = 0.5 + (1 - chamberHeight/4) * 0.3; // Denser as it compresses
        break;
      case 'Power':
        material.color.set(cPower);
        // Flash effect at start of power stroke?
        // Simulating explosion with high emissive
        material.emissive.setHex(0xffaa00); 
        material.emissiveIntensity = 2.0 * turbulence;
        material.opacity = 0.8;
        break;
      case 'Exhaust':
        material.color.lerp(cExhaust, 0.1);
        material.emissive.setHex(0x000000);
        material.opacity = 0.4 * turbulence;
        break;
    }
  });

  return (
    <group>
      {/* Spark Plug Model (Static at top) */}
      <group position={[0, headY + 0.5, 0]}>
         <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.2, 16]} />
            <meshStandardMaterial color="#eee" metalness={0.8} roughness={0.2} />
         </mesh>
         <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.5, 6]} />
            <meshStandardMaterial color="#fff" />
         </mesh>
         {/* Spark Tip */}
         <mesh position={[0, -1.1, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
            <meshStandardMaterial color="#333" />
         </mesh>
      </group>

      {/* The Gas Volume */}
      <mesh ref={meshRef} position={[0, midY, 0]}>
        <cylinderGeometry args={[pistonRadius - 0.15, pistonRadius - 0.15, chamberHeight, 32]} />
        <meshStandardMaterial 
          transparent 
          opacity={0.5} 
          roughness={1}
          metalness={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false} // Better for transparent gas look
        />
      </mesh>
    </group>
  );
};
