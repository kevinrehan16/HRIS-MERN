import React, { useEffect, useRef, useState } from 'react'
import { Menu, Bell, ChevronDown, AtSign, User, Lock, LogOut } from 'lucide-react'

import { useAuthStore } from '../../../store/authStore'

import { useEmpNotificationQuery, useMarkAsReadMutation } from '../../../hooks/employee/useEmpNotification';

import { getInitials, timeAgo } from '../../../utils/formatters';

interface EmpTopbarProps {
  isCollapsed: boolean,
  setIsCollapsed: (value: boolean) => void;
  firstName: string,
  lastName: string,
  email: string,
}

const EmpTopbar: React.FC<EmpTopbarProps> = ({ isCollapsed, setIsCollapsed, firstName, lastName, email }) => {
  const { user, logout } = useAuthStore();
  const [openNotif, setOpenNotif] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownNotif = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }

      if (dropdownNotif.current && !dropdownNotif.current.contains(event.target)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: notifications, isLoading, isError } = useEmpNotificationQuery();
  const { mutate: markAsRead } = useMarkAsReadMutation();

  const handleMarkAsRead = (id) => {
    markAsRead(id, {
      onSuccess: () => {
        console.log("Success!");
  // Siguraduhin na 'notifications' ang queryKey mo
      },
      onError: (error) => {
        console.error("Error marking as read:", error);
      }
    });
  };

  const [filter, setFilter] = useState('all');
  const filteredNotifications = notifications?.filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    return true; // Kung 'all', ipakita lahat
  }) ?? [];

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
            <div className="relative inline-block" ref={dropdownNotif}>
              <button 
                onClick={() => setOpenNotif(!openNotif)}
                className="p-1.5 pb-2.5 text-slate-400 hover:text-purple-400 hover:bg-slate-50 rounded-lg transition-all relative"
              >
                <Bell size={16} strokeWidth={2.5} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></span>
              </button>
              {/* Popup */}
              {openNotif && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in duration-150 origin-top-right overflow-hidden">
                  {/* Header (same style as profile dropdown) */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-lg mb-2 font-bold text-slate-800">
                        Notifications
                      </p>
                      <div className="py-2 flex items-center gap-1">
                        <button
                          onClick={() => setFilter('all')}
                          className={`px-3 py-1 !rounded-full text-sm font-normal transition-all ${
                            filter === 'all' 
                              ? 'bg-purple-700 text-white' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilter('unread')}
                          className={`px-3 py-1 !rounded-full text-sm font-normal transition-all ${
                            filter === 'unread' 
                              ? 'bg-purple-700 text-white' 
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          Unread
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="max-h-72 overflow-y-auto">

                    {filteredNotifications.map((notif, index) => (
                      <div
                        key={notif.id}
                        className="flex gap-3 px-4 py-3 hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                      >

                        {/* Icon / Dot */}
                        <div className="relative mt-1">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Bell size={14} className="text-purple-500" />
                          </div>

                          {/* unread dot */}
                          {notif.isRead == 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border border-white"></span>}
                          
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-semibold text-slate-800 truncate m-0">
                            {notif.title}
                          </p>

                          <p className="text-xs text-slate-500 mt-0.5 mb-1 m-0">
                            {notif.message}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between gap-1">
                            <span className="text-[11px] text-slate-400 whitespace-nowrap">
                              {timeAgo(notif.createdAt)}
                            </span>
                            
                            {notif.isRead == 0 && <span className="text-[10px] p-2 rounded-full font-semibold text-purple-500 opacity-0 group-hover:!opacity-100 hover:bg-purple-500 hover:text-white transition-all" onClick={() => handleMarkAsRead(notif.id)}>
                              Mark as read
                            </span>}
                            
                          </div>

                          
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40 flex justify-center">
                    <button className="text-sm !rounded-md w-full p-1.5 font-semibold bg-slate-400 text-white hover:!text-white hover:!bg-purple-600 transition-all">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                      {getInitials(firstName, lastName)}
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
                    {/* Footer: Logout */}
                    <div className="pt-0.5 mt-0.5 border-t border-slate-100">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 border-0 bg-transparent group/logout"
                      >
                        <LogOut size={16} className="text-slate-400 group-hover/logout:text-red-500" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
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
