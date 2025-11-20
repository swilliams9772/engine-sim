import React from 'react';

interface VectorScopeProps {
  id: number;
  iq: number;
  maxCurrent: number;
}

export const VectorScope: React.FC<VectorScopeProps> = ({ id, iq, maxCurrent }) => {
  // Normalize to -100% to 100%
  const x = (id / maxCurrent) * 50 + 50; // 0% to 100% of container width
  const y = 100 - ((iq / maxCurrent) * 50 + 50); // Invert Y for CSS top

  return (
    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
      <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-wider">
          <span>Vector Space</span>
          <span>d-q Frame</span>
      </div>
      <div className="relative w-full aspect-square border border-gray-700 bg-gray-900/50 rounded-full overflow-hidden">
          {/* Crosshairs */}
          <div className="absolute top-1/2 w-full h-px bg-gray-600"></div>
          <div className="absolute left-1/2 h-full w-px bg-gray-600"></div>
          
          {/* Labels */}
          <div className="absolute top-1/2 right-1 text-[9px] text-gray-500 -translate-y-1/2">+d</div>
          <div className="absolute top-1 left-1/2 text-[9px] text-gray-500 -translate-x-1/2">+q</div>

          {/* Vector Arrow (Simplified as a dot with line) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             <line 
               x1="50%" y1="50%" 
               x2={`${x}%`} y2={`${y}%`} 
               stroke="#3b82f6" 
               strokeWidth="2"
             />
             <circle cx={`${x}%`} cy={`${y}%`} r="3" fill="#3b82f6" />
          </svg>
      </div>
      <div className="mt-2 flex justify-between text-xs font-mono text-gray-400">
         <span>Id: {id.toFixed(0)}A</span>
         <span>Iq: {iq.toFixed(0)}A</span>
      </div>
    </div>
  );
};
