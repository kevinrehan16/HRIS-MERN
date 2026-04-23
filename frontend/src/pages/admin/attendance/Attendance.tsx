import { useMemo, useState } from 'react';
import { ClipboardClock, SearchIcon, Plus, MoreVertical, UserCheck, ClockAlert, Clock, ClockArrowUp, UserX, Timer, ClockArrowDown } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';

import { useAttendance } from '../../../hooks/useAttendance';
import TableSkeleton from '../../../components/common/TableSkeleton';
import StatCard from '../../../components/common/StatCard';
import { formatDisplayTime, getInitials, formatShiftSchedule, formatDate } from '../../../utils/formatters';

const Attendance = () => {

  const { attendanceQuery } = useAttendance();
  const { data: attendance, isLoading, error } = attendanceQuery;

  const [searchTerm, setSearchTerm] = useState(''); // Para sa search bar
  const [filterStatus, setFilterStatus] = useState('ALL'); // Para sa filter buttons

  // 1. Dito natin kukunin ang bilang para sa mga cards
  const stats = useMemo(() => {
    const logs = attendance?.logs || [];

    return {
      // Bilang ng lahat ng pumasok (Late o On Time)
      present: logs.filter(l => l.status === 'PRESENT' || l.status === 'LATE').length,
      late: logs.filter(l => l.status === 'LATE').length,
      absent: logs.filter(l => l.status === 'ABSENT').length,
      // Base sa bagong cards mo:
      undertime: logs.filter(l => l.isUndertime === true).length,
      overtime: logs.filter(l => l.otStatus === 'PENDING' || l.otStatus === 'APPROVED').length,
      // Base sa computed status (Nasa office pa/Hindi pa nag-out)
      active: logs.filter(l => l.computedStatus === 'ACTIVE').length,
    };
  }, [attendance]);

  // 2. Dito natin gagawin ang "Smart Filter" para sa table
  const filteredLogs = useMemo(() => {
    const logs = attendance?.logs || [];
    
    return logs.filter(log => {
      // 1. Search Logic
      const fullName = `${log.employee.firstName} ${log.employee.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) || 
        log.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status Card Filter Logic
      let matchesStatus = true;

      switch (filterStatus) {
        case 'LATE':
          matchesStatus = log.status === 'LATE';
          break;
        case 'ABSENT':
          matchesStatus = log.status === 'ABSENT';
          break;
        case 'ACTIVE':
          matchesStatus = log.computedStatus === 'ACTIVE';
          break;
        case 'UNDERTIME':
          matchesStatus = log.isUndertime === true;
          break;
        case 'OVERTIME':
          matchesStatus = log.otStatus === 'PENDING' || log.otStatus === 'APPROVED';
          break;
        case 'ALL':
        default:
          // Sa 'ALL', gusto nating makita lahat maliban sa Absent (optional, depende sa trip mo)
          // Kung gusto mong pati Absent lilitaw sa 'ALL', gawin mo lang `matchesStatus = true`
          matchesStatus = log.status !== 'ABSENT'; 
          break;
      }

      return matchesSearch && matchesStatus;
    });
  }, [attendance, searchTerm, filterStatus]);


  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Attendance" 
        subtitle="Daily monitoring and logs"
        titleIcon={<ClipboardClock size={25} className="text-white" />}
      >
        {/* Compact Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. PRESENT */}
          <StatCard 
            title="Present" 
            value={stats.present} 
            icon={<UserCheck className="text-blue-600" />} 
            color="bg-blue-50"
            isActive={filterStatus === 'ALL'}
            onClick={() => setFilterStatus('ALL')}
          />

          {/* 2. ABSENT */}
          <StatCard 
            title="Absent" 
            value={stats.absent} 
            icon={<UserX className="text-slate-500" />} 
            color="bg-slate-100"
            isActive={filterStatus === 'ABSENT'}
            onClick={() => setFilterStatus('ABSENT')}
          />

          {/* 3. LATE */}
          <StatCard 
            title="Late" 
            value={stats.late} 
            icon={<ClockAlert className="text-amber-500" />} 
            color="bg-amber-50"
            isActive={filterStatus === 'LATE'}
            onClick={() => setFilterStatus('LATE')}
          />

          {/* 4. UNDERTIME - NEW */}
          <StatCard 
            title="Undertime" 
            value={stats.undertime} 
            icon={<ClockArrowDown className="text-orange-500" />} 
            color="bg-orange-50"
            isActive={filterStatus === 'UNDERTIME'}
            onClick={() => setFilterStatus('UNDERTIME')}
          />

          {/* 5. OVERTIME - REPLACED MISSING */}
          <StatCard 
            title="Overtime" 
            value={stats.overtime} 
            icon={<ClockArrowUp className="text-indigo-500" />} 
            color="bg-indigo-50"
            isActive={filterStatus === 'OVERTIME'}
            onClick={() => setFilterStatus('OVERTIME')}
          />

          {/* 6. ON DUTY - NANDITO PA RIN! */}
          <StatCard 
            title="On Duty" 
            value={stats.active} 
            icon={<Timer className="text-emerald-500" />} 
            color="bg-emerald-50"
            isActive={filterStatus === 'ACTIVE'}
            onClick={() => setFilterStatus('ACTIVE')}
          />
        </div>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
              />
            </div>
            <div className="flex items-center gap-3">
              
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 !rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 shrink-0 text-xs"
              >
                <Plus size={20} /> Add Attendace
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-300 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Schedule</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Clock In</th>
                  <th style={{ width: '20%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Clock Out</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Status</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} columns={6} />
                ) : (
                  filteredLogs && filteredLogs.length > 0 ? (
                    filteredLogs.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-100 group">
                        
                        {/* 1. EMPLOYEE SECTION */}
                        <td className="px-4 py-1.5">
                          <div className="flex items-center gap-2.5">
                            {/* Compact Avatar (h-8 w-8) */}
                            <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-[10px]">
                              {getInitials(record.employee.firstName, record.employee.lastName)}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-800 text-[11px] group-hover:text-blue-600 transition-colors truncate">
                                {record.employee.firstName} {record.employee.lastName}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                {record.employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. SCHEDULE SECTION */}
                        <td className="px-4 py-1.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-tighter w-fit border border-indigo-100">
                              {record.employee.schedule?.name || 'Standard Shift'}
                            </span>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock size={10} className="text-slate-400" />
                              <span className="text-[10px] font-bold tracking-tight uppercase">
                                {formatShiftSchedule(record.employee.schedule?.shiftStart)} - {formatShiftSchedule(record.employee.schedule?.shiftEnd)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. CLOCK IN COLUMN */}
                        <td className="px-4 py-1.5 text-center border-r border-slate-50">
                          <div className="flex items-center justify-center gap-2">
                            {record.status !== "ABSENT" ? (
                              <>
                                <div className="flex flex-col items-center justify-center w-7 h-7 rounded bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
                                  <span className="text-[7px] font-bold uppercase leading-none">
                                    {record.timeIn ? new Date(record.timeIn).toLocaleString('en-US', { month: 'short' }) : '--'}
                                  </span>
                                  <span className="text-[10px] font-black leading-none mt-0.5">
                                    {record.timeIn ? new Date(record.timeIn).getDate() : '--'}
                                  </span>
                                </div>
                                <div className="flex flex-col items-start min-w-[55px]">
                                  <div className="text-[11px] font-bold text-slate-700">
                                    {record.timeIn ? formatDisplayTime(record.timeIn) : "---"}
                                  </div>
                                  <span className={`text-[9px] font-bold px-1 rounded ${record.lateMinutes > 0 ? 'bg-amber-50 text-amber-600' : 'text-slate-400'}`}>
                                    {record.lateMinutes > 0 ? `${record.lateMinutes}m Late` : 'Regular'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              /* Ibinabalik ang "No Record" design na compact */
                              <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100/50 rounded-full border border-slate-200/60 w-fit mx-auto">
                                <div className="p-0.5 bg-white rounded-full shadow-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                  {formatDate(new Date(record.date), 'MMM dd')} • <span className="font-normal italic">No Record</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 4. CLOCK OUT COLUMN */}
                        <td className="px-4 py-1.5 text-center border-l border-slate-50">
                          <div className="flex items-center justify-center gap-2">
                            {record.status === "ABSENT" ? (
                              <div className="flex items-center gap-2 px-2 py-0.5 bg-slate-100/50 rounded-full border border-slate-200/60 w-fit mx-auto">
                                <div className="p-0.5 bg-white rounded-full shadow-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                  {formatDate(new Date(record.date), 'MMM dd')} • <span className="font-normal italic">No Record</span>
                                </span>
                              </div>
                            ) : record.timeOut ? (
                              <>
                                <div className={`flex flex-col items-center justify-center w-7 h-7 rounded shrink-0 border ${
                                  record.undertimeMinutes > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  <span className="text-[7px] font-bold uppercase leading-none">{new Date(record.timeOut).toLocaleString('en-US', { month: 'short' })}</span>
                                  <span className="text-[10px] font-black leading-none mt-0.5">{new Date(record.timeOut).getDate()}</span>
                                </div>
                                <div className="flex flex-col items-start min-w-[55px]">
                                  <div className={`text-[11px] font-bold ${record.undertimeMinutes > 0 ? 'text-red-700' : 'text-slate-700'}`}>{formatDisplayTime(record.timeOut)}</div>
                                  <span className={`text-[9px] font-bold px-1 rounded ${
                                    record.undertimeMinutes > 0 ? 'bg-red-50 text-red-600' : record.overtimeMinutes > 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
                                  }`}>
                                    {record.undertimeMinutes > 0 ? `${record.undertimeMinutes}m Under` : record.overtimeMinutes > 0 ? `+${Math.floor(record.overtimeMinutes / 60)}h OT` : 'Regular'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5 text-slate-400 italic text-[11px] w-full">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                                </span>
                                On Duty
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. STATUS SECTION */}
                        <td className="px-4 py-1.5 text-center">
                          <div className={`text-[10px] font-black uppercase tracking-widest text-center py-1 rounded-md border-b-2 ${
                            record.status === 'PRESENT' ? 'text-emerald-600 border-emerald-200 bg-emerald-50/30' :
                            record.status === 'LATE' ? 'text-amber-600 border-amber-200 bg-amber-50/30' :
                            record.status === 'ABSENT' ? 'text-rose-600 border-rose-200 bg-rose-50/30' : 
                            'text-slate-400 border-slate-200 bg-slate-50/30'
                          }`}>
                            {record.status}
                          </div>
                        </td>

                        {/* 6. ACTIONS SECTION */}
                        <td className="px-4 py-1.5 text-center">
                          <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                            <MoreVertical size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[11px] text-slate-500 font-medium italic">No attendance records found.</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>
              Showing {filteredLogs.length} records 
              {searchTerm && ` for "${searchTerm}"`}
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