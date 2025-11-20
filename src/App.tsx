import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { Scene } from './components/Scene';
import { Engine } from './components/Engine'; 
import { RotaryEngine } from './components/RotaryEngine'; 
import { ElectricMotor } from './components/ElectricMotor';
import { V8Engine } from './components/V8Engine';
import { Overlay } from './components/Overlay';
import { PhaseList } from './components/PhaseList'; // New Component
import { TelemetryPanel } from './components/TelemetryPanel';
import { useOttoCycle } from './hooks/useOttoCycle';
import { useWankelCycle } from './hooks/useWankelCycle';
import { useElectricMotor } from './hooks/useElectricMotor';
import { useEngineSound } from './hooks/useEngineSound';
import { useFrame } from '@react-three/fiber';

// const useMasterClock = (rpm: number, isPaused: boolean, manualAngle: number) => {
//   const angleRef = useRef(0);
//   const [angle, setAngle] = useState(0);
  
//   useFrame((_, delta) => {
//     if (isPaused) {
//       angleRef.current = manualAngle;
//     } else {
//       const angularVelocity = (rpm * 2 * Math.PI) / 60;
//       angleRef.current += angularVelocity * delta;
//     }
//     setAngle(angleRef.current);
//   });
//   return angle;
// };

const ClockBridge = ({ rpm, isPaused, manualAngle, onUpdate }: any) => {
  useFrame((_, delta) => {
    if (!isPaused) {
       const dAngle = (rpm * 2 * Math.PI) / 60 * delta;
       onUpdate((prev: number) => prev + dAngle);
    } else {
       onUpdate(manualAngle);
    }
  });
  return null;
};

const EngineSimulation = () => {
  const [engineType, setEngineType] = useState<'Piston' | 'Rotary' | 'Electric' | 'V8'>('Piston');
  const [rpm, setRpm] = useState(30);
  const [showBlock, setShowBlock] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [manualAngle, setManualAngle] = useState(0);
  
  const [v8MasterAngle, setV8MasterAngle] = useState(0);

  const pistonState = useOttoCycle(rpm, isPaused && engineType === 'Piston', manualAngle);
  const rotaryState = useWankelCycle(rpm, isPaused && engineType === 'Rotary', manualAngle);
  const electricState = useElectricMotor(rpm, isPaused && engineType === 'Electric', manualAngle);
  
  useEngineSound(rpm, engineType, isPaused);

  useEffect(() => {
    if (isPaused) {
      if (engineType === 'Piston') setManualAngle(pistonState.angle);
      else if (engineType === 'Rotary') setManualAngle(rotaryState.angle);
      else if (engineType === 'Electric') setManualAngle(electricState.angle);
      else if (engineType === 'V8') setManualAngle(v8MasterAngle);
    }
  }, [isPaused, engineType]);

  let telemetryData = {
    rpm,
    pressure: 0,
    temperature: 0,
    torque: 0,
    volume: 0,
    phase: '',
    current: 0,
    voltage: 0,
    power: 0,
    efficiency: 0,
    mode: engineType,
    fluxVector: [0,0,0] as [number, number, number],
    angle: 0 
  };

  if (engineType === 'Piston') {
    telemetryData = { ...telemetryData, 
      pressure: pistonState.pressure,
      temperature: pistonState.temperature,
      torque: pistonState.torque,
      volume: pistonState.volume,
      phase: pistonState.phase,
      angle: pistonState.angle
    };
  } else if (engineType === 'Electric') {
    telemetryData = { ...telemetryData,
      current: electricState.phaseCurrents[0],
      voltage: electricState.backEMF,
      power: electricState.power,
      efficiency: electricState.efficiency,
      torque: electricState.torque,
      temperature: electricState.temperature,
      fluxVector: electricState.fluxVector,
      phase: 'Running',
      angle: electricState.angle
    };
  } else if (engineType === 'Rotary') {
     telemetryData = { ...telemetryData,
        pressure: rotaryState.pressure,
        temperature: rotaryState.temperature,
        torque: rotaryState.torque,
        volume: rotaryState.volume,
        phase: rotaryState.phases[0],
        angle: rotaryState.angle
     };
  } else if (engineType === 'V8') {
     telemetryData = { ...telemetryData,
        torque: (rpm < 5000 ? rpm * 0.8 : 5000 * 0.8) * 8,
        angle: v8MasterAngle,
        phase: 'Running'
     };
  }

  return (
    <>
      {engineType === 'V8' && (
         <ClockBridge rpm={rpm} isPaused={isPaused} manualAngle={manualAngle} onUpdate={setV8MasterAngle} />
      )}

      {engineType === 'Piston' && (
        <Engine 
          angle={pistonState.angle} 
          phase={pistonState.phase} 
          pistonY={pistonState.pistonY} 
          showBlock={showBlock} 
        />
      )}
      {engineType === 'Rotary' && (
        <RotaryEngine 
           angle={rotaryState.angle}
           rotorAngle={rotaryState.rotorAngle}
        />
      )}
      {engineType === 'Electric' && (
        <ElectricMotor state={electricState} />
      )}
      {engineType === 'V8' && (
        <V8Engine 
          rpm={rpm} 
          isPaused={isPaused} 
          manualAngle={manualAngle} 
          showBlock={showBlock}
        />
      )}
      
      {/* UI Layer */}
      <Html fullscreen zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <div className="w-full h-full pointer-events-none">
          <Overlay 
            engineType={engineType}
            setEngineType={setEngineType}
            phase={engineType === 'Piston' ? pistonState.phase : 'Running'} // Keep for compatibility
            rpm={rpm}
            setRpm={setRpm}
            showBlock={showBlock}
            setShowBlock={setShowBlock}
            showTelemetry={showTelemetry}
            setShowTelemetry={setShowTelemetry}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            manualAngle={manualAngle}
            setManualAngle={setManualAngle}
            telemetryData={telemetryData}
          />
          
          {/* New Phase List for 4-Stroke Piston only */}
          {engineType === 'Piston' && (
             <PhaseList activePhase={pistonState.phase} />
          )}
          
          <TelemetryPanel data={telemetryData} show={showTelemetry} />
        </div>
      </Html>
    </>
  );
};

function App() {
  return (
    <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
      <Scene>
        <EngineSimulation />
      </Scene>
    </div>
  );
}

export default App;
