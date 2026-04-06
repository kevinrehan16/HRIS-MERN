import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 4, columns = 6 }) => {
  // Mas mabilis (0.8s) at mas tagilid (skew) para magmukhang "marami" at "mabilis"
  const shimmerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '-150%', // Simula sa malayo
    width: '200%', // Mas malapad na beam
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 70%, transparent 100%)',
    animation: 'nitro-shimmer 1.2s infinite linear',
    transform: 'skewX(-25deg)', // Ito yung nagbibigay ng "speed" look
  };

  return (
    <>
      <style>{`
        @keyframes nitro-shimmer {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
      `}</style>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-50 last:border-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-2">
              <div className="flex items-center gap-3">
                
                {colIndex === 0 ? (
                  <div className="flex items-center gap-3 w-full">
                    {/* AVATAR */}
                    <div 
                      className="h-11 w-11 rounded-full bg-slate-200 relative overflow-hidden shrink-0"
                      style={{ animationDelay: `${rowIndex * 0.1}s` }} // Staggered effect
                    >
                      <div style={shimmerStyle} />
                    </div>
                    {/* TEXT LINES */}
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded-full w-3/4 relative overflow-hidden">
                        <div style={shimmerStyle} />
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full w-1/2 relative overflow-hidden">
                        <div style={shimmerStyle} />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* OTHER COLUMNS */
                  <div className="h-3 bg-slate-200 rounded-full w-full relative overflow-hidden">
                    <div style={shimmerStyle} />
                  </div>
                )}

              </div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;