import React from 'react'
import { ArrowUpRight, Clock, Calendar, FileText, Fingerprint, User } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

const Dashboard = () => {

  const { user } = useAuthStore();

  return (
    <>
      <div className="p-6 sm:p-6 bg-gray-100 min-h-screen">
        {/* WELCOME SECTION */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
                Good Morning, {user?.firstName || 'there'}! 👋
            </h2>
            <p className="text-slate-500 text-[13px] font-medium mt-1">Here's what's happening with your work profile today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-slate-400 uppercase">April 21, 2026</p>
              <p className="text-sm font-bold text-slate-700">08:45 AM</p>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-[13px] shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2">
              <Clock size={16} /> Clock In
            </button>
          </div>
        </section>

        {/* STAT CARDS */}
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
                <button className="text-purple-600 text-[12px] font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                <AnnouncementItem tag="HR" title="New Health Insurance Policy for 2026" date="2 hours ago" />
                <AnnouncementItem tag="Operations" title="System Maintenance: April 25, 11PM - 2AM" date="1 day ago" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction icon={<Calendar />} label="File Leave" color="bg-blue-50 text-blue-600" />
              <QuickAction icon={<FileText />} label="Payslip" color="bg-purple-50 text-purple-600" />
              <QuickAction icon={<Fingerprint />} label="Correction" color="bg-amber-50 text-amber-600" />
              <QuickAction icon={<User />} label="Profile" color="bg-slate-50 text-slate-600" />
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-800 text-[14px] uppercase tracking-wider mb-6">Your Schedule</h3>
            <div className="space-y-6">
              <ScheduleItem time="08:00 AM" label="Shift Start" />
              <ScheduleItem time="12:00 PM" label="Lunch Break" isBreak />
              <ScheduleItem time="05:00 PM" label="Shift End" />
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

// --- SUB-COMPONENTS --- (Huwag kalimutang i-export o ilagay sa hiwalay na file kung gusto mo)
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
    <div className="py-1 px-2 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter">{tag}</div>
    <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-0">
      <p className="text-[13px] font-bold text-slate-700 group-hover:text-purple-600 transition-colors leading-snug">{title}</p>
      <p className="text-[11px] text-slate-400 mt-1">{date}</p>
    </div>
    <ArrowUpRight size={14} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
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
    <div className={`h-2 w-2 rounded-full ${isBreak ? 'bg-amber-400' : 'bg-purple-500'}`}></div>
    <div className="text-[13px] font-bold text-slate-700">{label}</div>
  </div>
);

export default Dashboard
