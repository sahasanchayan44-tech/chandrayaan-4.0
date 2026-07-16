export default function CadTab({
  currentDesign,
  activeHopperTab,
  canvasV1Ref,
  canvasV2Ref,
  canvasV3Ref,
  handleCadMouseDown,
  handleCadMouseMove,
  handleCadMouseUp,
  cadOrbit,
  setCadOrbit,
  cadWireframe,
  setCadWireframe,
  cadExploded,
  setCadExploded
}) {
  const getActiveCanvasRef = () => {
    if (activeHopperTab === 'v1') return canvasV1Ref;
    if (activeHopperTab === 'v2') return canvasV2Ref;
    return canvasV3Ref;
  };

  return (
    <div className="w-full h-full relative flex flex-col min-h-[300px] overflow-hidden">
      {/* Viewport details overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none select-none font-mono">
        <span className="text-sm font-bold text-cyan-400 uppercase tracking-wide">{currentDesign.name}</span>
        <span className="text-[10px] text-slate-400 mt-0.5">MASS: DRY {currentDesign.dryMass} / WET {currentDesign.wetMass}</span>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none select-none text-right font-mono text-[9px] text-slate-500 space-y-0.5">
        <div>VERTICES: {activeHopperTab === 'v1' ? '2,408' : activeHopperTab === 'v2' ? '1,840' : '3,120'}</div>
        <div>ENGINE: HTML5 WIREFRAME</div>
        <div>FPS: 60 (STABLE)</div>
      </div>

      {/* Actual CAD canvas rendering */}
      <div className="w-full h-full relative bg-slate-950/80 flex-1">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.04),transparent)]"></div>
        
        <canvas
          ref={getActiveCanvasRef()}
          onMouseDown={handleCadMouseDown}
          onMouseMove={handleCadMouseMove}
          onMouseUp={handleCadMouseUp}
          onMouseLeave={handleCadMouseUp}
          className="w-full h-full block relative cursor-grab active:cursor-grabbing z-0"
        />

        {/* Viewport bottom toolbar overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-1.5 bg-slate-950/80 border border-slate-800 rounded p-1">
            <button 
              onClick={() => setCadOrbit(!cadOrbit)}
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer flex items-center space-x-1 ${cadOrbit ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fa-solid fa-rotate"></i>
              <span>{cadOrbit ? 'ORBIT LOCK' : 'FREE ORBIT'}</span>
            </button>
            <button 
              onClick={() => setCadWireframe(!cadWireframe)}
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer flex items-center space-x-1 ${cadWireframe ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fa-solid fa-circle-nodes"></i>
              <span>{cadWireframe ? 'SOLID VIEW' : 'WIREFRAME'}</span>
            </button>
            <button 
              onClick={() => setCadExploded(!cadExploded)}
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors cursor-pointer flex items-center space-x-1 ${cadExploded ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fa-solid fa-cubes"></i>
              <span>{cadExploded ? 'COLLAPSE' : 'EXPLODE'}</span>
            </button>
          </div>

          <a 
            href="https://viewer.autodesk.com/" 
            target="_blank" 
            rel="noreferrer" 
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-mono text-[10px] rounded transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <i className="fa-solid fa-cube"></i>
            <span>CAD 360 VIEW</span>
          </a>
        </div>
      </div>
    </div>
  );
}
