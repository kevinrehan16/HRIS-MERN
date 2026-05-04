import { useMemo, useState } from 'react';
import { ClipboardClock, SearchIcon, Plus, MoreVertical, UserCheck, ClockAlert, Clock, ClockArrowUp, UserX, CheckCircle, ClockArrowDown, TrendingDown, TrendingUp, FilePenLine, Search, Calendar, ChevronDown, FileText } from 'lucide-react';

import { formatDate, formatShiftSchedule, getFullDayName, formatDisplayTime } from '../../../utils/formatters';
import { notificationService } from '../../../utils/notifications';
import EmpPageHeader from '../../../components/common/EmpPageHeader';
import StatCard from '../../../components/common/StatCard';
import TableSkeleton from '../../../components/common/TableSkeleton';
import NoDataFound from '../../../components/common/NoDataFound';

import AttendanceCorrectionModal from '../../../components/modals/AttendanceCorrectionModal';

import { useEmpAttendance } from '../../../hooks/employee/useEmpAttendance';

// Nilipat natin dito ang formatters para hindi na mag-import sa labas kung hardcoded lang
// const formatDisplayTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Attendance = () => {
  const { myAttendanceQuery, requestOverTimeMutation } = useEmpAttendance();
  const { data: myAttendance = [], isLoading, isFetching } = myAttendanceQuery;
  const [openActionsId, setOpenActionsId] = useState<string | null>(null);

  const [record, setRecord] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('REGULAR');
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);

  const handleEditClick = (attendance: any) => {
    setRecord(attendance);
    setIsCorrectionModalOpen(true);
  };

  // Ito ang gagamitin mong array sa iyong Table Body mapping
  const filteredAttendance = useMemo(() => {
    if (filterStatus === 'ALL') return myAttendance;

    return myAttendance.filter((record: any) => {
      switch (filterStatus) {
        case 'PRESENT':
          return record.timeIn && !record.timeOut;
        case 'ABSENT':
          return record.status === 'ABSENT';
        case 'LATE':
          return record.status === 'LATE';
        case 'UNDERTIME':
          return record.isUndertime;
        case 'OVERTIME':
          return record.overtimeMinutes > 60;
        case 'REGULAR':
          return (
            record.timeIn && 
            record.timeOut && 
            record.status !== 'ABSENT' && 
            record.status !== 'LATE' && 
            !record.isUndertime && 
            record.overtimeMinutes === 0
          );
        default:
          return true;
      }
    });
  }, [myAttendance, filterStatus]);
  
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let undertime = 0;
    let overtime = 0;
    let regular = 0; // 1. Dito natin dinagdag ang counter

    myAttendance.forEach((a: any) => {
      if (a.overtimeMinutes > 60) overtime++;
      if (a.status == "LATE") late++;
      if (a.isUndertime) undertime++;
      if (a.timeIn && !a.timeOut) present++;
      if (a.status === 'ABSENT') absent++;

      // 2. REGULAR LOGIC: May timeIn, hindi absent, hindi late, at hindi undertime.
      if ((a.timeIn && a.timeOut) && a.status !== 'ABSENT' && a.status !== "LATE" && !a.isUndertime && a.overtimeMinutes == 0) {
        regular++;
      }
    });

    return { present, absent, late, undertime, overtime, regular }; // 3. Sinama sa return
  }, [myAttendance]);

  const handleRequestOTModal = async (attendance: any) => {
    setOpenActionsId(null);

    const result = await notificationService.prompt(
      'Submit OverTime Request',
      `Please provide a justification for your +${attendance.overtimeMinutes}m overtime request on ${formatDate(attendance.date)}.`,
      'Enter rejection reason...',
      'submit'
    );

    if (result.isConfirmed && result.value) {
      executeReqOTUpdate(attendance.id, 'PENDING', result.value);
    }
  }

  const executeReqOTUpdate = async (id, otStatus, otRemarks = "") => {
    try {
      await requestOverTimeMutation.mutateAsync({ id, otStatus, otRemarks });
      notificationService.toast('Your overtime request has been submitted successfully and is now pending for approval.');
    } catch (error) {
      notificationService.toast('An error occurred while processing the request. Please try again.');
    }
  };


  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <EmpPageHeader 
        title="Attendance" 
        subtitle="Daily monitoring and logs"
        titleIcon={<ClipboardClock size={25} className="text-white" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <StatCard 
            title="On Duty" 
            value={stats.present} 
            isActive={filterStatus === 'PRESENT'}
            // Kapag kiniclick at 'PRESENT' na siya, gagawing 'ALL'. Kung hindi, gagawing 'PRESENT'.
            onClick={() => setFilterStatus(prev => prev === 'PRESENT' ? 'ALL' : 'PRESENT')}
            icon={<UserCheck className="text-blue-600" />}
            color="bg-blue-50"
          />
          
          <StatCard 
            title="Absent" 
            value={stats.absent} 
            isActive={filterStatus === 'ABSENT'}
            onClick={() => setFilterStatus(prev => prev === 'ABSENT' ? 'ALL' : 'ABSENT')}
            icon={<UserX className="text-slate-500" />}
            color="bg-slate-100"
          />
          
          <StatCard 
            title="Late" 
            value={stats.late} 
            isActive={filterStatus === 'LATE'}
            onClick={() => setFilterStatus(prev => prev === 'LATE' ? 'ALL' : 'LATE')}
            icon={<ClockAlert className="text-amber-500" />}
            color="bg-amber-50"
          />
          
          <StatCard 
            title="Undertime" 
            value={stats.undertime} 
            isActive={filterStatus === 'UNDERTIME'}
            onClick={() => setFilterStatus(prev => prev === 'UNDERTIME' ? 'ALL' : 'UNDERTIME')}
            icon={<ClockArrowDown className="text-orange-500" />}
            color="bg-orange-50"
          />
          
          <StatCard 
            title="Overtime" 
            value={stats.overtime} 
            isActive={filterStatus === 'OVERTIME'}
            onClick={() => setFilterStatus(prev => prev === 'OVERTIME' ? 'ALL' : 'OVERTIME')}
            icon={<ClockArrowUp className="text-indigo-500" />}
            color="bg-indigo-50"
          />
          
          <StatCard 
            title="Regular" 
            value={stats.regular} 
            isActive={filterStatus === 'REGULAR'}
            onClick={() => setFilterStatus(prev => prev === 'REGULAR' ? 'ALL' : 'REGULAR')}
            icon={<CheckCircle className="text-green-600" />}
            color="bg-green-50"
          />
        </div>
      </EmpPageHeader>

      <div className="px-6 pb-4 flex-1 flex flex-col min-h-0 relative">
        <div className="bg-white rounded-md shadow-xl border border-slate-200 -mt-28 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="p-2 border-b border-slate-100 flex bg-slate-50/30 shrink-0">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search employee or ID..." 
                  className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 !rounded-md !text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Calendar size={16} />
                <span>April 01 - April 30, 2026</span>
                <ChevronDown size={14} />
              </button>
            </div>

            {/* RIGHT: Status Filters & Export */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select className="px-4 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20">
                <option>--All Status--</option>
                <option value="Regular">Regular</option>
                <option value="On Duty">On Duty</option>
                <option value="Late">Late</option>
                <option value="Undertime">Undertime</option>
                <option value="Overtime">Overtime</option>
                <option value="Absent">Absent</option>
              </select>

              <div className="h-8 w-[1px] bg-slate-300 mx-2 hidden md:block" />

              <button className="p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 !rounded-md transition-colors border border-transparent hover:border-blue-100" title="Export PDF">
                <FileText size={20} />
              </button>
              
              <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white !rounded-md text-sm font-bold shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-all active:scale-95">
                <Plus size={18} />
                <span className="hidden sm:inline">Add Record</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar bg-white min-h-0 border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-50 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '12' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Schedule</th>
                  <th style={{ width: '15' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Clock In</th>
                  <th style={{ width: '15' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold">Clock Out</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Late</th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">
                    <div className='flex items-center gap-2 justify-center'>
                      U.T <div className="w-[1px] h-3 bg-slate-100" /> O.T
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Total Hours</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Status</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-purple-400 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading || isFetching ? (
                  <TableSkeleton rows={4} columns={8} />
                ) : filteredAttendance && filteredAttendance.length > 0 ? (
                  filteredAttendance?.map((record: any, index: number) => {
                    // DITO NATIN NILAGAY ANG LOGIC (Bago ang return para hindi masira ang design)
                    const latestCorrection = record.corrections && record.corrections.length > 0 
                      ? record.corrections[record.corrections.length - 1] 
                      : null;

                    const correctionStatus = latestCorrection?.status;

                    return (
                      <tr key={record?.id} className="hover:bg-slate-50/80 transition-all border-b border-slate-100 group">
                        <td className="px-4 py-2">
                          <div className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 text-[8px] font-black uppercase w-fit">
                            {record?.employee?.schedule?.name}
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 mt-0.5 tracking-tighter">
                            <Clock size={10}/>
                            {formatShiftSchedule(record?.employee?.schedule?.shiftStart)} - {formatShiftSchedule(record?.employee?.schedule?.shiftEnd)}
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center w-8 h-8 rounded bg-emerald-50 border border-emerald-100 shadow-sm">
                              <span className="text-[8px] font-bold uppercase text-emerald-600 leading-none mt-1">
                                {record?.timeIn ? new Date(record.timeIn).toLocaleString('en-US', { month: 'short' }) : '---'}
                              </span>
                              <span className="text-[12px] font-bold text-emerald-700 leading-none mt-0.5">
                                {record?.timeIn ? new Date(record.date).getUTCDate() : '--'}
                              </span>
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                              <span className={`text-[14px] font-mono font-black tracking-tight ${record?.lateMinutes > 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                                {record?.timeIn ? formatDisplayTime(record?.timeIn) : '--:-- --'}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 capitalize mr-auto">
                                {record?.timeIn ? getFullDayName(record.timeIn) : '---'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center w-8 h-8 rounded bg-emerald-50 border border-emerald-100 shadow-sm">
                              <span className="text-[8px] font-bold uppercase text-emerald-600 leading-none mt-1">
                                {record?.timeOut ? new Date(record.timeOut).toLocaleString('en-US', { month: 'short' }) : '---'}
                              </span>
                              <span className="text-[12px] font-bold text-emerald-700 leading-none mt-0.5">
                                {record?.timeOut ? new Date(record.timeOut).getDate() : '--'}
                              </span>
                            </div>
                            <div className="flex flex-col items-start leading-tight">
                              <span className={`text-[14px] font-mono font-black tracking-tight ${record?.lateMinutes > 0 ? 'text-rose-500' : 'text-slate-700'}`}>
                                {record?.timeOut ? formatDisplayTime(record?.timeOut) : '--:-- --'}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 capitalize mr-auto">
                                {record?.timeOut ? getFullDayName(record.timeOut) : '---'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`text-[12px] font-mono font-black ${record?.lateMinutes > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                              {record?.lateMinutes > 0 ? `-${record?.lateMinutes}m` : '00m'}
                            </span>
                            {record?.lateMinutes > 0 && <div className="w-8 h-[2px] bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />}
                          </div>
                        </td>
                        
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`flex flex-col ${record?.undertimeMinutes > 0 ? 'opacity-100' : 'opacity-30'}`}>
                              <span className="flex items-center gap-1 text-[7px] font-black text-orange-400 uppercase">
                                <TrendingDown size={10} />UT
                              </span>
                              <span className="text-[12px] font-mono font-black text-orange-500 tracking-tighter">-{record?.undertimeMinutes}m</span>
                            </div>
                            <div className="w-[1px] h-6 bg-slate-200" />
                            <div className={`flex flex-col ${record?.overtimeMinutes > 60 ? 'opacity-100' : 'opacity-30'}`}>
                              <span className="flex items-center gap-1 text-[7px] font-black text-indigo-400 uppercase">
                                <TrendingUp size={10} />OT
                              </span>
                              <span className="text-[12px] font-mono font-black text-indigo-600 tracking-tighter">+{record?.overtimeMinutes}m</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <div className="inline-flex flex-col items-center group">
                            <div className="relative">
                              <div className="absolute -inset-1 bg-blue-500/10 blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative text-[15px] font-mono font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-800 to-slate-500 tracking-tighter px-3 py-1 bg-slate-50 border border-slate-200 rounded shadow-sm">
                                {record?.totalHours}
                              </span>
                            </div>
                            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Net Duration</span>
                          </div>
                        </td>

                        <td className="px-4 py-2 text-center">
                          <div className="flex justify-center">
                            {(() => {
                              const badgeClass = "w-[105px] flex items-center justify-center gap-1.5 py-1 px-2.5 rounded border shadow-sm transition-all duration-200";
                              const textClass = "text-[9px] font-black uppercase tracking-wider";

                              if (record?.status === 'ABSENT') {
                                return (
                                  <div className={`${badgeClass} bg-slate-500/10 border-slate-500/40`}>
                                    <UserX size={10} className="text-slate-600" />
                                    <span className={`${textClass} text-slate-600`}>Absent</span>
                                  </div>
                                );
                              }

                              if (record?.timeIn && !record?.timeOut) {
                                return (
                                  <div className={`${badgeClass} bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]`}>
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" />
                                    <span className={`${textClass} text-emerald-600`}>On Duty</span>
                                  </div>
                                );
                              }

                              if (record?.overtimeMinutes > 60) {
                                return (
                                  <div className={`${badgeClass} bg-indigo-500/10 border-indigo-500/40`}>
                                    <ClockArrowUp size={10} className="text-indigo-600" />
                                    <span className={`${textClass} text-indigo-600`}>Overtime</span>
                                  </div>
                                );
                              }

                              if (record?.isUndertime) {
                                return (
                                  <div className={`${badgeClass} bg-orange-500/10 border-orange-500/40`}>
                                    <ClockArrowDown size={10} className="text-orange-600" />
                                    <span className={`${textClass} text-orange-600`}>Undertime</span>
                                  </div>
                                );
                              }

                              if (record?.status === "LATE") {
                                return (
                                  <div className={`${badgeClass} bg-amber-500/10 border-amber-500/40`}>
                                    <ClockAlert size={10} className="text-amber-500" />
                                    <span className={`${textClass} text-amber-600`}>Late</span>
                                  </div>
                                );
                              }

                              if (record?.timeIn && record?.timeOut && record?.status !== 'ABSENT' && record?.status !== "LATE" && !record?.isUndertime && record?.overtimeMinutes === 0) {
                                return (
                                  <div className={`${badgeClass} bg-green-500/10 border-green-500/40`}>
                                    <CheckCircle size={10} className="text-green-600" />
                                    <span className={`${textClass} text-green-600`}>Regular</span>
                                  </div>
                                );
                              }

                              return (
                                <div className={`${badgeClass} bg-blue-500/10 border-blue-500/40`}>
                                  <UserCheck size={10} className="text-blue-600" />
                                  <span className={`${textClass} text-blue-600`}>Present</span>
                                </div>
                              );
                            })()}
                          </div>
                        </td>

                        <td className="px-4 py-1.5 text-center">
                          <div className="relative inline-block">
                            <button 
                              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionsId(openActionsId === record?.id ? null : record?.id);
                              }}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {openActionsId === record?.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenActionsId(null)} />
                                
                                <div className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 w-max min-w-28 bg-white rounded-lg shadow-2xl border border-slate-200 py-1 animate-in fade-in slide-in-from-right-1 duration-100 z-[100]`}>
                                  
                                  <div className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-white" />

                                  <button 
                                    onClick={() => { handleEditClick(record); setOpenActionsId(null); }}
                                    // UPDATED DISABLED LOGIC
                                    disabled={['PENDING', 'APPROVED', 'REJECTED'].includes(correctionStatus)}
                                    className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium transition-colors whitespace-nowrap
                                      ${['PENDING', 'APPROVED', 'REJECTED'].includes(correctionStatus) ? 'opacity-50  text-slate-400 cursor-not-allowed bg-gray-50' : 'text-slate-600 hover:bg-emerald-50'}`}
                                  >
                                    <FilePenLine size={14} className={['PENDING', 'APPROVED', 'REJECTED'].includes(correctionStatus) ? 'text-slate-400' : 'text-emerald-500'} />
                                    
                                    {/* UPDATED LABEL LOGIC */}
                                    {correctionStatus === 'PENDING' && 'For Approval'}
                                    {correctionStatus === 'APPROVED' && 'Approved (Correction)'}
                                    {correctionStatus === 'REJECTED' && 'Rejected (Try Again)'}
                                    {!correctionStatus && 'Attendance Correction'}
                                  </button>
                                  
                                  <button 
                                    disabled={record.overtimeMinutes <= 60 || ['PENDING', 'APPROVED', 'REJECTED'].includes(record.otStatus)}
                                    onClick={() => handleRequestOTModal(record)}
                                    className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium transition-colors whitespace-nowrap 
                                      ${(record.overtimeMinutes <= 60 || ['PENDING', 'APPROVED', 'REJECTED'].includes(record.otStatus))
                                        ? 'opacity-50 cursor-not-allowed bg-gray-50 text-slate-400' 
                                        : 'hover:bg-red-50 text-slate-700'
                                      }`}
                                  >
                                    <ClockArrowUp size={14} className={(record.overtimeMinutes <= 60 || ['PENDING', 'APPROVED', 'REJECTED'].includes(record.otStatus)) ? 'text-slate-400' : 'text-blue-500'} />
                                    
                                    <span>
                                      {(() => {
                                        if (record.otStatus === 'PENDING') return "For Approval";
                                        if (record.otStatus === 'APPROVED' || record.otStatus === 'REJECTED') {
                                          return `${record.otStatus === 'APPROVED' ? 'Approved' : 'Rejected'} (Overtime)`;
                                        }
                                        return "Request Overtime";
                                      })()}
                                    </span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <NoDataFound 
                        messageIcon={<ClipboardClock size={48} className="opacity-20" />} 
                        message='No record found'
                        subMessage='Change your filter!'
                      >
                      </NoDataFound>
                    </td>
                  </tr>
                )}
                
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>Showing {myAttendance?.length} records</span>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100">Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100">Next</button>
            </div>
          </div>
        </div>
      </div>
      <AttendanceCorrectionModal
        record={record}
        isOpen={isCorrectionModalOpen}
        onClose={()=>setIsCorrectionModalOpen(false)}
      />
    
    </div>



  );
};

export default Attendance;