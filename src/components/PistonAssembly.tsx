import React, { useMemo } from 'react';
import { ENGINE_SPECS } from '../constants/engine';

interface PistonAssemblyProps {
  pistonY: number; // Vertical position of piston pin
  angle: number;   // Crank angle
}

export const PistonAssembly: React.FC<PistonAssemblyProps> = ({ pistonY, angle }) => {
  const { crankRadius, pistonRadius, pistonHeight, rodLength } = ENGINE_SPECS;

  // Calculate Rod position and rotation
  // Crank Pin Position (matches Crankshaft.tsx logic)
  // We used rotation=[0, 0, -angle] in Crankshaft, effectively:
  // cx = sin(-angle) * r = -sin(angle) * r ? 
  // Let's stick to the visual: 
  // In Crankshaft: Object rotates by -angle.
  // At angle 0, Pin is at (0, r, 0).
  // At angle PI/2, Pin is at (r, 0, 0) (rotated -90 deg? wait)
  // ThreeJS rotation Z is counter-clockwise. -angle is clockwise.
  // 0 -> (0, r)
  // PI/2 -> (-r, 0) if rotating +90? 
  // Let's trust the visual alignment for now, but math needs to match.
  // If Crankshaft rotates by -angle (clockwise):
  // 0: (0, r)
  // PI/2 (90 deg): (-r, 0) ?? Wait. Standard clock: 12 -> 3 is clockwise.
  // ThreeJS +Z rotation is CCW. -Z is CW.
  // 0 (Up) -> -90 (Right, +X).
  // So cx = r * sin(angle), cy = r * cos(angle).
  
  // BUT, we need the rod to connect precisely.
  // Crank Pin global pos:
  // cx = crankRadius * Math.sin(angle); 
  // cy = crankRadius * Math.cos(angle);
  // Piston Pin global pos:
  // px = 0;
  // py = pistonY;

  const rodData = useMemo(() => {
    const cx = crankRadius * Math.sin(angle);
    const cy = crankRadius * Math.cos(angle);
    
    const px = 0;
    const py = pistonY;

    // Midpoint for rod position
    const midX = (cx + px) / 2;
    const midY = (cy + py) / 2;

    // Angle of the rod
    const dx = px - cx;
    const dy = py - cy;
    const rodRotation = Math.atan2(dx, dy); // Angle from Y axis

    return { position: [midX, midY, 0] as [number, number, number], rotation: -rodRotation };
  }, [angle, pistonY, crankRadius]);

  return (
    <group>
      {/* Piston Head */}
      <mesh position={[0, pistonY, 0]}>
        <cylinderGeometry args={[pistonRadius, pistonRadius, pistonHeight, 32]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Wrist Pin (Visual only) */}
      <mesh position={[0, pistonY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, pistonRadius * 1.8, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Connecting Rod */}
      <group position={rodData.position} rotation={[0, 0, rodData.rotation]}>
         {/* Main Rod Shaft */}
         <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, rodLength, 0.5]} />
            <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
         </mesh>
      </group>
    </group>
  );
};

