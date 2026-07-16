import { useState, useEffect } from 'react';
import LineChart from './LineChart';

export default function StructureTab() {
  const [stressData, setStressData] = useState([240, 241, 238, 243, 242, 239, 241, 240, 242, 243]);
  const [cog, setCog] = useState({ x: 0.02, y: -0.01, z: 0.45 });

  // Simulate structural stress vibration noise
  useEffect(() => {
    const interval = setInterval(() => {
      setStressData(prev => {
        const next = [...prev.slice(1)];
        const noise = (Math.random() - 0.5) * 4;
        const newVal = Math.max(220, Math.min(270, prev[prev.length - 1] + noise));
        next.push(newVal);
        return next;
      });

      setCog(prev => ({
        x: Math.max(-0.05, Math.min(0.05, prev.x + (Math.random() - 0.5) * 0.002)),
        y: Math.max(-0.05, Math.min(0.05, prev.y + (Math.random() - 0.5) * 0.002)),
        z: Math.max(0.44, Math.min(0.46, prev.z + (Math.random() - 0.5) * 0.001))
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Factor of Safety</span>
          <span className="text-sm font-bold text-green-400">1.62x</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">NOMINAL (LIMIT: 1.50)</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Peak Stress</span>
          <span className="text-sm font-bold text-cyan-300">{stressData[stressData.length - 1].toFixed(1)} MPa</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">LIMIT: 880 MPa (TITANIUM)</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">CoG Deviation</span>
          <span className="text-sm font-bold text-cyan-300">
            {Math.sqrt(cog.x**2 + cog.y**2).toFixed(3)} m
          </span>
          <span className="text-[8px] text-slate-500 block mt-0.5">LIMIT: &lt; 0.05m TOLERANCE</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Structural Weight</span>
          <span className="text-sm font-bold text-cyan-300">42.5 kg</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">CARBON COMPOSITE SHELL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Stress graph */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            <i className="fa-solid fa-waveform-path text-cyan-400 mr-1.5"></i>
            Structural Vibration & Stress Curve
          </span>
          <LineChart data={stressData} minVal={200} maxVal={300} color="#00e5ff" label="VIBRATION STRESS (MPa)" />
        </div>

        {/* CoG and Mass Distribution details */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-3 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
              <i className="fa-solid fa-crosshairs text-cyan-400 mr-1.5"></i>
              Center of Gravity Coordinates
            </span>
            <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-950/30 p-2 rounded border border-slate-900/50">
              <div>
                <span className="text-slate-500 block">X-AXIS</span>
                <span className="font-bold text-slate-200">{cog.x.toFixed(4)} m</span>
              </div>
              <div>
                <span className="text-slate-500 block">Y-AXIS</span>
                <span className="font-bold text-slate-200">{cog.y.toFixed(4)} m</span>
              </div>
              <div>
                <span className="text-slate-500 block">Z-AXIS</span>
                <span className="font-bold text-slate-200">{cog.z.toFixed(4)} m</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900/60 pt-2.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
              <i className="fa-solid fa-chart-pie text-cyan-400 mr-1.5"></i>
              Mass Distribution Stack
            </span>
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between mb-0.5 text-slate-400">
                  <span>Carbon Composite Skeleton Frame</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[45%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5 text-slate-400">
                  <span>Propellant & Fuel System</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full w-[40%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-0.5 text-slate-400">
                  <span>Avionics Guidance & Payload Box</span>
                  <span>15%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-[15%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
