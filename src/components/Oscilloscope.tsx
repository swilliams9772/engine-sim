import React, { useRef, useEffect } from 'react';

interface OscilloscopeProps {
  dataPoints: number[]; // Array of latest values to append (multichannel supported if we pass array of arrays, but let's stick to single or triplet)
  colors: string[];
  label: string;
  min: number;
  max: number;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ dataPoints, colors, label, min, max }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store history in a ref so it persists across renders without causing re-renders
  const historyRef = useRef<number[][]>(colors.map(() => Array(100).fill(0))); // 100 points history

  useEffect(() => {
    // Update history
    dataPoints.forEach((val, i) => {
      if (historyRef.current[i]) {
        historyRef.current[i].push(val);
        if (historyRef.current[i].length > 100) historyRef.current[i].shift();
      }
    });

    // Draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);
    
    // Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.stroke();

    // Plot lines
    historyRef.current.forEach((lineData, lineIdx) => {
      ctx.strokeStyle = colors[lineIdx] || '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      lineData.forEach((val, xIdx) => {
        const x = (xIdx / 100) * w;
        // Map value min..max to h..0 (canvas Y is inverted)
        const normalized = (val - min) / (max - min); 
        const y = h - (normalized * h);
        
        if (xIdx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

  }, [dataPoints, colors, min, max]); // Dependency on latest data point triggers redraw

  return (
    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
        <div className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">{label}</div>
        <canvas ref={canvasRef} width={280} height={80} className="w-full h-20 bg-gray-900/50 rounded" />
    </div>
  );
};

