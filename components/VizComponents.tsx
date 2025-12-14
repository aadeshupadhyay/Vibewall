import React, { useState } from 'react';

// --- Circular Gauge ---
export const CircularGauge = ({ value, max, color, label }: { value: number, max: number, color: string, label: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value, 0) / (max || 1), 1); // Clamp between 0 and 1
  const offset = circumference - percentage * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative group">
      <div className="relative w-32 h-32 transition-transform duration-300 group-hover:scale-105">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-mono tracking-tighter text-slate-800 dark:text-white">{value}</span>
          <span className="text-[10px] text-slate-400 font-medium">/ {max === 99999 ? '∞' : max}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">{label}</span>
    </div>
  );
};

// --- Activity/Line Chart ---
export const ActivityChart = ({ data, labels, color }: { data: number[], labels?: string[], color: string }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Fallback for empty or single data point to avoid render issues
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data</div>;
  
  // Normalize data for chart
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  // If flat line (min === max), add padding so it draws in middle
  const range = maxVal - minVal || 10; 
  const displayMin = Math.max(0, minVal - (range * 0.2));
  const displayMax = maxVal + (range * 0.1);
  const displayRange = displayMax - displayMin;

  const points = data.map((val, i) => {
    // If single point, center it
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
    const y = 100 - ((val - displayMin) / displayRange) * 100;
    return `${x},${y}`;
  }).join(' ');

  // For Area fill, close the path to bottom-right and bottom-left
  const fillPath = `${data.length === 1 ? '50' : '0'},100 ${points} ${data.length === 1 ? '50' : '100'},100`;

  return (
    <div className="relative h-40 w-full group select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`chartGradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" className={color} />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={color} />
          </linearGradient>
        </defs>
        
        <polygon points={fillPath} fill={`url(#chartGradient-${color})`} className="transition-all duration-300" />
        <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" className={color} vectorEffect="non-scaling-stroke" />

        {data.map((val, i) => (
            <circle 
                key={i}
                cx={data.length === 1 ? 50 : (i / (data.length - 1)) * 100}
                cy={100 - ((val - displayMin) / displayRange) * 100}
                r="3"
                className={`${color} fill-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:r-5`}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
            />
        ))}
      </svg>
      
      {/* Tooltip */}
      {hoverIdx !== null && (
        <div 
            className="absolute z-10 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 flex flex-col items-center min-w-[80px]"
            style={{ 
                left: `${data.length === 1 ? 50 : (hoverIdx / (data.length - 1)) * 100}%`, 
                top: `${100 - ((data[hoverIdx] - displayMin) / displayRange) * 100}%`,
                transform: 'translate(-50%, -130%)' // Move up above the point
            }}
        >
            <span className="font-bold text-lg">{data[hoverIdx]}</span>
            {labels && labels[hoverIdx] && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{labels[hoverIdx]}</span>}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-slate-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// --- Bar Chart ---
export const BarChart = ({ data, labels, color }: { data: number[], labels: string[], color: string }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  
  if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-slate-400 text-xs">No data</div>;

  const maxVal = Math.max(...data, 10);

  return (
    <div className="h-40 w-full flex items-end justify-between space-x-2 pt-6 pb-2">
      {data.map((val, i) => (
        <div 
          key={i} 
          className="flex-1 flex flex-col justify-end group relative h-full"
          onMouseEnter={() => setHoverIdx(i)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <div className="relative w-full flex flex-col justify-end h-full">
             {/* Value Label on Hover */}
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 transition-opacity duration-200 z-10 ${hoverIdx === i ? 'opacity-100' : 'opacity-0'}`}>
                <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">{val}</span>
             </div>
             
             {/* Bar */}
             <div 
                className={`w-full rounded-t-sm transition-all duration-500 ease-out opacity-80 group-hover:opacity-100 ${color.replace('text-', 'bg-')}`}
                style={{ height: `${(val / maxVal) * 100}%` }}
             ></div>
          </div>
          
          {/* Label */}
          <div className="mt-2 text-[10px] text-slate-400 text-center truncate w-full font-medium tracking-tight">
            {labels[i]}
          </div>
        </div>
      ))}
    </div>
  );
};