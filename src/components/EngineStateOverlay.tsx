import React from 'react';

interface EngineStateOverlayProps {
  engineType: 'Piston' | 'Rotary' | 'Electric' | 'V8';
  data: any; // Generic data bag from hooks
}

export const EngineStateOverlay: React.FC<EngineStateOverlayProps> = ({ engineType, data }) => {
  
  const getStatus = () => {
    const rpm = data.rpm || 0;

    if (engineType === 'Piston') {
      const phase = data.phase; 
      const ve = data.ve || 0;
      
      // Physics Insights
      if (rpm > 5000 && ve < 0.8) return { title: "CHOKED FLOW", desc: "Valve curtains limit air velocity. Volumetric Efficiency drops rapidly." };
      if (rpm < 800) return { title: "IDLE STABILITY", desc: "Throttle closed. Maintaining minimum angular momentum to prevent stall." };
      
      if (phase === 'Intake') return { title: "INTAKE", desc: "Isobaric induction. Cylinder fills with air-fuel mixture." };
      if (phase === 'Compression') return { title: "COMPRESSION", desc: "Polytropic process (n=1.35). Pressure/Temp spike before ignition." };
      if (phase === 'Power') return { title: "POWER / EXPANSION", desc: "Isochoric heat addition followed by Adiabatic expansion." };
      if (phase === 'Exhaust') return { title: "EXHAUST", desc: "Blowdown phase releases residual pressure to manifold." };
    }
    
    if (engineType === 'Rotary') {
      const phase = data.phase; 
      if (phase === 'Intake') return { title: "INTAKE SWEEP", desc: "Port overlap allows fresh charge to enter the expanding lobe." };
      if (phase === 'Compression') return { title: "COMPRESSION", desc: "Charge is swept against the trochoid housing wall." };
      if (phase === 'Power') return { title: "POWER", desc: "Long duration stroke provides smooth torque application." };
      if (phase === 'Exhaust') return { title: "EXHAUST", desc: "Peripheral ports scavenge burnt gases efficiently." };
    }

    if (engineType === 'V8') {
      // const torque = data.torque;
      if (rpm < 100) return { title: "CRANKING", desc: "Starter motor overcoming massive compression resistance." };
      if (rpm > 5000) return { title: "HIGH RPM HARMONICS", desc: "Crossplane crank creates secondary vibration couple." };
      return { title: "CROSSPLANE FIRING", desc: "90° intervals. 1-8-4-3-6-5-7-2. The American V8 sound." };
    }

    if (engineType === 'Electric') {
      const eff = data.efficiency;
      const temp = data.temperature || 25;
      const backEmf = data.voltage || 0;
      
      if (rpm < 100) return { title: "MAGNETIC ALIGNMENT", desc: "Field Oriented Control aligning stator flux to rotor d-axis." };
      if (temp > 100) return { title: "THERMAL DERATING", desc: "I²R losses exceed cooling capacity. Limiting current." };
      if (backEmf > 350) return { title: "FIELD WEAKENING", desc: "Injecting negative d-axis current to suppress Back EMF." };
      if (eff > 90) return { title: "PEAK EFFICIENCY", desc: "Operating in optimal slip/torque region. Losses < 10%." };
      return { title: "CONSTANT TORQUE", desc: "Base speed region. Max current available for acceleration." };
    }
    
    return { title: "ANALYZING", desc: "Initializing physics model..." };
  };

  const status = getStatus();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl pointer-events-none">
      <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full mb-2">
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              {status.title}
            </h2>
         </div>
         <p className="text-yellow-400 font-mono text-sm bg-black/80 px-3 py-1 rounded border border-yellow-500/20">
            {status.desc}
         </p>
      </div>
    </div>
  );
};
