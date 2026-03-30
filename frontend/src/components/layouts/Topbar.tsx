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
  
  // Ref para sa "Click Outside" logic
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Isasara ang dropdown kapag nag-click sa labas ng user menu
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
    <header className="bg-white border-bottom px-3 flex items-center justify-between sticky top-0 z-50 shadow-sm" style={{ height: '70px' }}>
      <div className="flex items-center">
        {/* Sidebar Toggle Button */}
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex bg-slate-50 border h-9 w-9 rounded-circle items-center justify-center hover:bg-slate-100 transition-colors mr-4"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <button onClick={toggleMobile} className="md:hidden mr-3 p-2 bg-slate-50 rounded-lg border-0">
          <Menu size={24} />
        </button>

        {/* <h5 className="mb-0 font-bold text-slate-600 hidden sm:block">Admin Panel</h5> */}
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-300 text-slate-500 border-0 bg-transparent group"
          title="Toggle Theme"
        >
          <div className="group-hover:rotate-[15deg] transition-transform duration-300 flex items-center justify-center">
            {theme === 'dark' ? (
              <Sun size={20} className="group-hover:text-amber-500 transition-colors" />
            ) : (
              <Moon size={20} className="group-hover:text-blue-600 transition-colors" />
            )}
          </div>
        </button>

        {/* Divider - Nilagyan ng MX-2 para may space */}
        <div className="hidden sm:block h-8 w-[1px] bg-slate-200 mx-1"></div>

        {/* --- USER SECTION (CLICK TRIGGER) --- */}
        <div className="relative flex items-center h-[70px]" ref={dropdownRef}>
          {/* Trigger Area */}
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all select-none ${showDropdown ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
          >
            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {user?.email?.split('@')[0] || 'Admin'}
              </span>
              <ChevronDown 
                size={14} 
                className={`text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div 
              className="absolute right-0 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ top: '65px' }}
            >
              {/* Header: Name and Role */}
              <div className="p-3 border-b border-slate-100 mb-1">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-lg w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden text-left">
                    <span className="text-sm font-bold text-slate-800 truncate leading-tight">
                      {user?.email}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit mt-1">
                      {user?.role || 'Administrator'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: My Profile & Change Password */}
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all duration-200 border-0 bg-transparent group/item">
                  <User size={18} className="text-slate-400 group-hover/item:text-blue-500" />
                  <span className="font-medium">My Profile</span>
                </button>
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-all duration-200 border-0 bg-transparent group/item">
                  <Key size={18} className="text-slate-400 group-hover/item:text-blue-500" />
                  <span className="font-medium">Change Password</span>
                </button>
              </div>

              {/* Footer: Logout */}
              <div className="pt-1 mt-1 border-t border-slate-100">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border-0 bg-transparent group/logout"
                >
                  <LogOut size={18} className="text-slate-400 group-hover/logout:text-red-500" />
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