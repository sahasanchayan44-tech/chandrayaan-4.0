export default function TreeSearch({ value, onChange }) {
  return (
    <div className="p-2 border-b border-cyan-500/10 shrink-0">
      <div className="search-bar-container !w-full">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input 
          type="text" 
          placeholder="Search components..." 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="search-input"
        />
        {value && (
          <button 
            onClick={() => onChange('')} 
            className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer absolute right-2.5"
            title="Clear Search"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
    </div>
  );
}
