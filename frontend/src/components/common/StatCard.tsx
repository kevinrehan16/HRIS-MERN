import React from 'react';

const StatCard = ({ title, value, icon, color, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition-all duration-200 min-w-0 flex-1
        ${isActive 
          ? 'bg-white shadow-md border-white scale-[1.05] z-10' 
          : 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 text-white'
        }`}
    >
      {/* Mas maliit na Icon Container */}
      <div className={`p-1 rounded flex-shrink-0 ${isActive ? color : 'bg-white/20'}`}>
        {React.cloneElement(icon, { size: 14, className: isActive ? icon.props.className : 'text-white' })}
      </div>
      
      <div className="flex flex-col items-start min-w-0 overflow-hidden">
        <span className={`text-xs font-black leading-tight ${isActive ? 'text-slate-800' : 'text-white'}`}>
          {value}
        </span>
        {/* DITO YUNG FIX: text-[9px] at whitespace-nowrap */}
        <span className={`text-[9px] font-bold uppercase tracking-tighter leading-none whitespace-nowrap 
          ${isActive ? 'text-slate-500' : 'text-white/80'}`}>
          {title}
        </span>
      </div>
    </button>
  );
};

export default StatCard;