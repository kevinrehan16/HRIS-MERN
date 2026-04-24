import React from 'react'
import { LayoutDashboard, Calendar, FileText, Fingerprint, LogOut, Clock, IdCardLanyard } from 'lucide-react'

import { getInitials } from '../../../utils/formatters'
import { useAuthStore } from '../../../store/authStore'
import NavItem from '../../common/NavItem'

interface EmpSidebarProps {
  isCollapsed: boolean,
  firstName: string,
  lastName: string,
  position: string,
  employeeId: string,
}

const EmpSidebar: React.FC<EmpSidebarProps> = ({ isCollapsed, firstName, lastName, position, employeeId }) => {
  const { user, logout } = useAuthStore();

  return (
    <>
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-60'
        } bg-white border-r border-slate-200 hidden lg:flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden shadow-[10px_0_30px_-5px_rgba(0,0,0,0.1),_5px_0_15px_-3px_rgba(0,0,0,0.05)] z-30`}
      >
        
        {/* 1. BRAND HEADER */}
        <div className={`h-[49px] ${
          isCollapsed ? 'px-0 justify-center' : 'px-4'
        } flex items-center border-b border-slate-200 gap-3 bg-white shrink-0 overflow-hidden`}>
          <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center text-white font-black italic text-[12px] shrink-0">
            H
          </div>
          {!isCollapsed && (
            <span className="font-black text-slate-800 tracking-tighter text-sm uppercase opacity-70 whitespace-nowrap overflow-hidden">
              HRIS.io
            </span>
          )}
        </div>
        
        {/* 2. PROFILE SECTION */}
        <div className={`py-3 ${
          isCollapsed ? 'px-0' : 'px-4'
        } border-b border-slate-100 bg-slate-50/30 flex flex-col items-center text-center shrink-0 transition-all overflow-hidden`}>
          <div className="relative group shrink-0">
            <div className={`${
              isCollapsed ? 'h-10 w-10 rounded-xl' : 'h-20 w-20 rounded-2xl'
            } transition-all duration-300 border-2 border-white bg-purple-400 shadow-md flex items-center justify-center text-white overflow-hidden ring-4 ring-slate-100/50`}>
              <span className={`${isCollapsed ? 'text-sm' : 'text-2xl'} font-black tracking-tighter italic transition-all`}>
                {getInitials(firstName, lastName)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col gap-1 mt-3 transition-opacity duration-200 w-full min-w-0">
              <h6 className="font-black text-slate-800 tracking-tighter text-[13px] leading-tight mb-0 truncate">
                {firstName ? `${firstName} ${lastName}` : "Loading..."}
              </h6>
              <p className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider opacity-90 mb-1 truncate">
                {position || "Staff"}
              </p>
              <div className="inline-flex items-center self-center px-3 py-0.5 rounded-full bg-slate-200/60 text-[10px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                ID : {employeeId || "---"}
              </div>
            </div>
          )}
        </div>

        {/* 3. NAVIGATION */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
          <NavItem 
            isCollapsed={isCollapsed} 
            to="/portal/dashboard" // Dashboard should go to dashboard path
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active 
          />
          
          <NavItem 
            isCollapsed={isCollapsed} 
            to="/portal/my-profile" // Profile link
            icon={<IdCardLanyard size={18} />} 
            label="My Profile" 
          />

          <NavItem 
            isCollapsed={isCollapsed} 
            icon={<Clock size={18} />} 
            label="Attendance" 
            subItems={[
              // LAGYAN NG "/" SA SIMULA:
              { label: "Daily Logs", to: "/portal/daily-logs" },
              { label: "Attendance History", to: "/portal/attendance-history" },
              { label: "Overtime Records", to: "/portal/overtime" }
            ]}
          />

          <NavItem isCollapsed={isCollapsed} to="/leave" icon={<Calendar size={18} />} label="Leave" />
          <NavItem isCollapsed={isCollapsed} to="/payslips" icon={<FileText size={18} />} label="Payslips" />
          <NavItem isCollapsed={isCollapsed} to="/requests" icon={<Fingerprint size={18} />} label="Requests" />
        </nav>

        {/* 4. LOGOUT */}
        <div className="border-t border-slate-100 shrink-0 bg-white overflow-hidden">
          <button 
            className={`flex items-center justify-center py-2.5 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all font-bold text-[12px] border border-transparent hover:border-rose-100 overflow-hidden`}
            onClick={logout}
          >
            <LogOut size={18} className='text-rose-600 font-bold shrink-0' /> 
            {!isCollapsed && <span className="ml-2 whitespace-nowrap overflow-hidden">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default EmpSidebar