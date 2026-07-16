export default function TreeNode({
  node,
  isSelected,
  isFocused,
  onClick,
  onToggle
}) {
  const { name, icon, level, hasChildren, isExpanded } = node;

  return (
    <div
      onClick={onClick}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      className={`flex items-center group py-1.5 px-2 rounded cursor-pointer select-none transition-colors duration-150 border-l-2 outline-none font-mono text-xs
        ${isSelected 
          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' 
          : isFocused
            ? 'bg-slate-800/40 border-cyan-500/30 text-slate-200'
            : 'border-transparent hover:bg-slate-800/30 text-slate-400 hover:text-slate-200'
        }
      `}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      {/* Toggle Arrow */}
      <span 
        onClick={(e) => {
          if (hasChildren) {
            e.stopPropagation();
            onToggle();
          }
        }}
        className="w-4 h-4 flex items-center justify-center mr-1 text-slate-500 hover:text-cyan-400 rounded hover:bg-slate-700/20 transition-colors"
      >
        {hasChildren && (
          <i className={`fa-solid ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'} text-[10px]`}></i>
        )}
      </span>

      {/* Component Icon */}
      <span className="mr-2 text-xs w-4 flex justify-center text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0">
        <i className={icon || 'fa-solid fa-square-minus'}></i>
      </span>

      {/* Component Name */}
      <span className="truncate flex-1 tracking-wide">{name}</span>
      
      {/* Indicator Badges */}
      {hasChildren && (
        <span className="text-[8px] bg-slate-800 text-slate-500 px-1 py-0.5 rounded ml-1 scale-90 opacity-0 group-hover:opacity-100 transition-opacity">
          SYS
        </span>
      )}
    </div>
  );
}
