import React from 'react';
import { FilePenLine, Plus, SearchIcon, Download } from 'lucide-react';

import PageHeader from '../../../components/common/PageHeader';


const EmpAttendanceCorrection = () => {

  return (
    /* Ginamit ang min-h-full para mag-stretch ang background color */
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Attendance Corrections" 
        subtitle="Manage and review pending attendance corrections"
        titleIcon={<FilePenLine size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all shrink-0">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      <div className="px-6 pb-4 flex-1 flex flex-col min-h-0 relative">
        
        {/* CARD CONTAINER */}
        {/* Ginamit ang calc(100vh - constant) para laging saktong-sakto sa view */}
        <div className="bg-white rounded-md shadow-xl border border-slate-200 -mt-28 flex-1 flex flex-col overflow-hidden min-h-0">
          
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

          {/* TABLE AREA - Dito lang ang may scrollbar */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-50 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '22%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '18%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Correction Detail</th>
                  <th style={{ width: '29%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Reason</th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Type/Badge</th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Submitted Date</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>Showing 0 to 0 of 0 Entries</span>
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

export default EmpAttendanceCorrection;