export default function TreeToolbar({ onExpandAll, onCollapseAll, itemCount }) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-cyan-500/10 bg-slate-900/40 text-slate-400 text-xs shrink-0 select-none">
      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
        Components ({itemCount})
      </span>
      <div className="flex items-center space-x-1.5 font-mono">
        <button 
          onClick={onExpandAll} 
          className="p-1 hover:text-cyan-400 cursor-pointer flex items-center space-x-1 text-[10px] bg-slate-950/20 rounded border border-slate-800/40" 
          title="Expand All Nodes"
        >
          <i className="fa-solid fa-folder-open text-yellow-500/80"></i>
          <span>EXPAND</span>
        </button>
        <button 
          onClick={onCollapseAll} 
          className="p-1 hover:text-cyan-400 cursor-pointer flex items-center space-x-1 text-[10px] bg-slate-950/20 rounded border border-slate-800/40" 
          title="Collapse All Nodes"
        >
          <i className="fa-solid fa-folder text-slate-500"></i>
          <span>COLLAPSE</span>
        </button>
      </div>
    </div>
  );
}
