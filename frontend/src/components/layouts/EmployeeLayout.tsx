import React, { useState, useRef, useEffect } from 'react';
import { 
  Clock, Calendar, FileText, User, 
  ChevronDown, Bell, LogOut, 
  LayoutDashboard, Fingerprint,
  Menu, Lock, AtSign // Idinagdag para sa collapse icon
} from 'lucide-react';

import NavItem from '../common/NavItem';
import { useAuthStore } from '../../store/authStore';

const EmployeeLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuthStore();
  // State para sa sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = () => {
    if (!user?.firstName) return "??";
    return `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase();
  };

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
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      {/* Dynamic width base sa isCollapsed state */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-60'} bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out`}>
        
        {/* 1. BRAND HEADER */}
        <div className="h-[49px] px-4 flex items-center border-b border-slate-200 gap-3 bg-white shrink-0 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic text-[12px] shrink-0">
            H
          </div>
          {!isCollapsed && (
            <span className="font-black text-slate-800 tracking-tighter text-sm uppercase opacity-70 whitespace-nowrap">
              HRIS.io
            </span>
          )}
        </div>
        
        {/* 2. PROFILE SECTION */}
        <div className={`py-3 px-4 border-b border-slate-100 bg-slate-50/30 flex flex-col items-center text-center shrink-0 transition-all`}>
          <div className="relative group">
            {/* Dynamic size ng Avatar */}
            <div className={`${isCollapsed ? 'h-10 w-10 rounded-xl' : 'h-20 w-20 rounded-2xl'} transition-all duration-300 border-2 border-white bg-indigo-600 shadow-md flex items-center justify-center text-white overflow-hidden ring-4 ring-slate-100/50`}>
              <span className={`${isCollapsed ? 'text-sm' : 'text-2xl'} font-black tracking-tighter italic transition-all`}>
                {getInitials()}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col gap-1 mt-3 transition-opacity duration-200">
              <h6 className="font-black text-slate-800 tracking-tighter text-[13px] leading-tight mb-0">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </h6>
              <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider opacity-90 mb-1">
                {user?.position?.title || "Staff"}
              </p>
              <div className="inline-flex items-center self-center px-3 py-0.5 rounded-full bg-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                ID : {user?.employeeId || "---"}
              </div>
            </div>
          )}
        </div>

        {/* 3. NAVIGATION */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar py-2">
          <NavItem isCollapsed={isCollapsed} icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem 
            isCollapsed={isCollapsed} 
            icon={<Clock size={18} />} 
            label="My Attendance" 
            subItems={[
              { label: "Daily Logs" },
              { label: "Attendance History" },
              { label: "Overtime Records" }
            ]}
          />
          <NavItem isCollapsed={isCollapsed} icon={<Calendar size={18} />} label="Leave" />
          <NavItem isCollapsed={isCollapsed} icon={<FileText size={18} />} label="Payslips" />
          <NavItem isCollapsed={isCollapsed} icon={<Fingerprint size={18} />} label="Requests" />
        </nav>

        {/* 4. LOGOUT */}
        <div className="border-t border-slate-100 shrink-0 bg-white">
          <button 
            className={`flex items-center justify-center py-2.5 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all font-bold text-[12px] border border-transparent hover:border-rose-100`}
            onClick={logout}
          >
            <LogOut size={18} className='text-rose-600 font-bold' /> 
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- RIGHT SIDE --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOPBAR */}
        <header className="h-[49px] bg-white border-b border-slate-200 flex items-center justify-between px-2 shrink-0 z-50">
    <div className="flex items-center gap-4">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-transform active:scale-90"
      >
        <Menu size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
    </div>

    <div className="flex items-center gap-3 pr-2">
      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all relative">
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
          <div className="h-7 w-7 rounded-full bg-indigo-600 border border-indigo-100 flex items-center justify-center text-white font-black text-[10px] shadow-sm">
            {getInitials()}
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-[13px] font-medium text-slate-700 leading-none">
              {user?.firstName || 'User'}
            </span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* --- ACTUAL DROPDOWN MENU --- */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-150 origin-top-right">
            
            {/* Header ng Dropdown */}
            <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-inner">
                {getInitials()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-medium text-slate-800 truncate mb-0">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="flex align-items-center text-[11px] font-medium text-slate-400 tracking-wider truncate mb-0">
                  <AtSign size={11} className='mt-0.5'/> {user?.email || 'Sample@gmail.com'}
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

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
           {/* Your main content goes here (Dashboard, etc.) */}
           <div className="p-3">
              <h2 className="text-2xl font-black text-slate-900">Good Morning, {user?.firstName || 'there'}! 👋</h2>
           </div>
        </main>
      </div>
    </div>
  );
};

// --- MODIFIED NAVITEM ---
// const NavItem = ({ icon, label, active = false, isCollapsed, subItems = [] }) => (
//   <div className={`flex items-center cursor-pointer transition-all duration-200 ${
//     isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3 gap-3'
//   } ${
//     active ? 'bg-indigo-50 text-indigo-600 border-r-3 border-indigo-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
//   }`}>
//     <div className="shrink-0">{icon}</div>
//     {!isCollapsed && <span className="text-[14px] whitespace-nowrap overflow-hidden">{label}</span>}
//   </div>
// );

const DropdownItem = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors font-medium text-sm"
  >
    <span className="text-slate-400 group-hover:text-indigo-600">{icon}</span>
    {label}
  </button>
);

export default EmployeeLayout;