import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Clock, Calendar, FileText, User, 
  ChevronDown, Bell, LogOut, 
  LayoutDashboard, Fingerprint,
  Menu, Lock, AtSign // Idinagdag para sa collapse icon
} from 'lucide-react';

import EmpSidebar from './employee/EmpSidebar';
import EmpTopbar from './employee/EmpTopbar';
import { useAuthStore } from '../../store/authStore';

const EmployeeLayout = () => {
  
  const { user } = useAuthStore();
  // State para sa sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <EmpSidebar 
        isCollapsed={isCollapsed}
        firstName={user?.firstName}
        lastName={user?.lastName}
        position={user?.position?.title}
        employeeId={user?.employeeId}
      />

      {/* --- RIGHT SIDE --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOPBAR */}
        <EmpTopbar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed}
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
        />
        

        <main className="flex-1 bg-gray-100 flex flex-col overflow-y-auto">
           {/* Your main content goes here (Dashboard, etc.) */}
           <Outlet />
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



export default EmployeeLayout;