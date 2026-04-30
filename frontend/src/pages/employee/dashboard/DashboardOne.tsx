import React, { useState } from 'react';
import { Clock, Timer, LogOut, Coffee, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { formatShiftSchedule, formatCurrency, formatDate } from '../../../utils/formatters';

const DashboardOne = () => {
  const { user } = useAuthStore();

  // Mock data for calculation
  const totalShiftHours = 9; // e.g., 8am to 5pm
  const renderedHours = 8.4; // 8:24 renderred
  const progressPercentage = (renderedHours / totalShiftHours) * 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
      <div className="h-50 bg-slate-950 absolute top-0 left-0 right-0 z-0" />
      
      <div className="w-full space-y-8 relative z-10 px-4 p-6 md:px-8">
        
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black !text-slate-100">
              Good Morning, {user?.firstName || 'there'}!👋
          </h2>
          <p className="text-slate-400 text-[13px] italic font-medium mt-1">Here's what's happening with your work profile today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 !rounded-md font-bold text-[13px] shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center gap-2">
            <Clock size={20} /> Clock In
          </button>
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-lg p-7 shadow-lg shadow-slate-100 flex flex-col justify-between group hover:border-purple-300 transition-all">
      
      {/* 1. TOP BAR: ACTIVITY & STATUS */}
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Shift Activity</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">NODE_004 • CAVITE</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[11px] font-black rounded uppercase tracking-tighter shadow-inner shadow-purple-100">
            ON DUTY
          </span>
          <span className="text-[10px] font-bold text-slate-300">ID: EMP-2026-004</span>
        </div>
      </div>

      {/* 2. THE MAIN HUB: COUNTER + GRAPH (GITNA) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 my-6 border-y border-slate-100 py-6">
        
        {/* Rendered Hours Counter */}
        <div className="flex-shrink-0">
          <h2 className="text-6xl font-black text-slate-950 tracking-tighter tabular-nums drop-shadow-sm">
            08:24<span className="text-purple-600">:</span>12
          </h2>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mt-1">Rendered Hours Today</p>
        </div>

        {/* ─── SHIFT PROGRESS TIMELINE GRAPH (NEW) ─── */}
        <div className="flex-1 lg:max-w-md w-full relative group">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black text-slate-400 uppercase">Live Shift Progress</span>
             <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">{progressPercentage.toFixed(0)}% Done</span>
          </div>
          
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-200">
             {/* Progress Fill */}
             <div 
               className="absolute top-0 left-0 h-full bg-purple-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(124,58,237,0.4)]" 
               style={{ width: `${progressPercentage}%` }} 
             />
             {/* Static Markers (Lunch/Breaks) */}
             <div className="absolute left-[50%] h-full w-0.5 bg-white group-hover:bg-amber-400 transition-colors" title="Lunch Break (4hr mark)" />
          </div>

          <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2">
             <span>08:00 AM (Start)</span>
             <span>05:00 PM (Out)</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR: ACTIONS & METRICS */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-10">
          <TimeBlock label="Time In" time="08:02 AM" />
          <div className="w-px h-10 bg-slate-100 self-stretch" />
          <TimeBlock label="Expected Out" time="05:00 PM" isExpected />
        </div>
        
        <div className="flex items-center gap-3">
           <button className="p-3 bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all">
              <Coffee size={20} />
           </button>
           <button className="px-6 py-3 bg-slate-950 text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:bg-purple-700 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
              <LogOut size={16} />
              Clock Out
           </button>
        </div>
      </div>

    </div>
        

      </div>
    </div>
  );
};

// Sub-component for clean rendering
const TimeBlock = ({ label, time, isExpected }: any) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-base font-black ${isExpected ? 'text-slate-400 italic' : 'text-slate-950'}`}>{time}</p>
  </div>
);

export default DashboardOne;