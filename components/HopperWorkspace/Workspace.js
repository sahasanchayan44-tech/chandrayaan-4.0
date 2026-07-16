import { useState, useEffect, useRef, useCallback } from 'react';
import ComponentTree from './ComponentTree';

export default function HopperWorkspace({
  activeHopperTab,
  setActiveHopperTab,
  hopperDesigns,
  cadOrbit,
  setCadOrbit,
  cadWireframe,
  setCadWireframe,
  cadExploded,
  setCadExploded,
  canvasV1Ref,
  canvasV2Ref,
  canvasV3Ref,
  handleCadMouseDown,
  handleCadMouseMove,
  handleCadMouseUp
}) {
  const currentDesign = hopperDesigns.find(d => d.id === activeHopperTab) || hopperDesigns[0];

  // UI State management
  const [selectedNode, setSelectedNode] = useState(null);
  const [breadcrumbText, setBreadcrumbText] = useState('');

  // Panel collapsed states
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);

  // Resizable panel dimensions
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(280);
  const [bottomHeight, setBottomHeight] = useState(180);

  // Bottom tabs active index
  const [activeBottomTab, setActiveBottomTab] = useState('console');
  
  // Docking preference
  const [isBottomDocked, setIsBottomDocked] = useState(true);

  // Resize refs
  const containerRef = useRef(null);
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);
  const isResizingBottom = useRef(false);

  // Default select first component stack item if none selected
  useEffect(() => {
    if (currentDesign && currentDesign.stack && currentDesign.stack.length > 0) {
      setSelectedNode(currentDesign.stack[0]);
    }
  }, [currentDesign]);

  // Mouse move resizing handlers
  const startResizeLeft = useCallback((e) => {
    e.preventDefault();
    isResizingLeft.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  const startResizeRight = useCallback((e) => {
    e.preventDefault();
    isResizingRight.current = true;
    document.body.style.cursor = 'col-resize';
  }, []);

  const startResizeBottom = useCallback((e) => {
    e.preventDefault();
    isResizingBottom.current = true;
    document.body.style.cursor = 'row-resize';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizingLeft.current) {
        const newWidth = Math.max(180, Math.min(400, e.clientX - containerRect.left));
        setLeftWidth(newWidth);
      }
      if (isResizingRight.current) {
        const newWidth = Math.max(200, Math.min(450, containerRect.right - e.clientX));
        setRightWidth(newWidth);
      }
      if (isResizingBottom.current) {
        const newHeight = Math.max(100, Math.min(350, containerRect.bottom - e.clientY));
        setBottomHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      isResizingLeft.current = false;
      isResizingRight.current = false;
      isResizingBottom.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Safe canvas ref fetcher
  const getActiveCanvasRef = () => {
    if (activeHopperTab === 'v1') return canvasV1Ref;
    if (activeHopperTab === 'v2') return canvasV2Ref;
    return canvasV3Ref;
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/20 text-slate-200 border border-cyan-500/20 rounded-lg overflow-hidden">
      {/* breadcrumbs header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-cyan-500/20 text-xs tracking-wider">
        <div className="flex items-center space-x-2 text-cyan-400">
          <i className="fa-solid fa-microchip"></i>
          <span>CHANDRAYAAN_4</span>
          <span className="text-slate-500">/</span>
          <span>HOPPER_IDE</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 font-bold uppercase">{breadcrumbText || `${currentDesign.id.toUpperCase()} DESIGN`}</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-green-400 font-mono">DOCK STATE: LOCKED</span>
          </span>
          <button 
            onClick={() => setIsBottomDocked(!isBottomDocked)}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
            title="Toggle Bottom Panel Placement"
          >
            <i className={`fa-solid ${isBottomDocked ? 'fa-window-maximize' : 'fa-window-restore'}`}></i>
          </button>
        </div>
      </div>

      {/* Main IDE Area */}
      <div ref={containerRef} className="flex flex-row flex-1 min-h-[500px] w-full relative overflow-hidden">
        
        {/* LEFT PANEL: Component Tree */}
        <div 
          style={{ width: leftCollapsed ? '40px' : `${leftWidth}px` }}
          className="flex flex-col bg-slate-950/40 border-r border-cyan-500/10 relative transition-all duration-200 shrink-0"
        >
          {leftCollapsed ? (
            <div className="flex flex-col items-center py-4 space-y-6 text-slate-400">
              <button onClick={() => setLeftCollapsed(false)} className="hover:text-cyan-400 cursor-pointer">
                <i className="fa-solid fa-angles-right"></i>
              </button>
              <i className="fa-solid fa-sitemap" title="Component Tree"></i>
            </div>
          ) : (
            <ComponentTree 
              onSelectNode={setSelectedNode} 
              onBreadcrumbChange={setBreadcrumbText} 
            />
          )}

          {/* Left panel resize handle */}
          {!leftCollapsed && (
            <div 
              onMouseDown={startResizeLeft}
              className="absolute top-0 right-0 w-1 h-full hover:bg-cyan-500/50 cursor-col-resize active:bg-cyan-500 transition-colors z-20"
            />
          )}
        </div>

        {/* CENTER PANEL: CAD Viewport + Bottom Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
          
          {/* Viewport content area */}
          <div className="flex-1 min-h-[300px] flex flex-col relative overflow-hidden">
            
            {/* Viewport details overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none select-none">
              <span className="text-sm font-bold text-cyan-400 uppercase tracking-wide">{currentDesign.name}</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">MASS: DRY {currentDesign.dryMass} / WET {currentDesign.wetMass}</span>
            </div>

            <div className="absolute top-4 right-4 z-10 pointer-events-none select-none text-right font-mono text-[9px] text-slate-500 space-y-0.5">
              <div>VERTICES: {activeHopperTab === 'v1' ? '2,408' : activeHopperTab === 'v2' ? '1,840' : '3,120'}</div>
              <div>ENGINE: HTML5 WIREFRAME</div>
              <div>FPS: 60 (STABLE)</div>
            </div>

            {/* Actual CAD canvas rendering */}
            <div className="w-full h-full relative bg-slate-950/80">
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

          {/* BOTTOM PANEL: tabbed console/logs/materials */}
          {isBottomDocked && (
            <div 
              style={{ height: bottomCollapsed ? '32px' : `${bottomHeight}px` }}
              className="flex flex-col bg-slate-950/60 border-t border-cyan-500/10 relative transition-all duration-200"
            >
              {/* Bottom Resizer divider */}
              {!bottomCollapsed && (
                <div 
                  onMouseDown={startResizeBottom}
                  className="absolute top-0 left-0 w-full h-1 hover:bg-cyan-500/50 cursor-row-resize active:bg-cyan-500 transition-colors z-20"
                />
              )}

              {/* Bottom headers */}
              <div className="flex items-center justify-between px-3 h-8 bg-slate-900/60 border-b border-cyan-500/10 shrink-0">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold font-mono tracking-wider">
                  <button 
                    onClick={() => { setActiveBottomTab('console'); setBottomCollapsed(false); }}
                    className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'console' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <i className="fa-solid fa-terminal mr-1"></i> CONSOLE
                  </button>
                  <button 
                    onClick={() => { setActiveBottomTab('logs'); setBottomCollapsed(false); }}
                    className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'logs' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <i className="fa-solid fa-list mr-1"></i> LOGS
                  </button>
                  <button 
                    onClick={() => { setActiveBottomTab('simulation'); setBottomCollapsed(false); }}
                    className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'simulation' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <i className="fa-solid fa-gauge-high mr-1"></i> SIMULATION
                  </button>
                  <button 
                    onClick={() => { setActiveBottomTab('materials'); setBottomCollapsed(false); }}
                    className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'materials' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <i className="fa-solid fa-flask mr-1"></i> MATERIALS
                  </button>
                  <button 
                    onClick={() => { setActiveBottomTab('mission'); setBottomCollapsed(false); }}
                    className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'mission' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                  >
                    <i className="fa-solid fa-satellite-dish mr-1"></i> MISSION OUTPUT
                  </button>
                </div>

                <button 
                  onClick={() => setBottomCollapsed(!bottomCollapsed)}
                  className="p-1 text-[10px] text-slate-400 hover:text-cyan-400 cursor-pointer"
                >
                  <i className={`fa-solid ${bottomCollapsed ? 'fa-angles-up' : 'fa-angles-down'}`}></i>
                </button>
              </div>

              {/* Bottom panels contents */}
              {!bottomCollapsed && (
                <div className="flex-1 overflow-y-auto p-3 text-xs font-mono text-slate-300 bg-slate-950/30">
                  
                  {activeBottomTab === 'console' && (
                    <div className="space-y-1.5">
                      <div className="text-slate-500">CY4-HOPPER OS v1.0.4 initialized. Ready for operators parameters.</div>
                      <div className="flex items-center text-cyan-400">
                        <span className="mr-1.5 select-none">CY-HP-CMD&gt;</span>
                        <input 
                          type="text" 
                          placeholder="Type 'help' or engineering commands..." 
                          className="bg-transparent focus:outline-none text-slate-200 text-xs w-full font-mono"
                          disabled
                        />
                      </div>
                    </div>
                  )}

                  {activeBottomTab === 'logs' && (
                    <div className="space-y-1 font-mono text-[11px] text-slate-400">
                      <div><span className="text-slate-600">[21:40:02]</span> <span className="text-cyan-400">[AVIONICS]</span> System diagnostic: checking guidance sensors... OK.</div>
                      <div><span className="text-slate-600">[21:40:10]</span> <span className="text-cyan-400">[PROPULSION]</span> Thrust vectoring limits loaded. Max capability {currentDesign.thrust}.</div>
                      <div><span className="text-slate-600">[21:40:15]</span> <span className="text-yellow-500">[POWER]</span> Operational safety buffer: Li-Sulfur battery health stable.</div>
                    </div>
                  )}

                  {activeBottomTab === 'simulation' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1">
                      <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Altitude Limit</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.maxAltitude || '150 m'}</span>
                      </div>
                      <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Max Hop range</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.maxRange}</span>
                      </div>
                      <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Thrust vector limit</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.thrust}</span>
                      </div>
                      <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">Descent Fuel Rate</span>
                        <span className="text-sm font-bold text-cyan-300 font-mono">0.42 kg/sec</span>
                      </div>
                    </div>
                  )}

                  {activeBottomTab === 'materials' && (
                    <div className="space-y-1">
                      <div className="text-[11px]"><span className="font-bold text-slate-400">Hydrazine Fuel Cell</span>: Pressurised titanium diaphragm tank. Operating limit: 350 bar.</div>
                      <div className="text-[11px]"><span className="font-bold text-slate-400">Thermal insulation fabric</span>: Multi-layer aluminized Mylar envelope wrapped structure.</div>
                    </div>
                  )}

                  {activeBottomTab === 'mission' && (
                    <div className="text-slate-400">
                      <div>TOUCHDOWN LOCKED: Shackleton Rim site #3 (gradient 4.2 degrees). Awaiting Vikram telemetry command.</div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL: Properties Panel */}
        <div 
          style={{ width: rightCollapsed ? '40px' : `${rightWidth}px` }}
          className="flex flex-col bg-slate-950/40 border-l border-cyan-500/10 relative transition-all duration-200 shrink-0"
        >
          {/* Right panel resize handle */}
          {!rightCollapsed && (
            <div 
              onMouseDown={startResizeRight}
              className="absolute top-0 left-0 w-1 h-full hover:bg-cyan-500/50 cursor-col-resize active:bg-cyan-500 transition-colors z-20"
            />
          )}

          {rightCollapsed ? (
            <div className="flex flex-col items-center py-4 space-y-6 text-slate-400">
              <button onClick={() => setRightCollapsed(false)} className="hover:text-cyan-400 cursor-pointer">
                <i className="fa-solid fa-angles-left"></i>
              </button>
              <i className="fa-solid fa-chart-simple" title="Properties"></i>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between p-2 border-b border-cyan-500/10 bg-slate-900/40">
                <div className="flex items-center space-x-1.5">
                  <i className="fa-solid fa-chart-simple text-cyan-400 text-xs"></i>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Properties Panel</span>
                </div>
                <button onClick={() => setRightCollapsed(true)} className="p-1 text-[10px] hover:text-cyan-400 cursor-pointer" title="Collapse Panel">
                  <i className="fa-solid fa-angles-right"></i>
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-3 text-xs space-y-4">
                
                {selectedNode ? (
                  <>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Component Node</span>
                      <span className="font-bold text-slate-200 break-words">{selectedNode.name.split(':')[1]?.trim() || selectedNode.name}</span>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Category</span>
                      <span className="text-slate-300 font-mono">{selectedNode.name.split(':')[0]?.trim() || 'System'}</span>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Description</span>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{selectedNode.desc}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Operational Status</span>
                      <span className="inline-flex items-center space-x-1 mt-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span>{selectedNode.status.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono">
                        <span>Integration Health</span>
                        <span className="text-cyan-400 font-bold">{selectedNode.health}%</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${selectedNode.health}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <i className="fa-solid fa-hand-pointer text-lg mb-2"></i>
                    <p className="text-center text-[10px]">Select a node in the tree to display properties.</p>
                  </div>
                )}

                {/* Additional engineering tolerances */}
                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wide">Tolerances</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-600 block">Thermal</span>
                      <span className="text-slate-300">-180°C / +120°C</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-600 block">Vibration Limit</span>
                      <span className="text-slate-300">12.5 G RMS</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-600 block">Payload Cap</span>
                      <span className="text-slate-300">45.0 kg</span>
                    </div>
                    <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900">
                      <span className="text-[9px] text-slate-600 block">Laser Band</span>
                      <span className="text-slate-300">1064 nm</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* BOTTOM PANEL: Docked output outside of flex center */}
      {!isBottomDocked && (
        <div 
          style={{ height: bottomCollapsed ? '32px' : `${bottomHeight}px` }}
          className="flex flex-col bg-slate-900/80 border-t border-cyan-500/20 relative transition-all duration-200"
        >
          {/* Bottom Resizer divider */}
          {!bottomCollapsed && (
            <div 
              onMouseDown={startResizeBottom}
              className="absolute top-0 left-0 w-full h-1 hover:bg-cyan-500/50 cursor-row-resize active:bg-cyan-500 transition-colors z-20"
            />
          )}

          {/* Bottom headers */}
          <div className="flex items-center justify-between px-3 h-8 bg-slate-950/60 border-b border-cyan-500/10 shrink-0">
            <div className="flex items-center space-x-1.5 text-[10px] font-bold font-mono tracking-wider">
              <button 
                onClick={() => { setActiveBottomTab('console'); setBottomCollapsed(false); }}
                className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'console' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-terminal mr-1"></i> CONSOLE
              </button>
              <button 
                onClick={() => { setActiveBottomTab('logs'); setBottomCollapsed(false); }}
                className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'logs' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-list mr-1"></i> LOGS
              </button>
              <button 
                onClick={() => { setActiveBottomTab('simulation'); setBottomCollapsed(false); }}
                className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'simulation' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-gauge-high mr-1"></i> SIMULATION
              </button>
              <button 
                onClick={() => { setActiveBottomTab('materials'); setBottomCollapsed(false); }}
                className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'materials' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-flask mr-1"></i> MATERIALS
              </button>
              <button 
                onClick={() => { setActiveBottomTab('mission'); setBottomCollapsed(false); }}
                className={`px-2.5 py-1 rounded-t border-b-2 transition-colors cursor-pointer ${activeBottomTab === 'mission' && !bottomCollapsed ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                <i className="fa-solid fa-satellite-dish mr-1"></i> MISSION OUTPUT
              </button>
            </div>

            <button 
              onClick={() => setBottomCollapsed(!bottomCollapsed)}
              className="p-1 text-[10px] text-slate-400 hover:text-cyan-400 cursor-pointer"
            >
              <i className={`fa-solid ${bottomCollapsed ? 'fa-angles-up' : 'fa-angles-down'}`}></i>
            </button>
          </div>

          {/* Bottom panels contents */}
          {!bottomCollapsed && (
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono text-slate-300 bg-slate-950/30">
              
              {activeBottomTab === 'console' && (
                <div className="space-y-1.5">
                  <div className="text-slate-500">CY4-HOPPER OS v1.0.4 initialized. Ready for operators parameters.</div>
                  <div className="flex items-center text-cyan-400">
                    <span className="mr-1.5 select-none">CY-HP-CMD&gt;</span>
                    <input 
                      type="text" 
                      placeholder="Type 'help' or engineering commands..." 
                      className="bg-transparent focus:outline-none text-slate-200 text-xs w-full font-mono"
                      disabled
                    />
                  </div>
                </div>
              )}

              {activeBottomTab === 'logs' && (
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div><span className="text-slate-600">[21:40:02]</span> <span className="text-cyan-400">[AVIONICS]</span> System diagnostic: checking guidance sensors... OK.</div>
                  <div><span className="text-slate-600">[21:40:10]</span> <span className="text-cyan-400">[PROPULSION]</span> Thrust vectoring limits loaded. Max capability {currentDesign.thrust}.</div>
                  <div><span className="text-slate-600">[21:40:15]</span> <span className="text-yellow-500">[POWER]</span> Operational safety buffer: Li-Sulfur battery health stable.</div>
                </div>
              )}

              {activeBottomTab === 'simulation' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1">
                  <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Altitude Limit</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.maxAltitude || '150 m'}</span>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Max Hop range</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.maxRange}</span>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Thrust vector limit</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">{currentDesign.thrust}</span>
                  </div>
                  <div className="bg-slate-900/30 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Descent Fuel Rate</span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">0.42 kg/sec</span>
                  </div>
                </div>
              )}

              {activeBottomTab === 'materials' && (
                <div className="space-y-1">
                  <div className="text-[11px]"><span className="font-bold text-slate-400">Hydrazine Fuel Cell</span>: Pressurised titanium diaphragm tank. Operating limit: 350 bar.</div>
                  <div className="text-[11px]"><span className="font-bold text-slate-400">Thermal insulation fabric</span>: Multi-layer aluminized Mylar envelope wrapped structure.</div>
                </div>
              )}

              {activeBottomTab === 'mission' && (
                <div className="text-slate-400">
                  <div>TOUCHDOWN LOCKED: Shackleton Rim site #3 (gradient 4.2 degrees). Awaiting Vikram telemetry command.</div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
}
