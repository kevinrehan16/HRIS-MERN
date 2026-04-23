import React, { useState } from 'react';
import { CalendarRange, Calendar, Plus, SearchIcon, X, Check, Download, MoreVertical } from 'lucide-react';

import { getInitials, calculateLeaveDays, getMonthShort, getDayNumber } from '../../../utils/formatters';
import { useLeaveRequest } from '../../../hooks/useLeaveRequest';
import { notificationService } from '../../../utils/notifications';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import NoDataFound from '../../../components/common/NoDataFound';

const LeaveRequest = () => {
  const { leaveRequestQuery, approveLeaveMutation, rejectLeaveMutation } = useLeaveRequest();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: leaveRequests, isLoading, isError } = leaveRequestQuery;

  const handleApprove = async (request) => {
    const result = await notificationService.confirm(
      'Approve Leave Request?',
      `Are you sure you want to approve the leave request for ${request.employee.firstName} ${request.employee.lastName}?`
    );

    if (result.isConfirmed) {
      await executeStatusUpdate(request.id, 'APPROVED');
    }
  }

  const handleReject = async (request) => {
    const result = await notificationService.prompt(
      'Reject Leave Request',
      `Please provide a justification for rejecting the Leave Request of ${request.employee.firstName} ${request.employee.lastName}:`,
      'Enter rejection reason...'
    );

    // Sa prompt, ang input value ay nasa result.value
    if (result.isConfirmed && result.value) {
      executeStatusUpdate(request.id, 'REJECTED', result.value);
    }
  };

  const executeStatusUpdate = async (id, action, adminRemarks = "") => {
    try {
      if (action === 'APPROVED') {
        await approveLeaveMutation.mutateAsync({ id, adminRemarks });
        notificationService.toast('The Leave Request has been approved successfully.');
      } else if (action === 'REJECTED') {
        await rejectLeaveMutation.mutateAsync({ id, adminRemarks });
        notificationService.toast('The Leave Request has been rejected successfully.');
      }
    } catch (error) {
      notificationService.toast('An error occurred while processing the request. Please try again.');
    }
  };


  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Leave Requests" 
        subtitle="Manage and review pending leave requests"
        titleIcon={<CalendarRange size={25} className="text-white" />}
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
                  <th style={{ width: '25%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Leave Type</th>
                  <th style={{ width: '15%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Inclusive Dates</th>
                  <th style={{ width: '25%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Purpose / Reason</th>
                  <th style={{ width: '15%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Status</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} columns={6} />
                ) : (
                  leaveRequests && leaveRequests.length > 0 ? (
                    leaveRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-100 group">
                        
                        {/* 1. EMPLOYEE SECTION (Consistent with Attendance) */}
                        <td className="px-4 py-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-[10px]">
                              {getInitials(request.employee.firstName, request.employee.lastName)}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-800 text-[11px] group-hover:text-blue-600 transition-colors truncate">
                                {request.employee.firstName} {request.employee.lastName}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                {request.employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. LEAVE TYPE & DURATION */}
                        <td className="px-4 py-1.5">
                          <div className="flex items-center gap-2 group">
                            {/* LEFT SIDE: Big Day Box */}
                            <div className={`flex flex-col items-center justify-center min-w-[36px] h-[36px] rounded-lg border shadow-sm transition-all group-hover:scale-105 ${
                              request.type === 'SICK' ? 'bg-rose-50/30 border-rose-100 text-rose-600' :
                              request.type === 'VACATION' ? 'bg-blue-50/30 border-blue-100 text-blue-600' :
                              'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                              <span className="text-sm font-black leading-none">
                                {calculateLeaveDays(request.startDate, request.endDate)}
                              </span>
                              <span className="text-[7px] font-bold uppercase tracking-tighter opacity-70">
                                Days
                              </span>
                            </div>
                            {/* RIGHT SIDE: Type & Dates */}
                            <div className="flex flex-col gap-0.5">
                              {/* Leave Type with Dot */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                                  {request.type} LEAVE
                                </span>
                              </div>

                              {/* Timeline Text */}
                              <div className="flex items-center text-[11px] text-slate-500 font-medium">
                                <span>{getMonthShort(request.startDate)} {getDayNumber(request.startDate)}</span>
                                <span className="mx-1.5 text-slate-300">—</span>
                                <span>{getMonthShort(request.endDate)} {getDayNumber(request.endDate)}</span>
                              </div>
                            </div>

                          </div>
                        </td>

                        {/* 3. INCLUSIVE DATES (Compact Calendar Look) */}
                        <td className="px-4 py-1.5 border-r border-slate-50">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex flex-col items-center justify-center w-7 h-7 rounded bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                              <span className="text-[7px] font-bold uppercase leading-none">
                                {new Date(request.startDate).toLocaleString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-[10px] font-black leading-none mt-0.5">
                                {new Date(request.startDate).getDate()}
                              </span>
                            </div>
                            <div className="text-slate-300">→</div>
                            <div className="flex flex-col items-center justify-center w-7 h-7 rounded bg-slate-50 text-slate-600 shrink-0 border border-slate-100">
                              <span className="text-[7px] font-bold uppercase leading-none">
                                {new Date(request.endDate).toLocaleString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-[10px] font-black leading-none mt-0.5">
                                {new Date(request.endDate).getDate()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. REASON SECTION (Truncated for clean look) */}
                        <td className="px-4 py-1.5">
                          <div className="text-[13px] text-slate-500 italic line-clamp-1 max-w-[300px] cursor-help" title={request.reason}>
                            "{request.reason}"
                          </div>
                        </td>

                        {/* 5. STATUS SECTION (Consistent Badge Style) */}
                        <td className="px-4 py-1.5 text-center">
                          <div className={`text-[10px] font-bold uppercase tracking-widest text-center py-1 rounded-md border-b-2 ${
                            request.status === 'APPROVED' ? 'text-emerald-600 border-emerald-200 bg-emerald-50/30' :
                            request.status === 'PENDING' ? 'text-amber-600 border-amber-200 bg-amber-50/30' :
                            request.status === 'REJECTED' ? 'text-rose-600 border-rose-200 bg-rose-50/30' : 
                            'text-slate-400 border-slate-200 bg-slate-50/30'
                          }`}>
                            {request.status}
                          </div>
                        </td>

                        {/* 6. ACTIONS SECTION */}
                        <td className="px-4 py-1.5 text-center">
                          <div className="flex justify-center items-center gap-1">
                            {request.status === 'PENDING' && (
                              <>
                                <button 
                                  className="p-1.5 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-md transition-all border border-emerald-100 bg-emerald-50/30"
                                  onClick={()=>handleApprove(request)}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </button>
                                <button 
                                  className="p-1.5 hover:bg-rose-500 hover:text-white text-rose-600 rounded-md transition-all border border-rose-100 bg-rose-50/30"
                                  onClick={()=>handleReject(request)}  
                                >
                                  <X size={12} strokeWidth={3} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <NoDataFound
                          messageIcon={<CalendarRange size={48} className="opacity-20" />} 
                          message='No pending leave requests'
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

export default LeaveRequest;