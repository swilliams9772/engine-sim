import React from 'react';

interface FiringOrderRadarProps {
  angle: number; // Degrees 0-720
}

export const FiringOrderRadar: React.FC<FiringOrderRadarProps> = ({ angle }) => {
  // 1-8-7-2-6-5-4-3
  // 0, 90, 180, 270, 360, 450, 540, 630
  const firingOrder = [
    { id: 1, angle: 0 },
    { id: 8, angle: 90 },
    { id: 7, angle: 180 },
    { id: 2, angle: 270 },
    { id: 6, angle: 360 },
    { id: 5, angle: 450 },
    { id: 4, angle: 540 },
    { id: 3, angle: 630 },
  ];

  return (
    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
      <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase tracking-wider">
          <span>Firing Order</span>
          <span>1-8-7-2-6-5-4-3</span>
      </div>
      <div className="relative w-full aspect-square border border-gray-700 bg-gray-900/50 rounded-full">
          {/* Radar Scanner */}
          <div 
            className="absolute top-1/2 left-1/2 w-[45%] h-0.5 bg-gradient-to-r from-transparent to-yellow-500 origin-left"
            style={{ transform: `rotate(${angle}deg)` }}
          />
          
          {/* Cylinders */}
          {firingOrder.map((cyl) => {
             // Determine if active (within 45 deg of pointer?)
             // Angle is 0-720. Map to circle 0-360? No, scanner goes around twice per cycle.
             // Or map 720 to 360 visual?
             // Let's map 720 degrees of engine cycle to 360 visual degrees.
             // Scanner Angle = angle / 2.
             const visualAngle = (cyl.angle / 720) * 360;
             const currentScan = (angle % 720) / 720 * 360;
             
             // Check if "firing" (scanner just passed it)
             const diff = (currentScan - visualAngle + 360) % 360;
             const isFiring = diff >= 0 && diff < 45; // 45 deg persistence (90 engine deg = power stroke)

             const rad = (visualAngle - 90) * (Math.PI / 180);
             const r = 40; // %
             const x = 50 + r * Math.cos(rad);
             const y = 50 + r * Math.sin(rad);

             return (
               <div 
                 key={cyl.id}
                 className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-100
                    ${isFiring ? 'bg-red-500 border-red-400 text-white scale-110 shadow-lg shadow-red-500/50' : 'bg-gray-800 border-gray-600 text-gray-400'}
                 `}
                 style={{ left: `${x}%`, top: `${y}%` }}
               >
                 {cyl.id}
               </div>
             )
          })}
      </div>
    </div>
  );
};
