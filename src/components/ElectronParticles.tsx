import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ElectronParticlesProps {
  phaseCurrents: [number, number, number];
}

export const ElectronParticles: React.FC<ElectronParticlesProps> = ({ phaseCurrents }) => {
  // Visualize electrons flowing in the 3 phases
  // 3 Groups of particles moving along the coil paths?
  // Simplified: Particles orbiting the stator based on current direction?
  // Or just random noise scaled by current magnitude on the coils?
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = 100;
  
  // Stator Radius approx 4
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
       // Distribute among 3 phases (12 coils)
       const coilIdx = i % 12;
       const phaseIdx = coilIdx % 3;
       const current = phaseCurrents[phaseIdx];
       
       // Position on coil
       const theta = (coilIdx / 12) * 2 * Math.PI;
       const r = 4; // Stator radius
       
       // Oscillate along the coil length (z)
       // Speed proportional to current
       const speed = current * 0.1;
       const z = (i % 5) - 2.5 + Math.sin(time * speed + i) * 2;
       
       dummy.position.set(
         r * Math.cos(theta),
         r * Math.sin(theta),
         z
       );
       
       // Scale based on current magnitude
       const scale = Math.min(0.2, Math.abs(current) / 500);
       dummy.scale.set(scale, scale, scale);
       
       dummy.updateMatrix();
       meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
      <sphereGeometry args={[0.5, 4, 4]} />
      <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
    </instancedMesh>
  );
};

