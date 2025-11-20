import React from 'react';
import { PistonAssembly } from './PistonAssembly';
import { CombustionChamber } from './CombustionChamber';
import { ValveSystem } from './ValveSystem';
import { useOttoCycle } from '../hooks/useOttoCycle';
import { useFrame } from '@react-three/fiber';
import { FlowParticles } from './FlowParticles';

interface V8EngineProps {
  rpm: number;
  isPaused: boolean;
  manualAngle: number;
  showBlock: boolean;
}

export const V8Engine: React.FC<V8EngineProps> = ({ rpm, isPaused, manualAngle, showBlock }) => {
  // V8 Configuration (90 degree Crossplane)
  // Firing Order: 1-8-4-3-6-5-7-2
  
  // Offsets (Degrees from Cyl 1 firing event)
  // We define the offset such that Cyl X fires N degrees AFTER Cyl 1.
  // Cyl 1 fires at 360.
  // Cyl 8 fires at 360 + 90. So if Master is 360, Cyl 8 should be 270.
  // Local = Master - Offset.
  // If Master = 450, Local = 450 - 90 = 360 (Firing). Correct.
  // So Offset = Firing Delay.
  
  const cylinders = [
    { id: 1, bank: 'L', delay: 0, z: 0 },
    { id: 8, bank: 'R', delay: 90, z: 5.0 },
    { id: 4, bank: 'R', delay: 180, z: 2.0 },
    { id: 3, bank: 'L', delay: 270, z: 1.5 },
    { id: 6, bank: 'R', delay: 360, z: 3.5 },
    { id: 5, bank: 'L', delay: 450, z: 3.0 },
    { id: 7, bank: 'L', delay: 540, z: 4.5 },
    { id: 2, bank: 'R', delay: 630, z: 0.5 },
  ];

  return (
    <group>
      {/* Main V8 Block Visual */}
      {showBlock && (
        <group rotation={[0, 0, 0]}>
           {/* V-Shape */}
           <mesh position={[0, 2, 2.5]} rotation={[Math.PI/2, 0, 0]}>
              <boxGeometry args={[5, 8, 10]} />
              <meshStandardMaterial color="#444" />
           </mesh>
           <mesh position={[3, 5, 2.5]} rotation={[0, 0, -Math.PI/4]}>
               <boxGeometry args={[4, 8, 8]} />
               <meshStandardMaterial color="#444" transparent opacity={0.3} />
           </mesh>
           <mesh position={[-3, 5, 2.5]} rotation={[0, 0, Math.PI/4]}>
               <boxGeometry args={[4, 8, 8]} />
               <meshStandardMaterial color="#444" transparent opacity={0.3} />
           </mesh>
        </group>
      )}

      {/* Crankshaft (Long) */}
      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 2.5]}>
         <cylinderGeometry args={[0.4, 0.4, 7, 16]} />
         <meshStandardMaterial color="#555" />
      </mesh>

      {/* Render Cylinders */}
      {cylinders.map(cyl => (
        <SingleCylinder 
          key={cyl.id}
          {...cyl}
          rpm={rpm}
          isPaused={isPaused}
          manualAngle={manualAngle}
        />
      ))}
    </group>
  );
};

const SingleCylinder = ({ bank, delay, z, rpm, isPaused, manualAngle }: any) => {
  return (
     <group 
       position={[0, 0, z]} 
       rotation={[0, 0, bank === 'L' ? Math.PI/4 : -Math.PI/4]}
     >
        <CylinderInternals 
           delay={delay} 
           rpm={rpm} 
           isPaused={isPaused} 
           manualAngle={manualAngle} 
        />
     </group>
  );
}

const CylinderInternals = ({ delay, rpm, isPaused, manualAngle }: any) => {
  return (
      <ComputedCylinder delay={delay} rpm={rpm} isPaused={isPaused} globalAngle={manualAngle} />
  );
}

const ComputedCylinder = ({ delay, rpm, isPaused, globalAngle }: any) => {
   const [localAngle, setLocalAngle] = React.useState(0);
   
   useFrame((_, delta) => {
     if (!isPaused) {
        const angularVelocity = (rpm * 2 * Math.PI) / 60;
        setLocalAngle(a => a + angularVelocity * delta);
     } else {
        setLocalAngle(globalAngle);
     }
   });
   
   // Local Angle = Master - Delay
   // Delay is in degrees.
   const delayRad = (delay / 180) * Math.PI;
   const effectiveAngle = localAngle - delayRad;
   
   const state = useOttoCycle(0, true, effectiveAngle); 

   return (
     <>
       <PistonAssembly angle={state.angle} pistonY={state.pistonY} />
       <CombustionChamber pistonY={state.pistonY} phase={state.phase} />
       <ValveSystem angle={state.angle} />
       {/* Particles for this cylinder */}
       <FlowParticles angle={state.angle} type="Intake" count={20} />
       <FlowParticles angle={state.angle} type="Exhaust" count={20} />
     </>
   )
}
