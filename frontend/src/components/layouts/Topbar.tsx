import { Sun, Moon, ChevronLeft, ChevronRight, Menu, LogOut, Key, User, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';

interface TopbarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  toggleMobile: () => void;
}

const Topbar = ({ isCollapsed, toggleSidebar, toggleMobile }: TopbarProps) => {
  const { user, logout } = useAuthStore();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-bottom px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm" style={{ height: '52px' }}>
      <div className="flex items-center">
        {/* Sidebar Toggle Button - Made smaller (h-8 w-8) */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex bg-slate-50 border h-8 w-8 rounded-circle items-center justify-center hover:bg-slate-100 transition-colors mr-3"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <button onClick={toggleMobile} className="md:hidden mr-3 p-1.5 bg-slate-50 rounded-lg border-0">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle Button - Reduced padding */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-300 text-slate-500 border-0 bg-transparent group"
          title="Toggle Theme"
        >
          <div className="group-hover:rotate-[15deg] transition-transform duration-300 flex items-center justify-center">
            {theme === 'dark' ? (
              <Sun size={18} className="group-hover:text-amber-500 transition-colors" />
            ) : (
              <Moon size={18} className="group-hover:text-blue-600 transition-colors" />
            )}
          </div>
        </button>

        {/* Divider - Reduced height */}
        <div className="hidden sm:block h-6 w-[1px] bg-slate-200 mx-1"></div>

        {/* --- USER SECTION --- */}
        <div className="relative flex items-center h-[52px]" ref={dropdownRef}>
          {/* Trigger Area - Reduced gap and padding */}
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all select-none ${showDropdown ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
          >
            {/* Avatar - Smaller (w-8 h-8) */}
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-sm flex-shrink-0 text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700">
                {user?.email || 'Admin'}
              </span>
              <ChevronDown 
                size={12} 
                className={`text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>

          {/* Dropdown Menu - Adjusted position and width */}
          {showDropdown && (
            <div 
              className="absolute right-0 w-56 bg-white border border-slate-200 shadow-2xl rounded-xl p-1.5 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ top: '50px' }}
            >
              {/* --- ARROW / TRIANGLE START --- */}
              {/* Border Shadow ng Arrow (Para hindi putol yung border ng box) */}
              <div className="absolute -top-[7px] right-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-slate-200" />
              {/* Main White Arrow */}
              <div className="absolute -top-[6px] right-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-white" />
              {/* --- ARROW / TRIANGLE END --- */}

              {/* Header: Name and Role */}
              <div className="p-2 border-b border-slate-100 mb-1 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-100 text-blue-600 rounded-lg w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {user?.email}
                    </span>
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit mt-0.5">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all duration-200 border-0 bg-transparent group/item">
                  <User size={16} className="text-slate-400 group-hover/item:text-blue-500" />
                  <span className="font-semibold">My Profile</span>
                </button>
                
                <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-all duration-200 border-0 bg-transparent group/item">
                  <Key size={16} className="text-slate-400 group-hover/item:text-blue-500" />
                  <span className="font-semibold">Change Password</span>
                </button>
              </div>

              {/* Footer: Logout */}
              <div className="pt-0.5 mt-0.5 border-t border-slate-100">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border-0 bg-transparent group/logout"
                >
                  <LogOut size={16} className="text-slate-400 group-hover/logout:text-red-500" />
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;