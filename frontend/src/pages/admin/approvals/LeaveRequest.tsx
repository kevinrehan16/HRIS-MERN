import React, { useState } from 'react';
import { CalendarRange, Calendar, Plus, SearchIcon, X, Check } from 'lucide-react';

import PageHeader from '../../../components/common/PageHeader';

const LeaveRequest = () => {

  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Leave Requests" 
        subtitle="Manage and review pending leave requests"
        titleIcon={<CalendarRange size={25} className="text-white" />}
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
          <Calendar size={18} />
          <span className="text-sm font-medium">Mar 30, 2026 - Mar 30, 2026</span>
        </div>
      </PageHeader>

      {/* MAIN BODY CONTAINER */}
      <div className="px-6 pb-6">
        
        {/* ANG MALAKING CARD NA NAKAPATONG */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 min-h-[400px]">
          {/* TOOLBAR */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              
              {/* <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={20} /> Add Position
              </button> */}
            </div>
          </div>

          {/* TABLE */}
          <div className="relative overflow-y-auto overflow-x-auto h-[370px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                  <th style={{ width: '30%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Employee Information</th>
                  <th style={{ width: '20%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Date & Schedule</th>
                  <th style={{ width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Actual Logs</th>
                  <th style={{ width: '15%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">OT Duration</th>
                  <th style={{ width: '10%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>
              {/* Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees */}
            </span>
            <div className="flex gap-2 items-center">
              <button 
                // onClick={() => setPage(p => Math.max(1, p - 1))}
                // disabled={page === 1 || isLoading}
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Prev</button>
              <div className="flex gap-1">
                {/* {(() => {
                  const totalPages = pagination?.totalPages || 0;
                  const current = page;
                  const pages = [];

                  // Logic para sa Visible Pages
                  // Kung gusto mo ng "1 2 3 4 5 ...", ipakita natin ang unang 5 pages
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 || // Laging ipakita ang page 1
                      i === totalPages || // Laging ipakita ang last page
                      (i >= current - 1 && i <= current + 1) // Ipakita ang katabi ng current page
                    ) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "...") {
                      // Maglagay ng ellipsis kung may gap sa numbers
                      pages.push("...");
                    }
                  }

                  return pages.map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
                      disabled={pageNum === "..."}
                      className={`px-3 py-1 border rounded-md transition-all ${
                        page === pageNum 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : pageNum === "..." 
                            ? "bg-transparent border-transparent text-slate-400 cursor-default"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()} */}
              </div>
              <button 
                // onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
                // disabled={page === pagination?.totalPages || isLoading}
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeaveRequest;