import React, { useState } from 'react';
import { FilePenLine, Calendar, Plus, SearchIcon, Download, Check, X, LogOut, LogIn } from 'lucide-react';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';

import { useCorrections } from '../../../hooks/useCorrection';
import { formatDisplayTime, formatDate } from '../../../utils/formatters';
import { notificationService } from '../../../utils/notifications';


const AttendanceCorrection = () => {
  const { correctionsQuery, approveCorrectionMutation, rejectCorrectionMutation } = useCorrections();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: corrections, isLoading, isError } = correctionsQuery;

  const handleApprove = async (correction) => {
    const result = await notificationService.confirm(
      'Approve Attendance Correction?',
      `Are you sure you want to approve the attendance correction request for ${correction.employee.firstName} ${correction.employee.lastName}?`
    );

    if (result.isConfirmed) {
      await executeStatusUpdate(correction.id, 'APPROVED');
    }
  };

  const handleReject = async (correction) => {
    const result = await notificationService.prompt(
      'Reject Attendance Correction',
      `Please provide a justification for rejecting the attendance correction request of ${correction.employee.firstName} ${correction.employee.lastName}:`,
      'Enter rejection reason...'
    );

    // Sa prompt, ang input value ay nasa result.value
    if (result.isConfirmed && result.value) {
      executeStatusUpdate(correction.id, 'REJECTED', result.value);
    }
  };

  const executeStatusUpdate = async (id, action, adminRemarks = "") => {
    try {
      if (action === 'APPROVED') {
        await approveCorrectionMutation.mutateAsync({ id, adminRemarks });
        notificationService.toast('The attendance correction has been approved successfully.');
      } else if (action === 'REJECTED') {
        await rejectCorrectionMutation.mutateAsync({ id, adminRemarks });
        notificationService.toast('The attendance correction has been rejected successfully.');
      }
    } catch (error) {
      notificationService.toast('An error occurred while processing the request. Please try again.');
    }
  };

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

      <div className="px-6 pb-1 flex-1 flex flex-col min-h-0 relative">
        
        {/* CARD CONTAINER */}
        {/* Ginamit ang calc(100vh - constant) para laging saktong-sakto sa view */}
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

          {/* TABLE AREA - Dito lang ang may scrollbar */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-300 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '22%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '18%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Correction Detail</th>
                  <th style={{ width: '29%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Reason</th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Type/Badge</th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Submitted Date</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={5} columns={5} />
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-red-500 font-semibold">Failed to load data. Please try again.</td>
                  </tr>
                ) : corrections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-500 font-medium">No correction requests found.</td>
                  </tr>
                ) : (
                  corrections.map(correction => (
                    <tr key={correction.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-100">
                      {/* 1. EMPLOYEE */}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-xs">
                            {correction.employee.firstName[0]}{correction.employee.lastName[0]}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate text-xs">
                              {correction.employee.firstName} {correction.employee.lastName}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              {correction.employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. LOG CHANGES (COMPARISON) */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {/* TIME IN */}
                          {correction.requestedTimeIn && (
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-blue-50 rounded-md text-blue-600 border border-blue-100">
                                <LogIn size={12} strokeWidth={3} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-slate-400 line-through italic">{formatDisplayTime(correction.attendance.timeIn)}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-bold text-slate-700">{formatDisplayTime(correction.requestedTimeIn)}</span>
                              </div>
                            </div>
                          )}

                          {/* TIME OUT */}
                          {correction.requestedTimeOut && (
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-purple-50 rounded-md text-purple-600 border border-purple-100">
                                <LogOut size={12} strokeWidth={3} />
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-slate-400 line-through italic">{formatDisplayTime(correction.attendance.timeOut)}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-bold text-slate-700">{formatDisplayTime(correction.requestedTimeOut)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. REASON */}
                      <td className="px-4 py-3">
                        <div className="text-[13px] text-slate-500 italic line-clamp-1 max-w-[300px] cursor-help" title={correction.reason}>
                          "{correction.reason}"
                        </div>
                      </td>

                      {/* 4. TYPE/BADGE - Dito natin ilalagay yung Correction Type */}
                      <td className="px-4 py-3 text-center">
                        <span className={`
                          px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border
                          ${correction.type === 'TIME_IN' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                            correction.type === 'TIME_OUT' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                            'bg-slate-50 text-slate-600 border-slate-200'}
                        `}>
                          {correction.type.replace('_', ' ')}
                        </span>
                      </td>

                      {/* 5. SUBMITTED DATE */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-slate-600">
                            {formatDate(correction.createdAt)}
                          </span>
                          <span className="text-[12px] text-slate-400">
                            {formatDisplayTime(correction.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* 6. ACTIONS */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleApprove(correction)}
                            className="p-1.5 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-md transition-all border border-emerald-100 bg-emerald-50/30"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            onClick={() => handleReject(correction)}
                            className="p-1.5 hover:bg-rose-500 hover:text-white text-rose-600 rounded-md transition-all border border-rose-100 bg-rose-50/30"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

export default AttendanceCorrection;