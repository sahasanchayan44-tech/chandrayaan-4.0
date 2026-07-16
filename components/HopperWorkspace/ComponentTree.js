import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import TreeSearch from './TreeSearch';
import TreeToolbar from './TreeToolbar';
import TreeNode from './TreeNode';

// Firebase imports (ready for later integration)
import { db } from '../../app/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DEFAULT_TREE_DATA = {
  id: 'lunar-hopper',
  name: 'Lunar Hopper',
  icon: 'fa-solid fa-space-shuttle',
  children: [
    { id: 'main-chassis', name: 'Main Chassis', icon: 'fa-solid fa-square', desc: 'Primary load-bearing carbon composite structural skeleton supporting payload bays and guidance mounting plates.' },
    { id: 'landing-legs', name: 'Landing Legs', icon: 'fa-solid fa-arrows-down-to-line', desc: 'Quadruple shock-absorbing articulated legs designed with honeycomb landing pads for stable touching on soft lunar regolith.' },
    {
      id: 'engine-assembly',
      name: 'Engine Assembly',
      icon: 'fa-solid fa-dharmachakra',
      desc: 'Central bipropellant propulsion system providing main acceleration vector and fine attitude vector controls.',
      children: [
        { id: 'thruster-1', name: 'Thruster 1', icon: 'fa-solid fa-fire', desc: 'High-impulse thruster node 1 configured for horizontal offset adjustments.' },
        { id: 'thruster-2', name: 'Thruster 2', icon: 'fa-solid fa-fire', desc: 'High-impulse thruster node 2 configured for pitch and roll adjustments.' },
        { id: 'fuel-valve', name: 'Fuel Valve', icon: 'fa-solid fa-toggle-on', desc: 'Micro-second control valve governing fluid input rates into combustion chambers.' },
        { id: 'nozzle', name: 'Nozzle', icon: 'fa-solid fa-wind', desc: 'High-expansion nozzle designed for vacuum thruster efficiency.' }
      ]
    },
    { id: 'fuel-tank', name: 'Fuel Tank', icon: 'fa-solid fa-oil-can', desc: 'Pressurised propellant cell insulated with multi-layer Mylar sheets.' },
    { id: 'battery-pack', name: 'Battery Pack', icon: 'fa-solid fa-battery-three-quarters', desc: 'Solid-state Lithium-Sulfur high-density battery bank powering all telemetry.' },
    { id: 'solar-panels', name: 'Solar Panels', icon: 'fa-solid fa-solar-panel', desc: 'Rigid deploying panels tracking solar elevation coordinates.' },
    { id: 'camera', name: 'Camera', icon: 'fa-solid fa-camera', desc: 'Optical descent hazard camera generating height maps.' },
    { id: 'imu', name: 'IMU', icon: 'fa-solid fa-compass', desc: 'Inertial Measurement Unit tracking pitch, yaw, and roll vectors.' },
    { id: 'star-tracker', name: 'Star Tracker', icon: 'fa-solid fa-star', desc: 'Precision celestial tracking camera referencing stellar coordinates.' },
    { id: 'radar', name: 'Radar', icon: 'fa-solid fa-radio', desc: 'Descent radar monitoring altitude terrain elevation.' },
    { id: 'lidar', name: 'LiDAR', icon: 'fa-solid fa-line-chart', desc: 'Laser scanning altimeter building local 3D topographic slope models.' },
    { id: 'thermal-shield', name: 'Thermal Shield', icon: 'fa-solid fa-shield-halved', desc: 'Reflective barrier protecting fuel cells from direct solar radiation.' },
    { id: 'antenna', name: 'Antenna', icon: 'fa-solid fa-tower-broadcast', desc: 'High-gain S-band antenna communicating directly with Vikram Lander.' },
    { id: 'avionics', name: 'Avionics', icon: 'fa-solid fa-microchip', desc: 'Central mission computer running AutoNav path planning algorithms.' },
    { id: 'payload-bay', name: 'Payload Bay', icon: 'fa-solid fa-box', desc: 'Integrated payload section housing water ice core drill and spectrometers.' }
  ]
};

// Flatten helper
function flattenTree(node, expandedIds, query, level = 0, parentPath = []) {
  const currentPath = [...parentPath, node.name];
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  
  const matches = !query || node.name.toLowerCase().includes(query.toLowerCase());
  const flattened = [];
  
  const item = {
    id: node.id,
    name: node.name,
    icon: node.icon,
    desc: node.desc || '',
    level,
    hasChildren,
    isExpanded,
    path: currentPath,
    matches
  };
  
  let childItems = [];
  if (hasChildren && (isExpanded || query)) {
    for (const child of node.children) {
      childItems.push(...flattenTree(child, expandedIds, query, level + 1, currentPath));
    }
  }
  
  const anyChildMatches = childItems.some(c => c.matches);
  if (matches || anyChildMatches) {
    flattened.push({
      ...item,
      isExpanded: query ? true : isExpanded
    });
    flattened.push(...childItems);
  }
  
  return flattened;
}

export default function ComponentTree({ onSelectNode, onBreadcrumbChange }) {
  const [treeData, setTreeData] = useState(DEFAULT_TREE_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodeIds, setExpandedNodeIds] = useState(new Set(['lunar-hopper', 'engine-assembly']));
  const [selectedId, setSelectedId] = useState('lunar-hopper');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Virtualization scroll state
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef(null);

  // Ready for Firebase: Attempt to query Firestore component tree database
  useEffect(() => {
    let active = true;
    async function loadTreeFromFirebase() {
      try {
        const querySnapshot = await getDocs(collection(db, 'component_tree'));
        if (!querySnapshot.empty && active) {
          const fbDocs = [];
          querySnapshot.forEach(doc => {
            fbDocs.push(doc.data());
          });
          console.log("Loaded component tree structure from Firebase Firestore:", fbDocs);
          // (Data mapping to DEFAULT_TREE_DATA hierarchy can be applied here)
        }
      } catch (err) {
        console.warn("Firebase component tree load deferred (using local default data):", err.message);
      }
    }
    loadTreeFromFirebase();
    return () => { active = false; };
  }, []);

  // Compute visible flattened list of nodes
  const visibleNodes = useMemo(() => {
    return flattenTree(treeData, expandedNodeIds, searchQuery);
  }, [treeData, expandedNodeIds, searchQuery]);

  // Synchronize breadcrumbs on active node change
  const activeNode = useMemo(() => {
    return visibleNodes.find(n => n.id === selectedId) || visibleNodes[0];
  }, [visibleNodes, selectedId]);

  useEffect(() => {
    if (activeNode && onBreadcrumbChange) {
      onBreadcrumbChange(activeNode.path.join(' > '));
    }
    if (activeNode && onSelectNode) {
      onSelectNode(activeNode);
    }
  }, [activeNode, onBreadcrumbChange, onSelectNode]);

  // Expanding/Collapsing callbacks
  const handleToggle = useCallback((id) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allFolderIds = [];
    const traverse = (node) => {
      if (node.children && node.children.length > 0) {
        allFolderIds.push(node.id);
        node.children.forEach(traverse);
      }
    };
    traverse(treeData);
    setExpandedNodeIds(new Set(allFolderIds));
  }, [treeData]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodeIds(new Set());
  }, []);

  // Select node click callback
  const handleSelect = (idx, node) => {
    setFocusedIndex(idx);
    setSelectedId(node.id);
  };

  // Keyboard navigation controller
  const handleKeyDown = (e) => {
    if (visibleNodes.length === 0) return;
    
    let nextIdx = focusedIndex;
    const currentNode = visibleNodes[focusedIndex];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIdx = Math.min(visibleNodes.length - 1, focusedIndex + 1);
        setFocusedIndex(nextIdx);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        nextIdx = Math.max(0, focusedIndex - 1);
        setFocusedIndex(nextIdx);
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (currentNode.hasChildren) {
          if (!currentNode.isExpanded) {
            handleToggle(currentNode.id);
          } else {
            nextIdx = Math.min(visibleNodes.length - 1, focusedIndex + 1);
            setFocusedIndex(nextIdx);
          }
        }
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (currentNode.hasChildren && currentNode.isExpanded) {
          handleToggle(currentNode.id);
        } else if (currentNode.level > 0) {
          // Move focus to parent node
          const parentPath = currentNode.path.slice(0, -1);
          const parentIdx = visibleNodes.findIndex(n => 
            n.level === currentNode.level - 1 && n.path.join() === parentPath.join()
          );
          if (parentIdx !== -1) {
            setFocusedIndex(parentIdx);
          }
        }
        break;
        
      case 'Enter':
      case ' ':
        e.preventDefault();
        setSelectedId(currentNode.id);
        break;
        
      default:
        break;
    }
  };

  // Virtualization constants
  const itemHeight = 32;
  const viewportHeight = 400;

  const startIdx = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const endIdx = Math.min(visibleNodes.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + 2);
  const visibleSlice = visibleNodes.slice(startIdx, endIdx);

  return (
    <div 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="flex flex-col h-full w-full bg-slate-900/10 focus:outline-none"
      role="tree"
      aria-label="Component Assembly Explorer"
    >
      {/* Search Input bar */}
      <TreeSearch value={searchQuery} onChange={setSearchQuery} />

      {/* Control Action Toolbar */}
      <TreeToolbar 
        onExpandAll={handleExpandAll} 
        onCollapseAll={handleCollapseAll} 
        itemCount={visibleNodes.length}
      />

      {/* Virtualized Node list container */}
      <div 
        ref={scrollContainerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto min-h-[400px] relative scrollbar-thin scrollbar-thumb-slate-800"
      >
        <div 
          style={{ height: `${visibleNodes.length * itemHeight}px`, width: '100%' }}
          className="relative"
        >
          {visibleSlice.map((node, sliceIdx) => {
            const absoluteIdx = startIdx + sliceIdx;
            return (
              <div
                key={node.id}
                style={{ 
                  position: 'absolute', 
                  top: `${absoluteIdx * itemHeight}px`, 
                  left: 0, 
                  right: 0, 
                  height: `${itemHeight}px` 
                }}
                className="flex items-center"
              >
                <TreeNode
                  node={node}
                  isSelected={selectedId === node.id}
                  isFocused={focusedIndex === absoluteIdx}
                  onClick={() => handleSelect(absoluteIdx, node)}
                  onToggle={() => handleToggle(node.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
