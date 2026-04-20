import React, { useState } from 'react';
import { CalendarCog, Calendar, Plus, SearchIcon, Settings2, Download, MoreVertical } from 'lucide-react';

import { getInitials, formatDate } from '../../../utils/formatters';
import { useLeave } from '../../../hooks/useLeave';
import { notificationService } from '../../../utils/notifications';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import NoDataFound from '../../../components/common/NoDataFound';

const Leaves = () => {
  const { leaveQuery } = useLeave();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leaves, isLoading, isError } = leaveQuery;

  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Leaves" 
        subtitle="Manage and review pending leave requests"
        titleIcon={<CalendarCog size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all shrink-0">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      {/* MAIN BODY CONTAINER */}
      <div className="px-6 pb-1 flex-1 flex flex-col min-h-0 relative">
        
        {/* ANG MALAKING CARD NA NAKAPATONG */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 flex-1 flex flex-col overflow-hidden max-h-full">
          {/* TOOLBAR */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30 shrink-0">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                // onClick={() => handleAddNewClick()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 !rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 shrink-0 text-xs"
              >
                <Plus size={16} /> Add Corrections
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-300 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Used / Total Allocation</th>
                  <th style={{ width: '15%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Recent Activity</th>
                  <th style={{ width: '15%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Upcoming Activity</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Available Credits</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} cols={6} />
                ) : (
                  leaves && leaves.length > 0 ? (
                    leaves.map((record) => (
                      <tr key={record.employeeId} className="hover:bg-slate-50/80 transition-all border-b border-slate-100 group">
                        {/* 1. EMPLOYEE SECTION (Consistent) */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-[10px]">
                              {getInitials(record.firstName, record.lastName)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[11px] truncate">
                                {record.firstName} {record.lastName}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                {record.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. LEAVE BREAKDOWN (Minimalist Progress style) */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-6">
                            {/* Vacation Leave Column */}
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Vacation</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[11px] font-bold text-slate-700">{record.usedVL}</span>
                                <span className="text-[9px] text-slate-400">/ {record.totalVL}</span>
                              </div>
                            </div>

                            {/* Sick Leave Column */}
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Sick</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-[11px] font-bold text-slate-700">{record.usedSL}</span>
                                <span className="text-[9px] text-slate-400">/ {record.totalSL}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. LAST LEAVE TAKEN */}
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Last Taken:</span>
                              <span className="text-[10px] text-slate-600 font-medium">
                                {record.lastLeaveDate ? formatDate(record.lastLeaveDate) : 'No history yet'}
                              </span>
                          </div>
                        </td>

                        {/* 4. UPCOMING LEAVE */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {/* 1. COMPACT AVATAR WITH INITIALS */}
                            <div className="relative">
                              {/* Small Notification Indicator (Ping) */}
                              {record.pendingCount > 0 && (
                                <span className="flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 border border-white"></span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                {/* Simplified Pending Label */}
                                {record.pendingCount > 0 && (
                                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter flex items-center gap-0.5">
                                    {record.pendingCount} For Review
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 5. TOTAL REMAINING (The "Big Box" Right-Side) */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Available</div>
                              <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Credits to date</div>
                            </div>
                            
                            {/* The Big Balance Box */}
                            <div className="flex flex-col items-center justify-center min-w-[40px] h-[40px] rounded-lg border border-emerald-100 bg-emerald-50/50 text-emerald-600 shadow-sm">
                              <span className="text-sm font-black leading-none">
                                {record.remainingTotal}
                              </span>
                              <span className="text-[7px] font-bold uppercase tracking-tighter">Days</span>
                            </div>
                          </div>
                        </td>

                        {/* 6. ACTION (Edit Credits / View Ledger) */}
                        <td className="px-4 py-2 text-center">
                          <button className="p-1.5 rounded-md text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-slate-100 transition-all">
                            <Settings2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <NoDataFound
                          messageIcon={<CalendarCog size={48} className="opacity-20" />} 
                          message='No record found.'
                          subMessage='Everything is up to date!'
                        />                      
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>
              {/* Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees */}
            </span>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors">Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Leaves;