import React from 'react';
import { ENGINE_SPECS } from '../constants/engine';
import * as THREE from 'three';

export const EngineBlock: React.FC = () => {
  const { pistonRadius, cylinderHeight } = ENGINE_SPECS;
  
  // Cooling Fins Logic
  const fins = Array.from({ length: 8 }).map((_, i) => (
      <mesh key={i} position={[0, 6 + i * 0.8, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[pistonRadius + 1.2, pistonRadius + 1.2, 0.1, 32]} />
          <meshStandardMaterial color="#555" metalness={0.6} roughness={0.4} />
      </mesh>
  ));

  return (
    <group>
      {/* Glass Cylinder Liner */}
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[pistonRadius + 0.2, pistonRadius + 0.2, cylinderHeight, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#eef" 
          metalness={0.1} 
          roughness={0.05} 
          transmission={0.95} // Glass-like
          thickness={0.5}
          opacity={0.3}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Cylinder Head (Top) - Detailed */}
      <group position={[0, 5.5 + cylinderHeight / 2 + 0.5, 0]}>
         <mesh>
            <boxGeometry args={[6, 1.5, 6]} />
            <meshStandardMaterial color="#777" metalness={0.5} roughness={0.5} />
         </mesh>
         {/* Head Bolts */}
         {[1, -1].map(x => [1, -1].map(z => (
             <mesh key={`${x}-${z}`} position={[x*2.5, 0.8, z*2.5]}>
                 <cylinderGeometry args={[0.3, 0.3, 0.5, 6]} />
                 <meshStandardMaterial color="#444" />
             </mesh>
         )))}
      </group>

      {/* Cooling Fins (External Visuals) */}
      <group>{fins}</group>
      
      {/* Base Block Mount */}
      <mesh position={[0, 1, 0]}>
         <boxGeometry args={[5, 1, 5]} />
         <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  );
};
