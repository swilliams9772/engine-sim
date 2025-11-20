import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RotaryEngineProps {
  angle: number;
  rotorAngle: number;
}

export const RotaryEngine: React.FC<RotaryEngineProps> = ({ angle, rotorAngle }) => {
  // Geometry Constants
  const e = 1.5; // Eccentricity
  const R = 5;   // Generating Radius
  const housingDepth = 2;

  // Create Epitrochoid Housing Shape
  const housingShape = useMemo(() => {
    const shape = new THREE.Shape();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      // Epitrochoid Parametric Equations
      const x = e * Math.cos(3 * t) + R * Math.cos(t);
      const y = e * Math.sin(3 * t) + R * Math.sin(t);
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    return shape;
  }, [e, R]);

  // Create Triangular Rotor Shape
  const rotorShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Reuleaux Triangle approximate
    // Simplification: Triangle with curved sides
    const r = R - 0.2; // Slightly smaller to fit
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * 2 * Math.PI;
      const x = r * Math.cos(t);
      const y = r * Math.sin(t);
      if (i === 0) shape.moveTo(x, y);
      else {
          // Curve to next point
          // calculate mid point for quadratic curve
          const nextT = ((i + 1) / steps) * 2 * Math.PI;
          const nx = r * Math.cos(nextT);
          const ny = r * Math.sin(nextT);
          
          // Control point further out
          const midT = (t + nextT) / 2;
          const cx = (r + 2) * Math.cos(midT); // Bulge out
          const cy = (r + 2) * Math.sin(midT);
          
          shape.quadraticCurveTo(cx, cy, nx, ny);
      }
    }
    // Close last curve
    const t0 = 0;
    const x0 = r * Math.cos(t0);
    const y0 = r * Math.sin(t0);
    // Manual closure
    shape.quadraticCurveTo((r+2)*Math.cos(Math.PI/3*5), (r+2)*Math.sin(Math.PI/3*5), x0, y0);
    
    return shape;
  }, [R]);

  return (
    <group position={[0, 0, 0]}>
      {/* Housing */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <extrudeGeometry args={[housingShape, { depth: housingDepth, bevelEnabled: false }]} />
        <meshStandardMaterial color="#444" transparent opacity={0.3} side={THREE.DoubleSide} />
        <lineSegments>
            <edgesGeometry args={[new THREE.ExtrudeGeometry(housingShape, { depth: housingDepth, bevelEnabled: false })]} />
            <lineBasicMaterial color="#666" />
        </lineSegments>
      </mesh>

      {/* Eccentric Shaft (Stationary center + Orbiting center) */}
      {/* The visual representation of the output shaft spinning */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 1]}>
         <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
         <meshStandardMaterial color="#888" />
      </mesh>

      {/* Rotor Group */}
      {/* 
          Motion:
          1. The Rotor center orbits the housing center at shaft speed (eccentricity).
          2. The Rotor spins around its own center at 1/3 shaft speed.
      */}
      <group 
        position={[
           e * Math.cos(angle), 
           e * Math.sin(angle), 
           0
        ]} 
        rotation={[0, 0, rotorAngle]}
      >
        <mesh>
            <extrudeGeometry args={[rotorShape, { depth: housingDepth - 0.1, bevelEnabled: true, bevelSize: 0.1 }]} />
            <meshStandardMaterial color="#ccc" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Gear/Center visual */}
        <mesh position={[0, 0, 1]}>
            <cylinderGeometry args={[1.5, 1.5, 0.2, 16]} />
            <meshStandardMaterial color="#333" />
        </mesh>
      </group>

    </group>
  );
};

