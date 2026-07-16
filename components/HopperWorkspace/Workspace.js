import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import ComponentTree from './ComponentTree';
import PropertiesPanel from './PropertiesPanel';

// Lazy load all 15 Workspace Tab views
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const CadTab = lazy(() => import('./tabs/CadTab'));
const ComponentsTab = lazy(() => import('./tabs/ComponentsTab'));
const StructureTab = lazy(() => import('./tabs/StructureTab'));
const PropulsionTab = lazy(() => import('./tabs/PropulsionTab'));
const ElectricalTab = lazy(() => import('./tabs/ElectricalTab'));
const NavigationTab = lazy(() => import('./tabs/NavigationTab'));
const ThermalTab = lazy(() => import('./tabs/ThermalTab'));
const SimulationTab = lazy(() => import('./tabs/SimulationTab'));
const MaterialsTab = lazy(() => import('./tabs/MaterialsTab'));
const ManufacturingTab = lazy(() => import('./tabs/ManufacturingTab'));
const AssemblyTab = lazy(() => import('./tabs/AssemblyTab'));
const TestingTab = lazy(() => import('./tabs/TestingTab'));
const MissionReadinessTab = lazy(() => import('./tabs/MissionReadinessTab'));
const DocumentationTab = lazy(() => import('./tabs/DocumentationTab'));

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
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('3d_cad');

  const workspaceTabs = [
    { id: 'overview', label: 'Overview' },
    { id: '3d_cad', label: '3D CAD' },
    { id: 'components', label: 'Components' },
    { id: 'structure', label: 'Structure' },
    { id: 'propulsion', label: 'Propulsion' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'thermal', label: 'Thermal' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'materials', label: 'Materials' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'assembly', label: 'Assembly' },
    { id: 'testing', label: 'Testing' },
    { id: 'mission_readiness', label: 'Mission Readiness' },
    { id: 'documentation', label: 'Documentation' }
  ];

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
          
          {/* Horizontal View Tab Bar */}
          <div className="flex items-center overflow-x-auto whitespace-nowrap bg-slate-900/60 border-b border-cyan-500/10 px-2 py-1 scrollbar-none shrink-0 select-none">
            {workspaceTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-mono hover:text-cyan-400 cursor-pointer transition-colors border-b-2 font-bold ${activeWorkspaceTab === tab.id ? 'border-cyan-400 text-cyan-300 bg-slate-950/20' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                {tab.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Viewport content area */}
          <div className="flex-1 min-h-[300px] flex flex-col relative overflow-hidden bg-slate-950/40">
            
            <Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-cyan-400 font-mono text-[10px] select-none">
                <i className="fa-solid fa-gear animate-spin text-lg mb-2 text-cyan-500/80"></i>
                <span>LOADING WORKSPACE SYSTEM MODULE...</span>
              </div>
            }>
              {/* 1. Overview */}
              <div className={activeWorkspaceTab === 'overview' ? 'w-full h-full block' : 'hidden'}>
                <OverviewTab />
              </div>

              {/* 2. 3D CAD */}
              <div className={activeWorkspaceTab === '3d_cad' ? 'w-full h-full block' : 'hidden'}>
                <CadTab 
                  currentDesign={currentDesign}
                  activeHopperTab={activeHopperTab}
                  canvasV1Ref={canvasV1Ref}
                  canvasV2Ref={canvasV2Ref}
                  canvasV3Ref={canvasV3Ref}
                  handleCadMouseDown={handleCadMouseDown}
                  handleCadMouseMove={handleCadMouseMove}
                  handleCadMouseUp={handleCadMouseUp}
                  cadOrbit={cadOrbit}
                  setCadOrbit={setCadOrbit}
                  cadWireframe={cadWireframe}
                  setCadWireframe={setCadWireframe}
                  cadExploded={cadExploded}
                  setCadExploded={setCadExploded}
                />
              </div>

              {/* 3. Components */}
              <div className={activeWorkspaceTab === 'components' ? 'w-full h-full block' : 'hidden'}>
                <ComponentsTab />
              </div>

              {/* 4. Structure */}
              <div className={activeWorkspaceTab === 'structure' ? 'w-full h-full block' : 'hidden'}>
                <StructureTab />
              </div>

              {/* 5. Propulsion */}
              <div className={activeWorkspaceTab === 'propulsion' ? 'w-full h-full block' : 'hidden'}>
                <PropulsionTab />
              </div>

              {/* 6. Electrical */}
              <div className={activeWorkspaceTab === 'electrical' ? 'w-full h-full block' : 'hidden'}>
                <ElectricalTab />
              </div>

              {/* 7. Navigation */}
              <div className={activeWorkspaceTab === 'navigation' ? 'w-full h-full block' : 'hidden'}>
                <NavigationTab />
              </div>

              {/* 8. Thermal */}
              <div className={activeWorkspaceTab === 'thermal' ? 'w-full h-full block' : 'hidden'}>
                <ThermalTab />
              </div>

              {/* 9. Simulation */}
              <div className={activeWorkspaceTab === 'simulation' ? 'w-full h-full block' : 'hidden'}>
                <SimulationTab />
              </div>

              {/* 10. Materials */}
              <div className={activeWorkspaceTab === 'materials' ? 'w-full h-full block' : 'hidden'}>
                <MaterialsTab />
              </div>

              {/* 11. Manufacturing */}
              <div className={activeWorkspaceTab === 'manufacturing' ? 'w-full h-full block' : 'hidden'}>
                <ManufacturingTab />
              </div>

              {/* 12. Assembly */}
              <div className={activeWorkspaceTab === 'assembly' ? 'w-full h-full block' : 'hidden'}>
                <AssemblyTab />
              </div>

              {/* 13. Testing */}
              <div className={activeWorkspaceTab === 'testing' ? 'w-full h-full block' : 'hidden'}>
                <TestingTab />
              </div>

              {/* 14. Mission Readiness */}
              <div className={activeWorkspaceTab === 'mission_readiness' ? 'w-full h-full block' : 'hidden'}>
                <MissionReadinessTab />
              </div>

              {/* 15. Documentation */}
              <div className={activeWorkspaceTab === 'documentation' ? 'w-full h-full block' : 'hidden'}>
                <DocumentationTab />
              </div>
            </Suspense>

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
        <PropertiesPanel 
          selectedNode={selectedNode}
          isCollapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
          width={rightWidth}
          onStartResize={startResizeRight}
        />

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
