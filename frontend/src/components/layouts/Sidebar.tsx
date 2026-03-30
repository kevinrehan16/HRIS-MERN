import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ChevronDown, CircleDot, Circle } from 'lucide-react';

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes('/admin/employees')) {
      setOpenSubMenu('employees');
    } else {
      setOpenSubMenu(null);
    }
  }, [location.pathname]);

  const toggleSubMenu = (name: string) => {
    if (!isCollapsed) setOpenSubMenu(openSubMenu === name ? null : name);
  };

  const isParentActive = (path: string) => location.pathname.includes(path);
  const isExactActive = (path: string) => location.pathname === path;

  // REUSABLE FLOATING POPUP
  const FloatingPopup = ({ title, links }: { title: string, links?: { label: string, to: string }[] }) => (
    <div className="absolute left-full top-0 hidden group-hover/item:block z-[9999] animate-in slide-in-from-left-1">
      <div className="w-52 bg-[#1e293b] shadow-[12px_0_35px_rgba(0,0,0,0.5)] rounded-r-xl border-y border-r border-white/10 overflow-hidden">
        
        {/* Header - px-6 para pantay sa icon padding ng sidebar */}
        <div className={`px-6 py-[26px] font-semibold text-[1rem] leading-none ${links ? 'bg-white/5 border-b border-white/5' : ''}`}>
          <span className="text-white/40">{title}</span>
        </div>
        
        {/* Sub-links - White by default, No Underline, Blue only if Active */}
        {links && (
          <div className="py-1">
            {links.map((link) => {
              const isActive = isExactActive(link.to);
              return (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`flex items-center gap-3 px-6 py-2 text-[0.95rem] font-medium transition-all !no-underline group/sub ${
                    isActive ? '!text-[#2563eb]' : 'text-white hover:!text-[#2563eb]'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  {/* Circle Icon - same logic as expanded menu */}
                  <div className="flex-shrink-0">
                    <CircleDot size={16} />
                  </div>

                  <span className="truncate transition-colors">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <aside 
      className="sidebar-transition h-screen flex flex-col shadow-xl z-50"
      style={{ 
        width: isCollapsed ? '80px' : '260px', 
        backgroundColor: 'var(--sidebar-bg)',
        transition: 'width 0.3s ease',
        position: 'relative'
      }}
    >
      {/* LOGO */}
      <div className="h-[70px] flex items-center px-6 border-b border-white/5">
        <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg flex-shrink-0">
          <span className="text-white font-bold text-xl px-1">G</span>
        </div>
        {!isCollapsed && <span className="ml-3 font-bold text-xl tracking-tight text-white uppercase">HRIS System</span>}
      </div>

      {/* NAV */}
      <nav className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        
        {/* DASHBOARD */}
        <div className="relative group/item">
          <Link 
            to="/admin/dashboard" 
            className={`sidebar-link !rounded-none px-6 py-4 flex items-center ${isExactActive('/admin/dashboard') ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <LayoutDashboard size={22} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 truncate font-semibold">Dashboard</span>}
          </Link>
          {isCollapsed && <FloatingPopup title="Dashboard" />}
        </div>

        
        <div className="relative group/item">
          <Link 
            to="/admin/employees" 
            className={`sidebar-link !rounded-none px-6 py-4 flex items-center ${isExactActive('/admin/employees') ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <Users size={22} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 truncate font-semibold">Employees</span>}
          </Link>
          {isCollapsed && <FloatingPopup title="Employees" />}
        </div>

        {/* EMPLOYEES */}
        {/* <div className="relative group/item">
          <div 
            onClick={() => toggleSubMenu('employees')}
            className={`sidebar-link !rounded-none px-6 py-4 flex items-center justify-between cursor-pointer ${isParentActive('/admin/employees') ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <div className="flex items-center">
              <Users size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate font-semibold">Employees</span>}
            </div>
            {!isCollapsed && (
               <div className="transition-transform duration-200" style={{ transform: openSubMenu === 'employees' ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <ChevronDown size={16} />
               </div>
            )}
          </div> */}

          {/* EXPANDED SUB-MENU */}
          {/* {!isCollapsed && openSubMenu === 'employees' && (
            <div className="bg-black/10 py-1 animate-in">
              <Link to="/admin/employees" className={`sub-menu-link flex items-center gap-3 pl-14 py-2 !rounded-none no-underline ${isExactActive('/admin/employees') ? 'sub-menu-active' : 'text-white/70'}`}>
                <CircleDot size={16} />
                <span className="text-[0.95rem]">All Staff</span>
              </Link>
              <Link to="/admin/employees/add" className={`sub-menu-link flex items-center gap-3 pl-14 py-2 !rounded-none no-underline ${isExactActive('/admin/employees/add') ? 'sub-menu-active' : 'text-white/70'}`}>
                <CircleDot size={16} />
                <span className="text-[0.95rem]">Add New</span>
              </Link>
            </div>
          )} */}

          {/* COLLAPSED POPUP */}
          {/* {isCollapsed && (
            <FloatingPopup 
              title="Employees" 
              links={[
                { label: 'All Staff', to: '/admin/employees' },
                { label: 'Add New', to: '/admin/employees/add' }
              ]} 
            />
          )}
        </div> */}

        {/* LEAVES */}
        <div className="relative group/item">
          <Link 
            to="/admin/leaves" 
            className={`sidebar-link !rounded-none px-6 py-4 flex items-center ${isParentActive('/admin/leaves') ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <CalendarDays size={22} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 truncate font-semibold">Leaves</span>}
          </Link>
          {isCollapsed && <FloatingPopup title="Leaves" />}
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;