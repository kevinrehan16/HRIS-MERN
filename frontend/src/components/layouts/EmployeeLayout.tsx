import React from 'react';
import { 
  Clock, Calendar, FileText, User, 
  ChevronRight, ArrowUpRight, Bell, 
  LogOut, LayoutDashboard, Fingerprint 
} from 'lucide-react';

const EmployeeLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">
              H
            </div>
            <span className="font-black text-slate-800 tracking-tight text-xl">HRIS.io</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Clock size={18} />} label="My Attendance" />
          <NavItem icon={<Calendar size={18} />} label="Leave Management" />
          <NavItem icon={<FileText size={18} />} label="My Payslips" />
          <NavItem icon={<Fingerprint size={18} />} label="Requests" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-[13px]">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        {/* TOP NAV */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-slate-800 font-black text-lg uppercase tracking-tight">Main Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[11px]">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* WELCOME SECTION */}
          <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Good Morning, Juan! 👋</h2>
              <p className="text-slate-500 text-[13px] font-medium mt-1">Here's what's happening with your work profile today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-slate-400 uppercase">April 21, 2026</p>
                <p className="text-sm font-bold text-slate-700">08:45 AM</p>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-[13px] shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
                <Clock size={16} /> Clock In
              </button>
            </div>
          </section>

          {/* BENTO GRID SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Vacation Leave" value="12.5" total="15" color="blue" />
            <StatCard label="Sick Leave" value="08.0" total="12" color="rose" />
            <StatCard label="Overtime (Hrs)" value="04.2" total="Monthly" color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ANNOUNCEMENTS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-800 text-[14px] uppercase tracking-wider">Company Announcements</h3>
                  <button className="text-indigo-600 text-[12px] font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                  <AnnouncementItem 
                    tag="HR" 
                    title="New Health Insurance Policy for 2026" 
                    date="2 hours ago" 
                  />
                  <AnnouncementItem 
                    tag="Operations" 
                    title="System Maintenance: April 25, 11PM - 2AM" 
                    date="1 day ago" 
                  />
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickAction icon={<Calendar />} label="File Leave" color="bg-blue-50 text-blue-600" />
                <QuickAction icon={<FileText />} label="Payslip" color="bg-indigo-50 text-indigo-600" />
                <QuickAction icon={<Fingerprint />} label="Correction" color="bg-amber-50 text-amber-600" />
                <QuickAction icon={<User />} label="Profile" color="bg-slate-50 text-slate-600" />
              </div>
            </div>

            {/* UPCOMING EVENTS / SCHEDULE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-slate-800 text-[14px] uppercase tracking-wider mb-6">Your Schedule</h3>
              <div className="space-y-6">
                <ScheduleItem time="08:00 AM" label="Shift Start" />
                <ScheduleItem time="12:00 PM" label="Lunch Break" isBreak />
                <ScheduleItem time="05:00 PM" label="Shift End" />
                <div className="pt-4 border-t border-dashed border-slate-200">
                  <p className="text-[11px] font-bold text-slate-400 uppercase mb-3">Holiday this week</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded bg-white flex items-center justify-center shadow-sm">🗓️</div>
                    <span className="text-[12px] font-bold text-slate-700">April 24 - Special Holiday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-bold text-[13px] ${
    active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`}>
    {icon} <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, total, color }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={`text-3xl font-black text-slate-800`}>{value}</span>
      <span className="text-slate-400 font-bold text-sm">/ {total}</span>
    </div>
    <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full bg-${color}-500`} style={{ width: '70%' }}></div>
    </div>
  </div>
);

const AnnouncementItem = ({ tag, title, date }) => (
  <div className="group cursor-pointer flex items-start gap-4">
    <div className="py-1 px-2 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter">
      {tag}
    </div>
    <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-0">
      <p className="text-[13px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">{title}</p>
      <p className="text-[11px] text-slate-400 mt-1">{date}</p>
    </div>
    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
  </div>
);

const QuickAction = ({ icon, label, color }) => (
  <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group text-center flex flex-col items-center gap-3">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <span className="text-[12px] font-bold text-slate-700">{label}</span>
  </div>
);

const ScheduleItem = ({ time, label, isBreak = false }) => (
  <div className="flex items-center gap-4">
    <div className="w-16 text-[11px] font-black text-slate-400">{time}</div>
    <div className={`h-2 w-2 rounded-full ${isBreak ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>
    <div className="text-[13px] font-bold text-slate-700">{label}</div>
  </div>
);

export default EmployeeLayout;