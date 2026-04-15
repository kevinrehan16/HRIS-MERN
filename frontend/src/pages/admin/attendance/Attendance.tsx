import { useState } from 'react';
import { ClipboardClock, Calendar, SearchIcon, Plus, MoreVertical } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';

import { useAttendance } from '../../../hooks/useAttendance';
import TableSkeleton from '../../../components/common/TableSkeleton';
import { getInitials } from '../../../utils/formatters';

const Attendance = () => {

  const { attendanceQuery } = useAttendance();
  const { data: attendance, isLoading, error } = attendanceQuery;

  console.log("Attendance Data:", attendance);


  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Attendance" 
        subtitle="Attendance overview and content summary"
        titleIcon={<ClipboardClock size={35} className="text-white" />}
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
              
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Plus size={20} /> Add Position
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="relative overflow-y-auto overflow-x-auto h-[310px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                  <th style={{ width: '40%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Employee Informations</th>
                  <th style={{ width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Clock In</th>
                  <th style={{ width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Clock Out</th>
                  <th style={{ width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th style={{ width: '10%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} cols={5} />
                ) : (
                  attendance.logs && attendance.logs.length > 0 ? (
                    attendance.logs.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-4">
                            {/* Avatar with Initials */}
                            <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-sm">
                              {getInitials(record.employee.firstName, record.employee.lastName)}
                            </div>
                            {/* Name & ID */}
                            <div className="truncate">
                              <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                {record.employee.firstName} {record.employee.lastName}
                              </div>
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                                {record.employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-r border-slate-50">
                          <div className="flex items-center gap-3 group">
                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                              <span className="text-[10px] font-bold uppercase leading-none">
                                {record.timeIn ? new Date(record.timeIn).toLocaleString('en-US', { month: 'short' }) : '---'}
                              </span>
                              <span className="text-sm font-black">
                                {record.timeIn ? new Date(record.timeIn).getDate() : '--'}
                              </span>
                            </div>
                            
                            <div className="flex flex-col">
                              <div className="text-sm font-bold text-slate-700">
                                {record.timeIn ? new Date(record.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                              </div>
                              {record.lateMinutes > 0 ? (
                                <span className="text-[10px] font-semibold text-amber-600 px-1.5 py-0.5 bg-amber-50 rounded-md w-fit">
                                  {record.lateMinutes}m Late
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Regular Entry</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-l border-slate-50">
                          <div className="flex items-center gap-3 group">
                            {record.timeOut ? (
                              <>
                                {/* Calendar Style Date Block */}
                                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-colors ${
                                  record.undertimeMinutes > 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  <span className="text-[10px] font-bold uppercase leading-none">
                                    {new Date(record.timeOut).toLocaleString('en-US', { month: 'short' })}
                                  </span>
                                  <span className="text-sm font-black">
                                    {new Date(record.timeOut).getDate()}
                                  </span>
                                </div>

                                <div className="flex flex-col">
                                  <div className={`text-sm font-bold ${record.undertimeMinutes > 0 ? 'text-red-700' : 'text-slate-700'}`}>
                                    {new Date(record.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  
                                  {/* Undertime or OT Badge */}
                                  {record.undertimeMinutes > 0 ? (
                                    <span className="text-[10px] font-semibold text-red-600 px-1.5 py-0.5 bg-red-50 rounded-md w-fit flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/></svg>
                                      {record.undertimeMinutes}m Undertime
                                    </span>
                                  ) : record.overtimeMinutes > 0 ? (
                                    <span className="text-[10px] font-semibold text-blue-600 px-1.5 py-0.5 bg-blue-50 rounded-md w-fit flex items-center gap-1">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/></svg>
                                      +{Math.floor(record.overtimeMinutes / 60)}h OT
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Regular Out</span>
                                  )}
                                </div>
                              </>
                            ) : (
                              /* Currently Working Status */
                              <div className="flex items-center gap-2 text-slate-400 italic text-sm ml-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                On Duty
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'ON_TIME' ? 'bg-green-100 text-green-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center relative">
                          <button 
                            className="p-2 rounded-lg transition-all 'text-slate-400 hover:bg-slate-100"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No attendance records found.</td>
                    </tr>
                  )
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

export default Attendance;