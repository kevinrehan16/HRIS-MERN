import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, CircleDot, ClipboardClock, Wallet, FolderCog, ChevronRight, MonitorCheck } from 'lucide-react';

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/departments') || path.includes('/admin/positions')) {
      setOpenSubMenu('referentials');
    } 
    else if (
      path.includes('/admin/attendance-corrections') || 
      path.includes('/admin/leave-requests') || 
      path.includes('/admin/overtime-requests')
    ) {
      setOpenSubMenu('approvals');
    } 
    else if (!isCollapsed) {
      setOpenSubMenu(null);
    }
  }, [location.pathname, isCollapsed]);

  const toggleSubMenu = (name: string) => {
    if (!isCollapsed) setOpenSubMenu(openSubMenu === name ? null : name);
  };

  const isParentActive = (pathOrPaths: string | string[]) => {
    if (Array.isArray(pathOrPaths)) {
      return pathOrPaths.some(path => location.pathname.includes(path));
    }
    return location.pathname.includes(pathOrPaths);
  };
  const isExactActive = (path: string) => location.pathname === path;

  // REUSABLE FLOATING POPUP (UPDATED X-PADDING)
  const FloatingPopup = ({ title, links }: { title: string, links?: { label: string, to: string }[] }) => (
    <div className="absolute left-full top-0 hidden group-hover/item:block z-[9999] animate-in slide-in-from-left-1">
      <div className="w-52 bg-[#1e293b] shadow-[12px_0_35px_rgba(0,0,0,0.5)] rounded-r-xl border-y border-r border-white/10 overflow-hidden">
        
        {/* Header - px-4 para pantay sa sidebar links */}
        <div className={`px-4 py-2.5 font-semibold text-[0.95rem] leading-none flex items-center h-[calc(22px+1.25rem+2px)] ${links ? 'bg-white/5 border-b border-white/5' : ''}`}>
          <span className="text-white/40 uppercase tracking-wider text-[0.75rem]">{title}</span>
        </div>
        
        {links && (
          <div className="py-1">
            {links.map((link) => {
              const isActive = isExactActive(link.to);
              return (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`flex items-center gap-3 px-4 py-2 text-[0.9rem] font-medium transition-all !no-underline group/sub ${
                    isActive ? '!text-[#2563eb]' : 'text-white hover:!text-[#2563eb]'
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="flex-shrink-0 opacity-50">
                    <CircleDot size={14} />
                  </div>
                  <span className="truncate transition-colors">{link.label}</span>
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
        width: isCollapsed ? '70px' : '240px', // Binawasan din ang width ng kaunti (80->70, 260->240)
        backgroundColor: 'var(--sidebar-bg)',
        transition: 'width 0.3s ease',
        position: 'relative'
      }}
    >
      {/* LOGO SECTION - px-4 */}
      <div className="flex items-center px-4 border-b border-slate-200" style={{ height: '52px' }}>
        <div className="bg-slate-100 rounded-circle shadow-md flex-shrink-0">
          <img 
            src="/images/logohris.png" 
            alt="Logo" 
            className="h-6 w-6 object-contain" 
          />
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-[13px] font-bold tracking-tight text-white uppercase truncate">
            Human Resource
          </span>
        )}
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
        
        {/* SHARED CLASS: px-4 at py-2.5 */}
        {[
          { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { to: "/admin/employees", icon: Users, label: "Employees" },
          { to: "/admin/attendance", icon: ClipboardClock, label: "Attendance" },
          { to: "/admin/leaves", icon: CalendarDays, label: "Leaves" },
          { to: "/admin/payroll", icon: Wallet, label: "Payroll" },
        ].map((item) => (
          <div key={item.to} className="relative group/item">
            <Link 
              to={item.to} 
              className={`sidebar-link !rounded-none px-4 py-2.5 flex items-center ${isExactActive(item.to) ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
            >
              <item.icon size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate font-light">{item.label}</span>}
            </Link>
            {isCollapsed && <FloatingPopup title={item.label} />}
          </div>
        ))}

        {/* APPROVALS */}
        <div className="relative group/item">
          <div 
            onClick={() => toggleSubMenu('approvals')}
            className={`sidebar-link !rounded-none px-4 py-2.5 flex items-center justify-between cursor-pointer ${isParentActive(['/admin/leave-requests', '/admin/overtime-requests', '/admin/attendance-corrections']) ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <div className="flex items-center">
              <MonitorCheck size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate font-light">Approvals</span>}
            </div>
            {!isCollapsed && (
               <div className="transition-transform duration-200" style={{ transform: openSubMenu === 'approvals' ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <ChevronRight size={16} />
               </div>
            )}
          </div>

          {!isCollapsed && openSubMenu === 'approvals' && (
            <div className="bg-black/30 py-1 animate-in">
              {/* pl-12 (dating pl-14) para sa balanced look */}
              {[
                { to: "/admin/overtime-requests", label: "Overtime Requests" },
                { to: "/admin/attendance-corrections", label: "Attendance Corrections" },
                { to: "/admin/leave-requests", label: "Leave Requests" },
              ].map((sub) => (
                <Link key={sub.to} to={sub.to} className={`sub-menu-link flex items-center gap-3 pl-7 py-1.5 !rounded-none no-underline ${isExactActive(sub.to) ? 'sub-menu-active' : 'text-white/70'}`}>
                  <CircleDot size={14} className="opacity-50" />
                  <span className="text-[0.9rem]">{sub.label}</span>
                </Link>
              ))}
            </div>
          )}
          {isCollapsed && <FloatingPopup title="Approvals" links={[{ label: 'Overtime Requests', to: '/admin/overtime-requests' }, { label: 'Attendance Corrections', to: '/admin/attendance-corrections' }, { label: 'Leave Requests', to: '/admin/leave-requests' }]} />}
        </div>

        {/* REFERENTIALS */}
        <div className="relative group/item">
          <div 
            onClick={() => toggleSubMenu('referentials')}
            className={`sidebar-link !rounded-none px-4 py-2.5 flex items-center justify-between cursor-pointer ${isParentActive(['/admin/departments', '/admin/positions']) ? 'sidebar-link-active' : 'text-white/70 hover:text-white'}`}
          >
            <div className="flex items-center">
              <FolderCog size={22} className="flex-shrink-0" />
              {!isCollapsed && <span className="ml-3 truncate font-light">Referentials</span>}
            </div>
            {!isCollapsed && (
               <div className="transition-transform duration-200" style={{ transform: openSubMenu === 'referentials' ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  <ChevronRight size={16} />
               </div>
            )}
          </div>

          {!isCollapsed && openSubMenu === 'referentials' && (
            <div className="bg-black/30 py-1 animate-in">
              <Link to="/admin/departments" className={`sub-menu-link flex items-center gap-3 pl-7 py-1.5 !rounded-none no-underline ${isExactActive('/admin/departments') ? 'sub-menu-active' : 'text-white/70'}`}>
                <CircleDot size={14} className="opacity-50" />
                <span className="text-[0.9rem]">Departments</span>
              </Link>
              <Link to="/admin/positions" className={`sub-menu-link flex items-center gap-3 pl-7 py-1.5 !rounded-none no-underline ${isExactActive('/admin/positions') ? 'sub-menu-active' : 'text-white/70'}`}>
                <CircleDot size={14} className="opacity-50" />
                <span className="text-[0.9rem]">Positions</span>
              </Link>
            </div>
          )}
          {isCollapsed && <FloatingPopup title="Referentials" links={[{ label: 'Departments', to: '/admin/departments' }, { label: 'Positions', to: '/admin/positions' }]} />}
        </div>

      </nav>
    </aside>
  );
};

export default Sidebar;