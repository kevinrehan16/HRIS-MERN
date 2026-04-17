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
      <div className="flex flex-col flex-grow-1 min-vw-0 h-screen">
        
        {/* 3. TOPBAR */}
        <Topbar 
          isCollapsed={isCollapsed} 
          toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
          toggleMobile={() => setIsMobileOpen(true)}
        />

        {/* 4. MAIN CONTENT (SCROLLABLE) */}
        {/* Pinalitan ang overflow-y-auto ng overflow-hidden para ang Card sa loob ang mag-scroll */}
        <main className="flex-1 overflow-hidden p-0 bg-gray-100 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>
        
        {/* 5. FOOTER */}
        <Footer />
        
      </div>
    </div>
  );
};

export default AdminLayout;