import React from 'react';

interface ValveSystemProps {
  angle: number; // 0 - 4PI
}

export const ValveSystem: React.FC<ValveSystemProps> = ({ angle }) => {
  // Valve positions (relative to head)
  const valveOffset = 1.2;
  const baseHeight = 9; // Top of cylinder roughly
  const maxLift = 0.6;

  // Normalize angle 0-4PI
  const cycleAngle = angle % (4 * Math.PI);

  // Intake: 0 to PI
  let intakeLift = 0;
  if (cycleAngle >= 0 && cycleAngle <= Math.PI) {
    intakeLift = Math.sin(cycleAngle) * maxLift;
  }

  // Exhaust: 3PI to 4PI
  let exhaustLift = 0;
  if (cycleAngle >= 3 * Math.PI && cycleAngle <= 4 * Math.PI) {
    exhaustLift = Math.sin(cycleAngle - 3 * Math.PI) * maxLift;
  }

  return (
    <group position={[0, baseHeight, 0]}>
      {/* Intake Valve (Left) - Blue indicator */}
      <group position={[-valveOffset, -intakeLift, 0]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
          <meshStandardMaterial color="#3b82f6" /> 
        </mesh>
        <mesh position={[0, 1, 0]}>
           <cylinderGeometry args={[0.8, 0.1, 0.5, 16]} />
           <meshStandardMaterial color="#888" />
        </mesh>
      </group>

      {/* Exhaust Valve (Right) - Red indicator */}
      <group position={[valveOffset, -exhaustLift, 0]}>
         <mesh>
          <cylinderGeometry args={[0.4, 0.4, 2, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 1, 0]}>
           <cylinderGeometry args={[0.8, 0.1, 0.5, 16]} />
           <meshStandardMaterial color="#888" />
        </mesh>
      </group>
    </group>
  );
};

