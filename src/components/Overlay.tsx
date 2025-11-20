import React from 'react';
import type { StrokePhase } from '../hooks/useEngineCycle';
import { Play, Pause, Eye, EyeOff, RotateCw, Activity } from 'lucide-react';
import { EngineStateOverlay } from './EngineStateOverlay';

interface OverlayProps {
  // Engine Mode
  engineType: 'Piston' | 'Rotary' | 'Electric' | 'V8';
  setEngineType: (type: 'Piston' | 'Rotary' | 'Electric' | 'V8') => void;
  
  // Simulation State
  phase: StrokePhase | string; 
  rpm: number;
  setRpm: (rpm: number) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  manualAngle: number;
  setManualAngle: (angle: number) => void;
  
  // View toggles
  showBlock: boolean;
  setShowBlock: (show: boolean) => void;
  showTelemetry: boolean;
  setShowTelemetry: (show: boolean) => void;
  
  // Full Data for Status Text
  telemetryData?: any;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  engineType, setEngineType,
  rpm, setRpm, 
  showBlock, setShowBlock, 
  showTelemetry, setShowTelemetry,
  isPaused, setIsPaused, 
  manualAngle, setManualAngle,
  telemetryData
}) => {
  
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Top Bar */}
      <div className="pointer-events-auto flex justify-between items-start">
        <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-lg">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <RotateCw className="w-6 h-6 text-yellow-400" />
            Engine Sim
          </h1>
          
          {/* Engine Switcher - Grid Layout */}
          <div className="grid grid-cols-4 bg-black/40 p-1 rounded-lg mt-4 gap-1">
             {(['Piston', 'Rotary', 'Electric', 'V8'] as const).map((type) => (
                <button 
                  key={type}
                  onClick={() => setEngineType(type)}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium transition ${engineType === type ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  {type === 'Piston' ? '4-Stroke' : type}
                </button>
             ))}
          </div>
        </div>
        
        <button 
          onClick={() => setShowTelemetry(!showTelemetry)}
          className={`pointer-events-auto p-3 rounded-full border transition ${showTelemetry ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/50 border-white/10 text-gray-400 hover:bg-white/20'}`}
          title="Toggle Telemetry"
        >
          <Activity size={24} />
        </button>
      </div>

    {/* Dynamic Engine Status Text (Removed from middle, moved to bottom container) */}
    {/* Bottom Controls */}
      <div className="pointer-events-auto bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-6">
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition text-white shrink-0"
          >
            {isPaused ? <Play fill="white" /> : <Pause fill="white" />}
          </button>

          <div className="flex-1 flex flex-col justify-center h-16 relative">
             {/* Automatic (RPM) */}
             <div className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ${isPaused ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between text-white mb-2">
                  <span className="text-sm font-medium text-gray-400">Speed</span>
                  <span className="font-mono font-bold">{rpm} RPM</span>
                </div>
                <input 
                  type="range" min="0" max="6000" step="10"
                  value={rpm}
                  onChange={(e) => setRpm(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
             </div>

             {/* Manual */}
             <div className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ${!isPaused ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between text-white mb-2">
                  <span className="text-sm font-medium text-blue-400">Manual Control</span>
                </div>
                <input 
                  type="range" min="0" max={4 * Math.PI} step="0.1"
                  value={manualAngle}
                  onChange={(e) => setManualAngle(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
             </div>
          </div>

          <button 
            onClick={() => setShowBlock(!showBlock)}
            className="flex flex-col items-center gap-1 text-white min-w-[60px] shrink-0"
          >
            <div className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition pointer-events-auto">
              {showBlock ? <Eye size={20} /> : <EyeOff size={20} />}
            </div>
            <span className="text-xs text-gray-400">Visible</span>
          </button>

        </div>
      </div>
      
      {/* Move Status Overlay Here to ensure visibility */}
      <div className="absolute bottom-32 left-0 w-full pointer-events-none">
         {telemetryData && (
            <EngineStateOverlay engineType={engineType} data={telemetryData} />
         )}
      </div>

    </div>
  );
};
