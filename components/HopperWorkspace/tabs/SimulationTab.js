import LineChart from './LineChart';

export default function SimulationTab({
  simStatus,
  setSimStatus,
  simSpeed,
  setSimSpeed,
  simTime,
  setSimTime,
  simHistory,
  resetSimulation
}) {
  const togglePlay = () => {
    if (simStatus === 'running') {
      setSimStatus('paused');
    } else {
      setSimStatus('running');
    }
  };

  const currentAlt = simHistory.altitude[simHistory.altitude.length - 1] || 0;
  const currentVel = simHistory.velocity[simHistory.velocity.length - 1] || 0;
  const currentAcc = simHistory.acceleration[simHistory.acceleration.length - 1] || 0;
  const currentFuel = simHistory.fuel[simHistory.fuel.length - 1] || 100;
  const currentPower = simHistory.power[simHistory.power.length - 1] || 45;
  const currentTemp = simHistory.temperature[simHistory.temperature.length - 1] || 25;
  const currentThrust = simHistory.thrust[simHistory.thrust.length - 1] || 0;

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      {/* Simulation Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-2.5 bg-slate-950/80 border border-slate-900 rounded gap-3 shrink-0 select-none">
        
        {/* Play / Pause / Reset controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={togglePlay}
            className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center space-x-1.5 ${simStatus === 'running' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}
          >
            <i className={`fa-solid ${simStatus === 'running' ? 'fa-pause' : 'fa-play'}`}></i>
            <span>{simStatus === 'running' ? 'PAUSE' : 'PLAY'}</span>
          </button>
          
          <button 
            onClick={resetSimulation}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-bold text-slate-300 transition-colors cursor-pointer flex items-center space-x-1.5"
            title="Reset Simulation"
          >
            <i className="fa-solid fa-rotate-left"></i>
            <span>RESET</span>
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 flex items-center space-x-3">
          <span className="text-[9px] text-slate-500 uppercase font-bold shrink-0">Timeline</span>
          <div className="flex-1 relative flex items-center">
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={simTime}
              onChange={(e) => {
                setSimStatus('paused');
                setSimTime(parseInt(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            {/* Tooltip */}
            <span className="text-[9px] text-cyan-400 font-bold ml-2 shrink-0 w-8 text-right">
              {simTime}%
            </span>
          </div>
        </div>

        {/* Speed Multiplier */}
        <div className="flex items-center space-x-1.5 bg-slate-950/40 p-0.5 border border-slate-800/80 rounded">
          <span className="text-[9px] text-slate-500 uppercase font-bold px-1.5">Speed</span>
          {[1, 2, 5, 10].map(multiplier => (
            <button
              key={multiplier}
              onClick={() => setSimSpeed(multiplier)}
              className={`px-2 py-1 text-[9px] font-bold rounded transition-colors cursor-pointer ${simSpeed === multiplier ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              {multiplier}x
            </button>
          ))}
        </div>

      </div>

      {/* Physics State Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Altitude</span>
          <span className="text-xs font-bold text-cyan-300">{currentAlt.toFixed(1)} m</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Velocity</span>
          <span className="text-xs font-bold text-cyan-300">{currentVel.toFixed(2)} m/s</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Acceleration</span>
          <span className="text-xs font-bold text-cyan-300">{currentAcc.toFixed(2)} m/s²</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Fuel Mass</span>
          <span className="text-xs font-bold text-cyan-300">{currentFuel.toFixed(1)} kg</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Power load</span>
          <span className="text-xs font-bold text-cyan-300">{currentPower.toFixed(1)} W</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Temperature</span>
          <span className="text-xs font-bold text-cyan-300">{currentTemp.toFixed(1)} °C</span>
        </div>
        <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
          <span className="text-[9px] text-slate-500 block">Thrust</span>
          <span className="text-xs font-bold text-cyan-300">{currentThrust.toFixed(0)} N</span>
        </div>
      </div>

      {/* Physics Graphs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <LineChart data={simHistory.altitude} minVal={0} maxVal={200} color="#00e5ff" label="Altitude (m)" />
        <LineChart data={simHistory.velocity} minVal={-25} maxVal={25} color="#00ff66" label="Velocity (m/s)" />
        <LineChart data={simHistory.acceleration} minVal={-2.0} maxVal={2.0} color="#ffaa00" label="Acceleration (m/s²)" />
        <LineChart data={simHistory.fuel} minVal={0} maxVal={100} color="#ff3366" label="Fuel (kg)" />
        <LineChart data={simHistory.power} minVal={35} maxVal={75} color="#00ff66" label="Power (W)" />
        <LineChart data={simHistory.temperature} minVal={20} maxVal={400} color="#ff3366" label="Temperature (°C)" />
        <LineChart data={simHistory.thrust} minVal={0} maxVal={700} color="#ffaa00" label="Thrust (N)" />
      </div>
    </div>
  );
}
