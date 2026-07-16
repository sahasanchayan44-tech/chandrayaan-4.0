export default function TreeToolbar({ onExpandAll, onCollapseAll, itemCount }) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-cyan-500/10 bg-slate-900/40 text-slate-400 text-xs shrink-0 select-none">
      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
        Components ({itemCount})
      </span>
      <div className="flex items-center space-x-1.5 font-mono">
        <button 
          onClick={onExpandAll} 
          className="btn btn-secondary !py-0.5 !px-2 !text-[9px] flex items-center space-x-1" 
          title="Expand All Nodes"
        >
          <i className="fa-solid fa-folder-open text-yellow-500/80"></i>
          <span>EXPAND</span>
        </button>
        <button 
          onClick={onCollapseAll} 
          className="btn btn-secondary !py-0.5 !px-2 !text-[9px] flex items-center space-x-1" 
          title="Collapse All Nodes"
        >
          <i className="fa-solid fa-folder text-slate-500"></i>
          <span>COLLAPSE</span>
        </button>
      </div>
    </div>
  );
}
