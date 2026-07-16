import { useMemo } from 'react';

export default function LineChart({
  data = [],
  color = '#00e5ff',
  height = 120,
  minVal = 0,
  maxVal = 100,
  label = 'Metric'
}) {
  // Generate SVG polyline path based on width/height
  const svgPath = useMemo(() => {
    if (data.length < 2) return '';
    const width = 300;
    
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // Map val between minVal and maxVal
      const range = Math.max(1, maxVal - minVal);
      const normalized = (val - minVal) / range;
      const y = height - normalized * (height - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [data, height, minVal, maxVal]);

  const svgAreaPath = useMemo(() => {
    if (data.length < 2) return '';
    const points = svgPath.split(' ');
    const firstPoint = points[0].split(',');
    const lastPoint = points[points.length - 1].split(',');
    
    return `M ${firstPoint[0]} ${height} L ${svgPath} L ${lastPoint[0]} ${height} Z`;
  }, [svgPath, height, data]);

  const currentVal = data[data.length - 1] !== undefined ? data[data.length - 1].toFixed(1) : 'N/A';

  return (
    <div className="bg-slate-950/60 border border-slate-900 rounded p-2 flex flex-col font-mono text-[10px] w-full min-w-[200px]">
      <div className="flex justify-between items-center mb-1 text-[9px] text-slate-500 uppercase tracking-wider">
        <span>{label}</span>
        <span style={{ color }} className="font-bold">{currentVal}</span>
      </div>
      <div className="relative w-full h-[120px] bg-slate-950/20 overflow-hidden border border-slate-900/30 rounded">
        {/* Background Grid Lines */}
        <svg className="absolute inset-0 w-full h-full text-slate-900" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1={height / 4} x2="100%" y2={height / 4} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1={(height * 3) / 4} x2="100%" y2={(height * 3) / 4} stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="25%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="75%" y1="0" x2="75%" y2="100%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>

        {/* Live Vector Line */}
        <svg 
          viewBox={`0 0 300 ${height}`} 
          className="absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Filled Area */}
          {svgAreaPath && (
            <path d={svgAreaPath} fill={`url(#grad-${label})`} />
          )}

          {/* Stroke Line */}
          {svgPath && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              points={svgPath}
              className="drop-shadow-[0_0_2px_rgba(0,229,255,0.4)]"
            />
          )}
        </svg>
      </div>
      <div className="flex justify-between mt-1 text-[8px] text-slate-600 font-mono">
        <span>MIN: {minVal}</span>
        <span>MAX: {maxVal}</span>
      </div>
    </div>
  );
}
