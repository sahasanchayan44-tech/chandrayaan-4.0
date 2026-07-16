import { useState, useEffect } from 'react';
import LineChart from './LineChart';

export default function ThermalTab() {
  const [temps, setTemps] = useState({
    combustion: 350.2,
    fuelTank: 18.5,
    avionics: 32.4,
    solarArray: 78.1
  });

  const [chamberHistory, setChamberHistory] = useState([348, 351, 349, 352, 350, 353, 351, 349, 352, 350]);

  // Simulate temperature fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTemps(prev => ({
        combustion: Math.max(340, Math.min(365, prev.combustion + (Math.random() - 0.5) * 3)),
        fuelTank: Math.max(16, Math.min(21, prev.fuelTank + (Math.random() - 0.5) * 0.4)),
        avionics: Math.max(30, Math.min(35, prev.avionics + (Math.random() - 0.5) * 0.2)),
        solarArray: Math.max(75, Math.min(82, prev.solarArray + (Math.random() - 0.5) * 0.8))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update history based on combustion temp updates
  useEffect(() => {
    setChamberHistory(prev => {
      const next = [...prev.slice(1)];
      next.push(temps.combustion);
      return next;
    });
  }, [temps.combustion]);

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Combustion Chamber</span>
          <span className="text-sm font-bold text-red-400">{temps.combustion.toFixed(1)}°C</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">VACUUM THRESHOLD: +450°C</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Propellant Tank</span>
          <span className="text-sm font-bold text-green-400">{temps.fuelTank.toFixed(1)}°C</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">LIQUID RANGE: -5°C / +35°C</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Avionics Core</span>
          <span className="text-sm font-bold text-cyan-300">{temps.avionics.toFixed(1)}°C</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">HEATER RANGE: +10°C / +45°C</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Solar Mesh Array</span>
          <span className="text-sm font-bold text-yellow-400">{temps.solarArray.toFixed(1)}°C</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">EXPOSURE SHIELD LIMIT: +120°C</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heat Map Schematic representation */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-3 flex flex-col justify-between min-h-[180px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3">
            <i className="fa-solid fa-fire-flame-curved text-cyan-400 mr-1.5"></i>
            Hopper Thermal Node Heat Map
          </span>

          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Node [A-1] - Thrusters Nozzle Shell</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${temps.combustion > 355 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-red-500/10 text-red-300'}`}>
                {temps.combustion.toFixed(1)}°C [HOT]
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Node [M-3] - Li-Sulfur battery enclosure</span>
              <span className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {temps.avionics.toFixed(1)}°C [STABLE]
              </span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Node [F-2] - Titanium Diaphragm tank</span>
              <span className="bg-green-500/10 text-green-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {temps.fuelTank.toFixed(1)}°C [NOMINAL]
              </span>
            </div>
          </div>
        </div>

        {/* Live temperature graph */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            <i className="fa-solid fa-chart-line text-cyan-400 mr-1.5"></i>
            Active Combustion Chamber Temp Graph
          </span>
          <LineChart data={chamberHistory} minVal={300} maxVal={400} color="#ff3366" label="CHAMBER DEFORMATION TEMP (°C)" />
        </div>
      </div>
    </div>
  );
}
