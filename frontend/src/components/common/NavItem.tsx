import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const NavItem = ({ icon, label, active = false, isCollapsed, subItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems.length > 0;

  // Isara ang submenu kapag nag-collapse ang sidebar para hindi mag-overlap
  useEffect(() => {
    if (isCollapsed) setIsOpen(false);
  }, [isCollapsed]);

  return (
    <div className="w-full">
      {/* MAIN ITEM */}
      <div 
        onClick={() => hasSubItems && !isCollapsed && setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer transition-all duration-200 group relative ${
          isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-2.5 gap-3'
        } ${
          active && !hasSubItems 
            ? 'bg-indigo-50 text-indigo-600 border-r-[3px] border-indigo-600 font-bold' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600 font-medium'
        }`}
      >
        {/* ICON */}
        <div className={`shrink-0 transition-transform duration-200 ${!isCollapsed && 'group-hover:scale-110'}`}>
          {icon}
        </div>
        
        {/* LABEL & CHEVRON (Visible only if not collapsed) */}
        {!isCollapsed && (
          <>
            <span className="text-[16px] flex-1 whitespace-nowrap overflow-hidden transition-opacity duration-300">
              {label}
            </span>
            {hasSubItems && (
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-300 text-slate-400 group-hover:text-indigo-600 ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            )}
          </>
        )}

        {/* TOOLTIP (Optional: Lumalabas lang pag naka-collapse at hino-hover) */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[12px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
            {label}
          </div>
        )}
      </div>

      {/* SUBMENU WITH HEIGHT ANIMATION */}
      {!isCollapsed && hasSubItems && (
        <div 
          className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-8 border-l border-slate-200 flex flex-col gap-1 mb-2">
              {subItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="text-left text-[10px] text-slate-500 py-2 px-4 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all rounded-r-lg font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItem;