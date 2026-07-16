import { useState, useEffect } from 'react';
import { HopperRepository } from '../../../app/HopperRepository';

export default function VersionsTab({
  activeVersionId,
  onRollback
}) {
  const [versions, setVersions] = useState([]);
  const [compareA, setCompareA] = useState('V3');
  const [compareB, setCompareB] = useState('V4');
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Subscribe to Firestore versions
  useEffect(() => {
    const unsubscribe = HopperRepository.subscribeVersions((data) => {
      // Sort V1 -> V4
      const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id));
      setVersions(sorted);
    });
    return () => unsubscribe();
  }, []);

  const getActiveVersion = () => {
    return versions.find(v => v.id === activeVersionId) || versions[versions.length - 1];
  };

  const current = getActiveVersion();

  // Highlight comparison differences
  const renderCompareRow = (label, key) => {
    const verA = versions.find(v => v.id === compareA);
    const verB = versions.find(v => v.id === compareB);
    if (!verA || !verB) return null;

    const diff = verA[key] !== verB[key];

    return (
      <tr key={key} className={`border-b border-slate-900/50 ${diff ? 'bg-amber-500/5' : ''}`}>
        <td className="p-2 font-bold text-slate-400 text-[10px] uppercase w-1/4">{label}</td>
        <td className={`p-2 font-mono text-[10px] ${diff ? 'text-amber-300' : 'text-slate-300'}`}>
          {verA[key]}
        </td>
        <td className={`p-2 font-mono text-[10px] ${diff ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
          {verB[key]}
        </td>
      </tr>
    );
  };

  // SVG Thumbnail renderers based on version ID
  const renderVersionThumbnail = (id) => {
    const colors = {
      V1: '#10b981', // green
      V2: '#f59e0b', // amber
      V3: '#ef4444', // red
      V4: '#06b6d4'  // cyan
    };
    const accent = colors[id] || '#06b6d4';

    return (
      <svg className="w-full h-16 bg-slate-950/80 rounded border border-slate-900" viewBox="0 0 100 50">
        <line x1="50" y1="5" x2="30" y2="35" stroke={accent} strokeWidth="1" strokeOpacity="0.5" />
        <line x1="50" y1="5" x2="70" y2="35" stroke={accent} strokeWidth="1" strokeOpacity="0.5" />
        <line x1="30" y1="35" x2="70" y2="35" stroke={accent} strokeWidth="1" />
        <circle cx="50" cy="5" r="3" fill={accent} className="animate-pulse" />
        {/* Legs */}
        <line x1="30" y1="35" x2="20" y2="45" stroke={accent} strokeWidth="1.5" />
        <line x1="70" y1="35" x2="80" y2="45" stroke={accent} strokeWidth="1.5" />
        {/* Fuel Tank sphere */}
        <circle cx="50" cy="22" r="8" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="2 2" />
        <text x="5" y="12" fill={accent} fontSize="6" fontWeight="bold" fontFamily="monospace">{id}</text>
      </svg>
    );
  };

  return (
    <div className="p-3 font-mono text-xs text-slate-300 space-y-4 h-full overflow-y-auto">
      
      {/* Header controls */}
      <div className="flex items-center justify-between p-2 bg-slate-900/40 border border-slate-800 rounded">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-code-branch text-cyan-400 text-sm"></i>
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Product Data Management (PDM) Version Control
          </span>
        </div>
        <button
          onClick={() => setIsCompareMode(!isCompareMode)}
          className={`btn !py-1.5 !px-3 !text-[10px] flex items-center space-x-1.5 ${isCompareMode ? 'btn-primary' : 'btn-secondary'}`}
        >
          <i className="fa-solid fa-code-compare"></i>
          <span>{isCompareMode ? 'CLOSE COMPARISON' : 'COMPARE VERSIONS'}</span>
        </button>
      </div>

      {isCompareMode ? (
        /* COMPARISON DIFF VIEW */
        <div className="bg-slate-950/60 border border-slate-900 rounded p-3 space-y-3">
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-slate-500 uppercase font-bold">Compare:</span>
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.12)] transition-all"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.message.substring(0, 30)}...</option>
              ))}
            </select>
            <span className="text-slate-500 font-bold">VS</span>
            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,242,254,0.12)] transition-all"
            >
              {versions.map(v => (
                <option key={v.id} value={v.id}>{v.id} - {v.message.substring(0, 30)}...</option>
              ))}
            </select>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30 text-[9px] text-slate-500 uppercase">
                <th className="p-2">Specification</th>
                <th className="p-2">Source ({compareA})</th>
                <th className="p-2">Target ({compareB})</th>
              </tr>
            </thead>
            <tbody>
              {renderCompareRow('Author', 'author')}
              {renderCompareRow('Timestamp', 'date')}
              {renderCompareRow('Commit Message', 'message')}
              {renderCompareRow('Thrust Rating', 'thrust')}
              {renderCompareRow('Dry Mass', 'dryMass')}
              {renderCompareRow('Wet Mass', 'wetMass')}
              {renderCompareRow('Specific Impulse', 'isp')}
              {renderCompareRow('Max Altitude', 'maxAltitude')}
              {renderCompareRow('Change Logs', 'changeLog')}
            </tbody>
          </table>
        </div>
      ) : (
        /* MAIN VERSIONS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {versions.map((ver) => {
            const isActive = ver.id === activeVersionId;
            return (
              <div 
                key={ver.id}
                className={`bg-slate-950/60 border rounded p-3 flex flex-col justify-between space-y-3 transition-all ${isActive ? 'border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.15)]' : 'border-slate-900 hover:border-slate-800'}`}
              >
                <div className="space-y-2">
                  {renderVersionThumbnail(ver.id)}
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{ver.id} Assembly</span>
                    {isActive ? (
                      <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-cyan-500/20">
                        ACTIVE STATE
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-500">TAGGED RELEASE</span>
                    )}
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Author:</span>
                      <span className="text-slate-300 font-medium">{ver.author.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="text-slate-300">{ver.date.split(' ')[0]}</span>
                    </div>
                    <div className="border-t border-slate-900 my-1 pt-1.5">
                      <span className="text-slate-500 block text-[9px] uppercase font-bold">Message:</span>
                      <p className="text-slate-300 italic text-[10px] line-clamp-2 mt-0.5">"{ver.message}"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <div className="text-[9px] text-slate-500">
                    <span className="font-bold block uppercase">Change log:</span>
                    <span className="line-clamp-2 text-slate-400 mt-0.5">{ver.changeLog}</span>
                  </div>
                  
                  <button
                    disabled={isActive}
                    onClick={() => onRollback(ver)}
                    className={`btn w-full !py-1 !px-2 !text-[9px] ${isActive ? 'btn-secondary !text-slate-600 cursor-not-allowed opacity-50' : 'btn-primary'}`}
                  >
                    ROLLBACK ASSEMBLY
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
