import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlowParticlesProps {
  angle: number; // Engine Cycle Angle
  count?: number;
  type: 'Intake' | 'Exhaust';
}

export const FlowParticles: React.FC<FlowParticlesProps> = ({ angle, count = 100, type }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Particle State
  const particles = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      pos: new THREE.Vector3(0, -100, 0), 
      vel: new THREE.Vector3(0, 0, 0),
      life: 0,
      active: false,
      scale: 1
    }));
  }, [count]);

  // Colors
  const colorIntake = new THREE.Color(0x88ccff); // Cool Blue
  const colorExhaustStart = new THREE.Color(0xffaa00); // Hot Fire
  const colorExhaustEnd = new THREE.Color(0x555555); // Grey Smoke

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const cycle = (angle % (4 * Math.PI)); // 0 - 720 deg
    
    // Logic:
    // Intake: Spawns 0-180. Moves Down.
    // Exhaust: Spawns 540-720. Moves Up/Out.
    
    let spawning = false;
    if (type === 'Intake' && cycle < Math.PI) spawning = true;
    if (type === 'Exhaust' && cycle > 3 * Math.PI) spawning = true;

    let activeCount = 0;

    particles.forEach((p, i) => {
      // Spawn
      if (spawning && !p.active && Math.random() < 0.2) {
         p.active = true;
         p.life = 1.0;
         
         if (type === 'Intake') {
             // Swirl in from top ports
             const theta = Math.random() * Math.PI * 2;
             const r = Math.random() * 1.5;
             p.pos.set(Math.cos(theta)*r, 11, Math.sin(theta)*r);
             p.vel.set(
                 (Math.random()-0.5), 
                 -15 - Math.random()*10, // Fast inward
                 (Math.random()-0.5)
             );
             p.scale = Math.random() * 0.3 + 0.1;
             meshRef.current!.setColorAt(i, colorIntake);
         } else {
             // Explode out from cylinder
             p.pos.set(Math.random()-0.5, 5, Math.random()-0.5);
             p.vel.set(
                 (Math.random()-0.5) * 5, 
                 15 + Math.random()*10, 
                 (Math.random()-0.5) * 5
             );
             p.scale = Math.random() * 0.5 + 0.2;
             meshRef.current!.setColorAt(i, colorExhaustStart);
         }
      }

      // Update
      if (p.active) {
        p.pos.addScaledVector(p.vel, delta);
        p.vel.multiplyScalar(0.95); // Drag
        p.life -= delta * (type === 'Intake' ? 3.0 : 2.0);
        
        // Exhaust smoke cools down/darkens
        if (type === 'Exhaust') {
            const c = new THREE.Color().lerpColors(colorExhaustEnd, colorExhaustStart, p.life);
            meshRef.current!.setColorAt(i, c);
            p.scale += delta * 2; // Expand
        }

        if (p.life <= 0 || p.pos.y < 2 || p.pos.y > 15) {
            p.active = false;
            p.pos.set(0, -100, 0);
        }
        activeCount++;
      }

      // Render
      dummy.position.copy(p.pos);
      const s = p.active ? p.scale * p.life : 0;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, count]}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial transparent opacity={0.6} />
    </instancedMesh>
  );
};
