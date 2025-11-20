import React from 'react';
import type { StrokePhase } from '../utils/physics';

interface PhaseListProps {
  activePhase: StrokePhase | string;
}

const phases = [
  { id: 'Intake', label: 'INTAKE', desc: 'Air/Fuel In' },
  { id: 'Compression', label: 'COMPRESSION', desc: 'Squeeze' },
  { id: 'Power', label: 'POWER', desc: 'Combustion' },
  { id: 'Exhaust', label: 'EXHAUST', desc: 'Gases Out' },
];

export const PhaseList: React.FC<PhaseListProps> = ({ activePhase }) => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col gap-2">
      {phases.map((p) => {
        const isActive = activePhase === p.id;
        return (
          <div 
            key={p.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md transition-all duration-150
              ${isActive 
                ? 'bg-yellow-500/90 border-yellow-400 translate-x-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-110' 
                : 'bg-black/40 border-white/10 opacity-50'
              }
            `}
          >
            {/* Status Dot */}
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
            
            <div>
              <div className={`text-sm font-bold tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>
                {p.label}
              </div>
              <div className={`text-[10px] font-mono uppercase ${isActive ? 'text-black/80' : 'text-gray-500'}`}>
                {p.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

