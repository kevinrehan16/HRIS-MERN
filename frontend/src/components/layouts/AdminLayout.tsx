import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout, user } = useAuthStore();

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      {/* 1. SIDEBAR */}
      <Sidebar isCollapsed={isCollapsed} logout={logout} />

      {/* 2. MAIN BODY WRAPPER */}
      <div className="flex flex-col flex-grow-1 min-vw-0">
        
        {/* 3. TOPBAR */}
        <Topbar 
          isCollapsed={isCollapsed} 
          toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
          toggleMobile={() => setIsMobileOpen(true)}
        />

        {/* 4. MAIN CONTENT (SCROLLABLE) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-0">
          <div className="container-fluid p-0">
            <Outlet />
          </div>
          <Footer />
        </main>
        
      </div>
    </div>
  );
};

export default AdminLayout;