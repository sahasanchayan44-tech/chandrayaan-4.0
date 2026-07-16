export default function TreeSearch({ value, onChange }) {
  return (
    <div className="p-2 border-b border-cyan-500/10 shrink-0">
      <div className="relative flex items-center bg-slate-950/60 rounded px-2.5 py-1 text-xs border border-slate-800 focus-within:border-cyan-500/30 transition-colors">
        <i className="fa-solid fa-magnifying-glass text-slate-500 mr-2"></i>
        <input 
          type="text" 
          placeholder="Search components..." 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-slate-200 text-xs font-mono"
        />
        {value && (
          <button 
            onClick={() => onChange('')} 
            className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
            title="Clear Search"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
    </div>
  );
}
