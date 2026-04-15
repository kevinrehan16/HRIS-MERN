import React, { useState } from 'react';
import { ClockArrowUp, Calendar, Plus, SearchIcon, X, Check } from 'lucide-react';

import { useAttendance } from '../../../hooks/useAttendance';

import { formatDate, getInitials, formatShiftSchedule } from '../../../utils/formatters';
import { notificationService } from '../../../utils/notifications';

import TableSkeleton from '../../../components/common/TableSkeleton'
import PageHeader from '../../../components/common/PageHeader';

const Overtimerequest = () => {
  const { overtimeRequestsQuery, updateOvertimeStatusMutation } = useAttendance();
  const { data: overtimeRequests, isLoading } = overtimeRequestsQuery;

  const [processingId, setProcessingId] = useState(null);

  const handleApprove = async (record) => {
    const result = await notificationService.confirm(
      'Approve Overtime?',
      `Are you sure you want to approve the overtime request for ${record.employee.firstName} ${record.employee.lastName}?`
    );

    if (result.isConfirmed) {
      executeStatusUpdate(record.id, 'APPROVED');
    }
  };

  // --- REJECT HANDLER ---
  const handleReject = async (record) => {
    const result = await notificationService.prompt(
      'Reject Overtime',
      `Please provide a justification for rejecting the overtime request of ${record.employee.firstName} ${record.employee.lastName}:`,
      'Enter rejection reason...'
    );

    // Sa prompt, ang input value ay nasa result.value
    if (result.isConfirmed && result.value) {
      executeStatusUpdate(record.id, 'REJECTED', result.value);
    }
  };

  // --- CORE EXECUTION (Cleaned Up) ---
  const executeStatusUpdate = async (id, status, remarks = null) => {
    setProcessingId(id);
    try {
      await updateOvertimeStatusMutation.mutateAsync({
        attendanceId: id,
        status,
        remarks
      });
      
      notificationService.toast(`Overtime ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating overtime status:", error);
      notificationService.toast(error.response?.data?.message || "Failed to update status", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Overtime Requests" 
        subtitle="Manage and review pending overtime requests"
        titleIcon={<ClockArrowUp size={35} className="text-white" />}
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
          <Calendar size={18} />
          <span className="text-sm font-medium">Mar 30, 2026 - Mar 30, 2026</span>
        </div>
      </PageHeader>

      {/* MAIN BODY CONTAINER */}
      <div className="px-6 pb-10">
        
        {/* ANG MALAKING CARD NA NAKAPATONG */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 p-2 min-h-[462px]">
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
          <div className="relative overflow-y-auto overflow-x-auto h-[310px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                  <th style={{ width: '30%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Employee</th>
                  <th style={{ width: '20%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Date & Schedule</th>
                  <th style={{ width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Actual Logs</th>
                  <th style={{ width: '15%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">OT Duration</th>
                  <th style={{ width: '10%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : overtimeRequests && overtimeRequests.length > 0 ? (
                  overtimeRequests.map((record) => (
                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors group">
                      {/* 1. EMPLOYEE INFO */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-indigo-100 shadow-lg">
                            {getInitials(record.employee.firstName, record.employee.lastName)}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">
                              {record.employee.firstName} {record.employee.lastName}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                              {record.employee.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. DATE & SHIFT */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">
                            {formatDate(record.date)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{record.employee.schedule?.name || 'Regular Shift'}: {formatShiftSchedule(`${record.employee.schedule?.shiftStart} - ${record.employee.schedule?.shiftEnd}`)}</span>
                        </div>
                      </td>

                      {/* 3. ACTUAL LOGS */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-slate-300">In</span>
                            <span className="text-sm font-bold text-slate-600">
                              {record.timeIn ? new Date(record.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </span>
                          </div>
                          <div className="h-8 w-[1px] bg-slate-300"></div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-black text-blue-400">Out</span>
                            <span className="text-sm font-black text-blue-700">
                              {record.timeOut ? new Date(record.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. OT DURATION BADGE */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg w-fit flex items-center gap-1.5 border border-blue-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-xs font-black italic">
                              {Math.floor(record.overtimeMinutes / 60)}h {record.overtimeMinutes % 60}m
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase ml-1">Pending Approval</span>
                        </div>
                      </td>

                      {/* 5. QUICK ACTIONS */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Ginagamit natin ang isLoading mula sa iyong hook o local state */}
                          {processingId === record.id ? (
                            <div className="flex items-center gap-2 text-slate-400">
                              <div className="h-4 w-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Processing</span>
                            </div>
                          ) : (
                            <>
                              {/* REJECT BUTTON - tatawag sa notificationService.prompt */}
                              <button 
                                onClick={() => handleReject(record)}
                                disabled={processingId !== null}
                                className="group/btn p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
                                title="Reject Overtime"
                              >
                                <X size={20} strokeWidth={2.5} className="transition-transform group-hover/btn:rotate-90" />
                              </button>

                              {/* APPROVE BUTTON - tatawag sa notificationService.confirm */}
                              <button 
                                onClick={() => handleApprove(record)}
                                disabled={processingId !== null}
                                className="group/btn p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 active:scale-95 disabled:opacity-50"
                                title="Approve Overtime"
                              >
                                <Check size={20} strokeWidth={2.5} className="transition-transform group-hover/btn:scale-110" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <ClockArrowUp size={48} className="opacity-20" />
                        <p className="font-medium">No pending overtime requests</p>
                        <p className="text-xs">Everything is up to date!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
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

export default Overtimerequest;