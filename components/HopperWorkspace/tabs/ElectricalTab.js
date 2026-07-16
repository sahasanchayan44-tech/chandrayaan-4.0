import { useState, useEffect } from 'react';
import LineChart from './LineChart';

export default function ElectricalTab({ isActive }) {
  const [batteryCharge, setBatteryCharge] = useState(94.2);
  const [voltageHistory, setVoltageHistory] = useState([28.1, 28.2, 28.1, 28.3, 28.2, 28.1, 28.2, 28.3, 28.1, 28.2]);

  // Simulate dynamic power consumption
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      // Slowly fluctuate battery charge based on solar intake (+0.002) vs computer consumption (-0.001)
      setBatteryCharge(prev => Math.max(0, Math.min(100, prev + 0.001)));

      setVoltageHistory(prev => {
        const next = [...prev.slice(1)];
        // Voltage fluctuations around 28.2V bus
        const noise = (Math.random() - 0.5) * 0.15;
        const newVal = Math.max(27.5, Math.min(29.0, 28.2 + noise));
        next.push(newVal);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Battery Charge (SoC)</span>
          <span className="text-sm font-bold text-green-400">{batteryCharge.toFixed(3)}%</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">SOLID-STATE LI-SULFUR CHEM</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Bus Voltage</span>
          <span className="text-sm font-bold text-cyan-300">{voltageHistory[voltageHistory.length - 1].toFixed(2)} V</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">STABILIZED 28V PRIMARY BUS</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Solar Array Output</span>
          <span className="text-sm font-bold text-yellow-400">+2.84 A</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">120W PHOTOVOLTAIC RATING</span>
        </div>
        <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block uppercase">Current Load</span>
          <span className="text-sm font-bold text-cyan-300">4.18 A</span>
          <span className="text-[8px] text-slate-500 block mt-0.5">AVIONICS & CORE TRANSMITTERS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dynamic Voltage Stability chart */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            <i className="fa-solid fa-bolt-lightning text-cyan-400 mr-1.5"></i>
            Primary DC Bus Voltage stability
          </span>
          <LineChart data={voltageHistory} minVal={27.0} maxVal={29.5} color="#00e5ff" label="BUS VOLTAGE (V)" />
        </div>

        {/* Power Flow visual connections */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-3 flex flex-col justify-between min-h-[180px]">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2.5">
            <i className="fa-solid fa-circle-nodes text-cyan-400 mr-1.5"></i>
            Core Power Flow Architecture
          </span>

          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Solar Panels ➡️ Main Battery Charge</span>
              <span className="text-green-400 font-bold font-mono">+79.5 W [ACTIVE]</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Battery Cell ➡️ Avionics System Board</span>
              <span className="text-red-400 font-bold font-mono">-45.2 W [DRAIN]</span>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-slate-950/40 border border-slate-900 rounded">
              <span className="text-slate-400">Battery Cell ➡️ RF Transmitters & S-Band</span>
              <span className="text-red-400 font-bold font-mono">-18.4 W [DRAIN]</span>
            </div>
          </div>

          <div className="border-t border-slate-900/60 pt-2.5 flex items-center justify-between text-[8px] text-slate-500 font-mono">
            <span>GRID EFFICIENCY: 94.2%</span>
            <span className="text-green-400 font-bold">GRID NOMINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
