import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const NavItem = ({ icon, label, to, isCollapsed, subItems = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasSubItems = subItems.length > 0;

  const isDirectActive = location.pathname === to;
  const isChildActive = subItems.some(item => location.pathname === item.to);
  const parentShouldHighlight = isDirectActive || isChildActive;

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    } else if (!isChildActive) {
      setIsOpen(false);
    }
  }, [location.pathname, isChildActive]);

  return (
    <div className="w-full"> {/* Nakadikit ito sa container */}
      <Link 
        to={hasSubItems ? "#" : (to || "#")} 
        onClick={(e) => {
          if (hasSubItems) {
            e.preventDefault();
            !isCollapsed && setIsOpen(!isOpen);
          }
        }}
        // DITO ANG PAGBABAGO: Inalis ang rounded at transparent, nilagyan ng solid hover color
        className={`
          flex items-center cursor-pointer relative no-underline !decoration-transparent transition-all duration-200 group
          ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-2.5 gap-3'}
          ${parentShouldHighlight 
            ? 'bg-purple-50' 
            : 'hover:bg-slate-100' // <--- Mas visible na hover background
          }
        `}
      >
        {/* BORDER INDICATOR */}
        <div className={`absolute right-0 top-0 h-full w-[3px] bg-purple-600 transition-transform duration-300 ${parentShouldHighlight ? 'scale-y-100' : 'scale-y-0'}`} />

        {/* ICON */}
        <div 
          className={`shrink-0 transition-colors duration-200 ${
            parentShouldHighlight ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'
          }`}
        >
          {icon}
        </div>
        
        {/* LABEL */}
        {!isCollapsed && (
          <>
            <span 
              className={`text-[14px] flex-1 whitespace-nowrap overflow-hidden transition-all duration-200 ${
                parentShouldHighlight 
                  ? 'text-purple-600 font-medium' 
                  : 'text-slate-600 group-hover:text-purple-600'
              }`}
            >
              {label}
            </span>
            {hasSubItems && (
              <ChevronDown 
                size={14} 
                className={`transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                } ${parentShouldHighlight ? 'text-purple-600' : 'text-slate-400 group-hover:text-purple-600'}`} 
              />
            )}
          </>
        )}
      </Link>

      {/* SUBMENU SECTION */}
      {!isCollapsed && hasSubItems && (
        <div className={`grid transition-all duration-300 overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden bg-slate-200">
            <div className="ml-8 border-l border-slate-300 flex flex-col gap-1 mb-2 mt-1">
              {subItems.map((item, index) => {
                const isSubActive = location.pathname === item.to;
                return (
                  <Link
                    key={index}
                    to={item.to || "#"}
                    className={`
                      text-[14px] py-2 px-4 !no-underline transition-all duration-200 block
                      ${isSubActive 
                        ? '!text-purple-600' 
                        : '!text-slate-500 hover:!text-purple-600'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavItem;