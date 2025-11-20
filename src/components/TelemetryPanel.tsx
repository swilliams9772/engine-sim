import React from 'react';

interface TelemetryPanelProps {
  data: {
    rpm: number;
    pressure: number;
    temperature: number;
    torque: number;
    volume: number;
    phase: string;
    current?: number;
    voltage?: number;
    power?: number;
    efficiency?: number;
    mode?: string;
    fluxVector?: [number, number, number];
    angle?: number;
  };
  show: boolean;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ data, show }) => {
  if (!show) return null;

  const barWidth = (val: number, max: number) => `${Math.min(100, Math.max(0, (val / max) * 100))}%`;
  const isElectric = data.mode === 'Electric';
  const isV8 = data.mode === 'V8';

  // V8 Firing Order: 1-8-4-3-6-5-7-2
  const firingOrder = [1, 8, 4, 3, 6, 5, 7, 2];
  
  // Corrected Firing Angles (Degrees of Crankshaft Rotation 0-720)
  // Based on 1-8-4-3-6-5-7-2 sequence with 90 deg intervals.
  // Cyl 1 fires at 0 (or 720/0).
  // Cyl 8 fires at 90.
  // Cyl 4 fires at 180.
  // ...
  // We need to check if the MASTER ANGLE is within the "Power Stroke" window of each cylinder.
  // Power Stroke is 0 to 180 degrees AFTER firing event? (Roughly)
  // Or just flash the spark (duration 30 deg).
  const firingAngles: Record<number, number> = {
    1: 0,
    8: 90,
    4: 180,
    3: 270,
    6: 360,
    5: 450,
    7: 540,
    2: 630
  };

  return (
    <div className="absolute top-20 right-6 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white font-mono shadow-2xl">
      <h3 className="text-yellow-400 font-bold border-b border-white/20 pb-2 mb-4 flex justify-between items-baseline">
        <span>TELEMETRY</span>
        <span className="text-[10px] opacity-50">SAMPLING: 60Hz</span>
      </h3>

      <div className="space-y-6">
        
        {isElectric ? (
          <>
             {/* Vector Scope */}
             <div className="flex justify-center mb-4">
                <div className="w-32 h-32 border border-gray-600 rounded-full relative bg-gray-900/50">
                   <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-700"></div>
                   <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-700"></div>
                   {data.fluxVector && (
                     <div 
                       className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"
                       style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(${data.fluxVector[0] * 0.15}px, ${-data.fluxVector[1] * 0.15}px)` 
                       }}
                     />
                   )}
                   <div className="absolute top-1 right-4 text-[8px] text-gray-500">I_q</div>
                   <div className="absolute bottom-4 right-1 text-[8px] text-gray-500">I_d</div>
                </div>
             </div>

             <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-blue-400">Phase Current</span>
                <span>{Math.abs(data.current || 0).toFixed(1)} A</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: barWidth(Math.abs(data.current || 0), 200) }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-green-400">Mech. Power</span>
                <span>{((data.power || 0) / 1000).toFixed(1)} kW</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-75" style={{ width: barWidth(data.power || 0, 150000) }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-red-400">Stator Temp</span>
                <span>{Math.round(data.temperature || 25)} °C</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-red-600 transition-all duration-75" style={{ width: barWidth(data.temperature || 25, 150) }} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Pressure & Temp (Piston/Rotary) */}
            {!isV8 && (
              <>
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-blue-400">Cyl Pressure</span>
                    <span>{data.pressure.toFixed(2)} bar</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-white/10"></div>
                    <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: barWidth(data.pressure, 80) }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="text-orange-400">Gas Temp</span>
                    <span>{Math.round(data.temperature)} K</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-75" style={{ width: barWidth(data.temperature, 2500) }} />
                  </div>
                </div>
              </>
            )}

            {/* V8 Firing Wheel */}
            {isV8 && (
               <div className="mt-4 p-4 bg-white/5 rounded border border-white/10 text-center">
                  <span className="text-xs text-gray-400 block mb-4 tracking-widest">FIRING ORDER (1-8-4-3-6-5-7-2)</span>
                  <div className="relative w-32 h-32 mx-auto">
                     {/* Center Hub */}
                     <div className="absolute inset-0 m-auto w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-[10px] text-gray-400 border border-gray-600 shadow-inner">
                        LS V8
                     </div>
                     
                     {firingOrder.map((cyl, i) => {
                        // Arrange in circle
                        const angleViz = (i / 8) * 2 * Math.PI - Math.PI/2; 
                        const x = 50 + 40 * Math.cos(angleViz);
                        const y = 50 + 40 * Math.sin(angleViz);
                        
                        // Determine Active State
                        // We want to blink when the cylinder fires.
                        // Master angle runs 0-4PI (0-720 deg).
                        // Cylinder 1 fires at 360 deg (TDC Compression end).
                        // Cylinder 8 fires 90 deg later (450 deg).
                        
                        // We need to normalize master angle to 0-720 cycle.
                        const cyclePos = ((data.angle || 0) * 180 / Math.PI) % 720; 
                        // Normalize to positive
                        const masterDeg = cyclePos < 0 ? cyclePos + 720 : cyclePos;
                        
                        // The firing point for this cylinder in the 0-720 cycle
                        // Base firing is at 360 deg (TDC Power start).
                        // Offset shifts this point.
                        // Cyl 1 (Offset 0): Fires at 360.
                        // Cyl 8 (Offset 90): Fires at 360 + 90 = 450.
                        
                        const firePoint = (360 + firingAngles[cyl]) % 720;
                        
                        // Check if master is close to firePoint (e.g. within 45 deg window)
                        // Handle wrap-around (720->0) logic if needed (not for 450, but for late ones)
                        let dist = Math.abs(masterDeg - firePoint);
                        if (dist > 360) dist = 720 - dist; // Wrap distance
                        
                        const isFiring = dist < 30; // 30 deg flash window

                        return (
                          <div 
                            key={cyl}
                            className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-75
                                ${isFiring ? 'bg-yellow-400 border-yellow-200 text-black scale-125 shadow-[0_0_15px_rgba(250,204,21,1)] z-10' : 'bg-gray-800 border-gray-600 text-gray-600'}
                            `}
                            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                          >
                            {cyl}
                          </div>
                        )
                     })}
                  </div>
               </div>
            )}

            {/* Torque (Common) */}
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-green-400">Inst. Torque</span>
                <span>{Math.round(data.torque)} Nm</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20"></div>
                <div 
                  className={`h-full transition-all duration-75 absolute top-0 bottom-0 ${data.torque >= 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'}`} 
                  style={{ width: `${Math.min(50, Math.abs(data.torque) / (isV8 ? 100 : 10))}%` }} 
                />
              </div>
            </div>

            {/* PV Diagram (Piston Only) */}
            {!isV8 && (
              <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase">
                    <span>Thermodynamic Cycle</span>
                    <span>Otto (Adiabatic + Wiebe)</span>
                </div>
                <div className="relative w-full h-32 border-l border-b border-gray-600 bg-gray-900/50">
                    <div 
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-[16ms]"
                      style={{
                        left: `${((data.volume - 50) / 500) * 100}%`,
                        bottom: `${(data.pressure / 80) * 100}%`
                      }}
                    />
                    <div className="absolute text-[10px] text-gray-500 bottom-1 right-1">V</div>
                    <div className="absolute text-[10px] text-gray-500 top-1 left-2">P</div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};
