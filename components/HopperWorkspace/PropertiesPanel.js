import { useState, useEffect } from 'react';
import { db } from '../../app/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PropertiesPanel({
  selectedNode,
  isCollapsed,
  onToggleCollapse,
  width,
  onStartResize
}) {
  // Collapsible groups state
  const [groups, setGroups] = useState({
    general: true,
    physical: true,
    operational: true
  });

  // Ready for Firebase real-time property bindings
  const [fbProps, setFbProps] = useState(null);

  useEffect(() => {
    if (!selectedNode) return;
    setFbProps(null);

    async function loadPropertiesFromFirebase() {
      try {
        const docRef = doc(db, 'component_properties', selectedNode.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFbProps(docSnap.data());
          console.log(`Loaded real-time properties for ${selectedNode.id} from Firebase:`, docSnap.data());
        }
      } catch (err) {
        console.warn(`Firestore property query deferred for ${selectedNode.id}:`, err.message);
      }
    }
    loadPropertiesFromFirebase();
  }, [selectedNode]);

  // Generate realistic specs based on node name/ID
  const getSpecs = () => {
    if (!selectedNode) return null;
    
    const data = fbProps || {};
    const rawId = selectedNode.id || selectedNode.name.split(':')[1]?.trim() || selectedNode.name;
    const nodeId = String(rawId).toLowerCase().replace(/[^a-z0-9]/g, '-');

    const defaults = {
      uuid: data.uuid || `CY4-${nodeId.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      material: data.material || (nodeId.includes('tank') || nodeId.includes('chassis') ? 'Titanium Gr.5 (Ti-6Al-4V)' : nodeId.includes('panels') ? 'Silicon Photo-Voltaic' : 'Silicon / Aluminum-Lithium'),
      mass: data.mass || (nodeId.includes('chassis') ? '42.5 kg' : nodeId.includes('tank') ? '18.2 kg' : nodeId.includes('legs') ? '14.8 kg' : '2.4 kg'),
      density: data.density || (nodeId.includes('chassis') ? '4.43 g/cm³' : nodeId.includes('valve') ? '7.85 g/cm³' : '2.70 g/cm³'),
      volume: data.volume || (nodeId.includes('tank') ? '85.4 L' : '0.88 L'),
      dimensions: data.dimensions || (nodeId.includes('chassis') ? '1200 x 1200 x 850 mm' : nodeId.includes('panels') ? '1450 x 320 x 15 mm' : '150 x 120 x 80 mm'),
      temperature: data.temperature || (nodeId.includes('nozzle') || nodeId.includes('thruster') ? '-180°C / +450°C' : '-120°C / +85°C'),
      power: data.power || (nodeId.includes('avionics') ? '45W (Max)' : nodeId.includes('solar') ? '120W (Gen)' : 'N/A'),
      manufacturer: data.manufacturer || 'ISRO Propulsion Division (VSSC)',
      revision: data.revision || 'v1.0.4',
      status: data.status || selectedNode.status || 'Nominal',
      health: data.health || selectedNode.health || 98,
      notes: data.notes || selectedNode.desc || 'Unit fully calibrated during integration phase 3.'
    };

    return defaults;
  };

  const specs = getSpecs();

  const toggleGroup = (key) => {
    setGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div 
      style={{ width: isCollapsed ? '40px' : `${width}px` }}
      className="flex flex-col bg-slate-950/40 border-l border-cyan-500/10 relative transition-all duration-200 shrink-0 h-full overflow-hidden"
    >
      {/* Drag Resize Handle */}
      {!isCollapsed && (
        <div 
          onMouseDown={onStartResize}
          className="absolute top-0 left-0 w-1 h-full hover:bg-cyan-500/50 cursor-col-resize active:bg-cyan-500 transition-colors z-20"
        />
      )}

      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 space-y-6 text-slate-400 select-none">
          <button onClick={onToggleCollapse} className="hover:text-cyan-400 cursor-pointer" title="Expand Properties">
            <i className="fa-solid fa-angles-left"></i>
          </button>
          <i className="fa-solid fa-chart-simple text-sm" title="Properties"></i>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden select-none">
          {/* Header bar */}
          <div className="flex items-center justify-between p-2.5 border-b border-cyan-500/10 bg-slate-900/40 shrink-0">
            <div className="flex items-center space-x-1.5">
              <i className="fa-solid fa-chart-simple text-cyan-400 text-xs"></i>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">Properties Explorer</span>
            </div>
            <button onClick={onToggleCollapse} className="p-1 text-[10px] hover:text-cyan-400 cursor-pointer" title="Collapse Panel">
              <i className="fa-solid fa-angles-right"></i>
            </button>
          </div>

          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3 font-mono text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
            {selectedNode && specs ? (
              <>
                {/* Active component name */}
                <div className="pb-1">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Active Element</span>
                  <span className="font-bold text-slate-100 text-xs break-words font-sans">{selectedNode.name}</span>
                </div>

                {/* 1. GENERAL GROUP */}
                <div className="border-t border-slate-800 pt-2.5">
                  <div 
                    onClick={() => toggleGroup('general')}
                    className="flex items-center justify-between text-[10px] text-cyan-400/80 font-bold uppercase cursor-pointer hover:text-cyan-400 pb-1.5"
                  >
                    <span>1. General Specs</span>
                    <i className={`fa-solid ${groups.general ? 'fa-caret-down' : 'fa-caret-right'} text-[10px]`}></i>
                  </div>

                  {groups.general && (
                    <div className="space-y-1.5 pl-1.5 text-slate-400 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">UUID</span>
                        <span className="text-slate-300 font-mono select-text">{specs.uuid}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Manufacturer</span>
                        <span className="text-slate-300">{specs.manufacturer}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Revision</span>
                          <span className="text-slate-300">{specs.revision}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Description / Notes</span>
                        <p className="text-slate-400 leading-normal mt-0.5 text-[10px] font-sans select-text">{specs.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. PHYSICAL PROPERTIES GROUP */}
                <div className="border-t border-slate-800 pt-2.5">
                  <div 
                    onClick={() => toggleGroup('physical')}
                    className="flex items-center justify-between text-[10px] text-cyan-400/80 font-bold uppercase cursor-pointer hover:text-cyan-400 pb-1.5"
                  >
                    <span>2. Physical Properties</span>
                    <i className={`fa-solid ${groups.physical ? 'fa-caret-down' : 'fa-caret-right'} text-[10px]`}></i>
                  </div>

                  {groups.physical && (
                    <div className="space-y-1.5 pl-1.5 text-slate-400 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Material Composition</span>
                        <span className="text-slate-300">{specs.material}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Mass</span>
                          <span className="text-slate-300 font-mono">{specs.mass}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Density</span>
                          <span className="text-slate-300 font-mono">{specs.density}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Volume</span>
                          <span className="text-slate-300 font-mono">{specs.volume}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Dimensions</span>
                        <span className="text-slate-300 font-mono">{specs.dimensions}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. OPERATIONAL METRICS GROUP */}
                <div className="border-t border-slate-800 pt-2.5">
                  <div 
                    onClick={() => toggleGroup('operational')}
                    className="flex items-center justify-between text-[10px] text-cyan-400/80 font-bold uppercase cursor-pointer hover:text-cyan-400 pb-1.5"
                  >
                    <span>3. Operational Metrics</span>
                    <i className={`fa-solid ${groups.operational ? 'fa-caret-down' : 'fa-caret-right'} text-[10px]`}></i>
                  </div>

                  {groups.operational && (
                    <div className="space-y-1.5 pl-1.5 text-slate-400 text-[11px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Power draw</span>
                          <span className="text-slate-300 font-mono">{specs.power}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Operating Temp</span>
                          <span className="text-slate-300 font-mono">{specs.temperature}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                          <span className="inline-flex items-center space-x-1 mt-0.5 text-[9px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span>{specs.status.toUpperCase()}</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase">Health Index</span>
                          <span className="text-cyan-400 font-bold font-mono">{specs.health}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 font-sans">
                <i className="fa-solid fa-hand-pointer text-lg mb-2"></i>
                <p className="text-center text-[10px]">Select a node in the tree to display properties.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
