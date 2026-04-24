import React, { useEffect, useRef, useState } from 'react'
import { Menu, Bell, ChevronDown, AtSign, User, Lock } from 'lucide-react'

import { getInitials } from '../../../utils/formatters';

interface EmpTopbarProps {
  isCollapsed: boolean,
  setIsCollapsed: (value: boolean) => void;
  firstName: string,
  lastName: string,
  email: string,
}

const EmpTopbar: React.FC<EmpTopbarProps> = ({ isCollapsed, setIsCollapsed, firstName, lastName, email }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-[49px] bg-white border-b border-slate-200 flex items-center justify-between px-2 shrink-0 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),_0_5px_15px_-3px_rgba(0,0,0,0.05)] z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-transform active:scale-90"
            >
              <Menu size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <button className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-50 rounded-lg transition-all relative">
              <Bell size={16} strokeWidth={2.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* --- DROPDOWN WRAPPER --- */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1 rounded-lg transition-all ${isProfileOpen ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
              >
                <div className="h-7 w-7 rounded-full bg-purple-400 border border-purple-400 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
                  {getInitials(firstName, lastName)}
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-[13px] font-medium text-slate-700 leading-none">
                    {firstName || 'User'}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* --- ACTUAL DROPDOWN MENU --- */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150 origin-top-right">
                  
                  {/* Header ng Dropdown */}
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <div className="h-10 w-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-black text-sm shadow-inner">
                      {getInitials()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-medium text-slate-800 truncate mb-0">
                        {firstName} {lastName}
                      </p>
                      <p className="flex align-items-center text-[11px] font-medium text-slate-400 tracking-wider truncate mb-0">
                        <AtSign size={11} className='mt-0.5'/> {email || 'Sample@gmail.com'}
                      </p>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1">
                    <DropdownItem icon={<User size={16} className='font-bold' />} label="My Profile" />
                    <DropdownItem icon={<Lock size={16} className='font-bold' />} label="Change Password" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
    </>
  )
}

const DropdownItem = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-purple-400 rounded-lg transition-colors font-medium text-sm"
  >
    <span className="text-slate-400 group-hover:text-purple-400">{icon}</span>
    {label}
  </button>
);

export default EmpTopbar
