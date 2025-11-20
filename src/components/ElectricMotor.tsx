import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { ElectricMotorState } from '../hooks/useElectricMotor';
import { ElectronParticles } from './ElectronParticles';

interface ElectricMotorProps {
  state: ElectricMotorState;
}

export const ElectricMotor: React.FC<ElectricMotorProps> = ({ state }) => {
  const { angle } = state;
  
  // Visual Constants
  const STATOR_RADIUS = 4;
  const ROTOR_RADIUS = 2.5;
  const LENGTH = 6;
  const COIL_COUNT = 12;
  
  const coils = useMemo(() => {
    return new Array(COIL_COUNT).fill(0).map((_, i) => {
      const theta = (i / COIL_COUNT) * 2 * Math.PI;
      const phaseIdx = i % 3; 
      return {
        pos: [STATOR_RADIUS * Math.cos(theta), STATOR_RADIUS * Math.sin(theta), 0],
        rot: [0, 0, theta + Math.PI/2],
        phaseIdx
      };
    });
  }, []);

  const getCoilColor = (phaseIdx: number, coilIndex: number) => {
    const isReversed = coilIndex % 2 !== 0; 
    const current = state.phaseCurrents[phaseIdx];
    const val = isReversed ? -current : current;
    const intensity = Math.max(-1, Math.min(1, val / 150));
    const r = intensity > 0 ? intensity : 0;
    const b = intensity < 0 ? -intensity : 0;
    const g = 0.2; 
    return new THREE.Color(r + g, g, b + g);
  };

  return (
    <group>
      {/* Stator Housing */}
      <mesh rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[STATOR_RADIUS + 1, STATOR_RADIUS + 1, LENGTH, 32, 1, true]} />
        <meshStandardMaterial color="#333" wireframe transparent opacity={0.2} />
      </mesh>

      {/* Stator Coils */}
      {coils.map((coil, i) => (
        <group key={i} position={coil.pos as any} rotation={coil.rot as any}>
          <mesh rotation={[Math.PI/2, 0, 0]}>
             <boxGeometry args={[1.5, 0.8, LENGTH]} />
             <meshStandardMaterial color="#555" />
          </mesh>
          <mesh rotation={[Math.PI/2, 0, 0]} scale={[1.1, 0.6, 0.8]}>
             <boxGeometry args={[1.5, 0.8, LENGTH]} />
             <meshStandardMaterial 
                color={getCoilColor(coil.phaseIdx, i)} 
                emissive={getCoilColor(coil.phaseIdx, i)}
                emissiveIntensity={0.5}
             />
          </mesh>
        </group>
      ))}
      
      {/* Electron Flow Particles */}
      <ElectronParticles phaseCurrents={state.phaseCurrents} />

      {/* Rotor */}
      <group rotation={[0, 0, angle]}>
         <mesh rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[ROTOR_RADIUS, ROTOR_RADIUS, LENGTH, 32]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
         </mesh>
         
         {[0, 1, 2, 3].map(i => (
           <mesh 
             key={i} 
             rotation={[0, 0, (i * Math.PI / 2)]} 
             position={[
               (ROTOR_RADIUS) * Math.cos(i * Math.PI / 2), 
               (ROTOR_RADIUS) * Math.sin(i * Math.PI / 2), 
               0
             ]}
           >
             <boxGeometry args={[1, 0.5, LENGTH]} />
             <meshStandardMaterial color={i % 2 === 0 ? "#ff0000" : "#0000ff"} />
           </mesh>
         ))}
         
         <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 4]}>
            <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
            <meshStandardMaterial color="#aaa" />
         </mesh>

         {/* D-Axis Vector (Attached to Rotor) */}
         {/* Shows the magnetic axis of the permanent magnets */}
         <arrowHelper args={[
            new THREE.Vector3(1, 0, 0), // Dir
            new THREE.Vector3(0, 0, 3), // Origin
            4, // Length
            0x00ff00, // Green
            1, 0.5 
         ]} />
      </group>
      
      {/* Stator Field Vector (Q-Axis / Torque producing) */}
      {/* Rotates with the magnetic field, independent of rotor group */}
      <group rotation={[0, 0, state.magneticFieldAngle]}>
         <arrowHelper args={[
            new THREE.Vector3(1, 0, 0), // Dir
            new THREE.Vector3(0, 0, 3), // Origin
            5, // Length
            0xffff00, // Yellow
            1, 0.5 
         ]} />
         <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
             <torusGeometry args={[STATOR_RADIUS - 0.5, 0.1, 8, 64, Math.PI/4]} />
             <meshBasicMaterial color="yellow" transparent opacity={0.3} />
         </mesh>
      </group>

    </group>
  );
};
