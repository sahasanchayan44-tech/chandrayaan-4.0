import { useState, useEffect } from 'react';
import LineChart from './LineChart';

export default function PropulsionTab({ isActive }) {
  const [fuel, setFuel] = useState(82.4);
  const [thrustData, setThrustData] = useState([590, 602, 595, 608, 600, 612, 597, 605, 599, 601]);

  // Simulate slow fuel burn & thrust output fluctuations
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setFuel(prev => Math.max(0, prev - 0.005));

      setThrustData(prev => {
        const next = [...prev.slice(1)];
        const noise = (Math.random() - 0.5) * 15;
        const newVal = Math.max(550, Math.min(650, prev[prev.length - 1] + noise));
        next.push(newVal);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      {/* Telemetry metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Propellant Level</span>
          <span className="text-sm font-bold text-cyan-300">{fuel.toFixed(3)}%</span>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1.5 border border-slate-800">
            <div className="bg-cyan-400 h-full" style={{ width: `${fuel}%` }}></div>
          </div>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Specific Impulse (Isp)</span>
          <span className="text-sm font-bold text-green-400">290.0 sec</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">BIPROPELLANT LIQUID ENGINE</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Delta-V Budget</span>
          <span className="text-sm font-bold text-cyan-300">420.5 m/s</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">TOTAL CAPACITY: 650 m/s</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Remaining Burn Time</span>
          <span className="text-sm font-bold text-cyan-300">{(fuel * 1.05).toFixed(1)} sec</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">FLOW VELOCITY: 0.42 kg/sec</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dynamic thrust curve chart */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            <i className="fa-solid fa-chart-area text-cyan-400 mr-1.5"></i>
            Real-Time Engine Thrust Output Curve
          </span>
          <LineChart data={thrustData} minVal={500} maxVal={700} color="#ffaa00" label="THRUST OUTPUT (N)" />
        </div>

        {/* Engine specs details panel */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">
              <i className="fa-solid fa-gears text-cyan-400 mr-1.5"></i>
              Bipropellant Assembly Specification
            </span>
            <div className="space-y-1.5 text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>Fuel composite:</span>
                <span className="text-slate-200">Monomethylhydrazine (MMH)</span>
              </div>
              <div className="flex justify-between">
                <span>Oxidizer cell:</span>
                <span className="text-slate-200">Nitrogen Tetroxide (N2O4)</span>
              </div>
              <div className="flex justify-between">
                <span>Diaphragm Pressure:</span>
                <span className="text-slate-200">320 bar (Stabilized)</span>
              </div>
              <div className="flex justify-between">
                <span>Combustion Pressure:</span>
                <span className="text-slate-200">12.5 MPa</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-2.5 flex items-center justify-between text-[9px] text-slate-500">
            <span>CALIBRATION CHECKLIST: PASSED</span>
            <span className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-green-400">THRUSTER ONLINE</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
