import { useEffect, useRef } from 'react';

export const useEngineSound = (rpm: number, engineType: 'Piston' | 'Rotary' | 'Electric' | 'V8', isPaused: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  // const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  // const noiseGainRef = useRef<GainNode | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        // Master Gain
        const gain = audioContextRef.current.createGain();
        gain.connect(audioContextRef.current.destination);
        gainNodeRef.current = gain;

        // Noise Buffer (for combustion rumble / air hiss)
        const bufferSize = audioContextRef.current.sampleRate * 2; // 2 seconds
        const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        // Noise Source setup (recreated on loop usually, but let's keep it simple)
        // Actually noise needs to be looped
      }
    };
    initAudio();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Engine Sound Synthesis Logic
  useEffect(() => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Mute if paused or 0 RPM
    if (isPaused || rpm < 10) {
      gainNodeRef.current.gain.setTargetAtTime(0, now, 0.1);
      return;
    } else {
      gainNodeRef.current.gain.setTargetAtTime(0.3, now, 0.1);
    }

    // Cleanup old oscillators
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch(e) {}
    });
    oscillatorsRef.current = [];

    // Create new oscillators based on engine type
    const baseFreq = rpm / 60; // Hz (Revolutions per second)

    if (engineType === 'Electric') {
      // Inverter Whine (High harmonic) + Fundamental
      // 1. Fundamental (Pole pairs * RPM)
      const fund = ctx.createOscillator();
      fund.type = 'sine';
      fund.frequency.value = baseFreq * 3; // 3 pole pairs
      
      // 2. PWM Carrier whine (simplified as high harmonic)
      const whine = ctx.createOscillator();
      whine.type = 'triangle';
      whine.frequency.value = baseFreq * 3 * 12; // 12th harmonic
      
      const whineGain = ctx.createGain();
      whineGain.gain.value = 0.1;

      fund.connect(gainNodeRef.current);
      whine.connect(whineGain);
      whineGain.connect(gainNodeRef.current);
      
      fund.start();
      whine.start();
      oscillatorsRef.current.push(fund, whine);
    } 
    else if (engineType === 'V8') {
      // V8 Rumble: 4 combustion events per rev (Crossplane irregular feel)
      // Fundamental firing freq = RPM/60 * 4
      const firingFreq = baseFreq * 4;
      
      // Sub-harmonics for "rumble"
      const sub = ctx.createOscillator();
      sub.type = 'sawtooth'; // Sawtooth has buzz
      sub.frequency.value = firingFreq / 2; // Half firing freq gives deep rumble
      
      const main = ctx.createOscillator();
      main.type = 'square'; // Square is punchy
      main.frequency.value = firingFreq;

      // Filter to muffle it
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200 + (rpm * 0.5); // Open up filter with RPM

      sub.connect(filter);
      main.connect(filter);
      filter.connect(gainNodeRef.current);

      sub.start();
      main.start();
      oscillatorsRef.current.push(sub, main);
    }
    else { // Piston / Rotary
      // Single cylinder / Rotor
      const freq = engineType === 'Rotary' ? baseFreq * 3 : baseFreq * 0.5; // Rotary: 3 pulses/rev output? No, 1 per rev of rotor? 
      // Rotary output shaft spins 3x rotor. 1 combustion per shaft rev.
      
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 100 + rpm;

      osc.connect(filter);
      filter.connect(gainNodeRef.current);
      osc.start();
      oscillatorsRef.current.push(osc);
    }

  }, [engineType, isPaused]); // Re-setup on type change. 
  // Note: Changing RPM continuously shouldn't re-create oscs, just update freq.
  // But React hooks make this tricky. 
  // Optimization: Store oscs in Ref and update `frequency.value` in a separate useEffect dependent on RPM.

  // RPM Update Effect
  useEffect(() => {
    if (isPaused || rpm < 10) return;
    const baseFreq = rpm / 60;
    const ctx = audioContextRef.current;
    if (!ctx) return;

    oscillatorsRef.current.forEach((osc, i) => {
       if (engineType === 'Electric') {
          if (i === 0) osc.frequency.setTargetAtTime(baseFreq * 3, ctx.currentTime, 0.1);
          if (i === 1) osc.frequency.setTargetAtTime(baseFreq * 3 * 12, ctx.currentTime, 0.1);
       } else if (engineType === 'V8') {
          const firingFreq = baseFreq * 4;
          if (i === 0) osc.frequency.setTargetAtTime(firingFreq / 2, ctx.currentTime, 0.1);
          if (i === 1) osc.frequency.setTargetAtTime(firingFreq, ctx.currentTime, 0.1);
       } else {
          const freq = engineType === 'Rotary' ? baseFreq * 1 : baseFreq * 0.5;
          osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
       }
    });
  }, [rpm, engineType, isPaused]);

};

