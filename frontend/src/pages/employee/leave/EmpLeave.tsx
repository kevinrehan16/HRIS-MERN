import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, CalendarPlus, Download, Info } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { formatDate } from '../../../utils/formatters'

import { useEmpLeavesQuery } from '../../../hooks/employee/useEmpLeave';

import EmpPageHeader from '../../../components/common/EmpPageHeader';
import ApplyLeaveModal from '../../../components/modals/ApplyLeaveModal';

const EmpLeave = () => {
  const { data: { leaves: empLeaves = [], leaveCredits: empLeaveCredits = 0 } = {} } = useEmpLeavesQuery();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  const events = useMemo(() => {
    return empLeaves.map((leave: any) => {
      // 1. Check kung half day base sa totalDays
      const isHalfDay = Number(leave.totalDays) === 0.5;

      return {
        id: leave.id.toString(),
        // 2. Lagyan ng indicator sa title kung half day
        title: `${isHalfDay ? '½ ' : ''}${leave.type} - (${formatDate(leave.createdAt)})`,
        
        start: leave.startDate,
        
        // 3. Importante: Kung half day, HUWAG mag-add ng +1 day. 
        // Dahil ang start at end ay parehong "May 18", sapat na yun para sa single day box.
        end: isHalfDay 
          ? leave.endDate 
          : dayjs(leave.endDate).add(1, 'day').format('YYYY-MM-DD'),

        backgroundColor: 
          leave.status === 'APPROVED' ? '#22c55e' : 
          leave.status === 'REJECTED' ? '#ef4444' : '#f59e0b',
        
        borderColor: 'transparent',
        allDay: true,
        
        extendedProps: {
          status: leave.status,
          reason: leave.reason,
          adminRemarks: leave.adminRemarks,
          totalDays: leave.totalDays
        }
      };
    });
  }, [empLeaves]);

  const initialCalendarDate = useMemo(() => {
    if (!empLeaves || empLeaves.length === 0) return new Date(); // Default sa current date kung walang leave

    // I-sort ang leaves para mahanap ang pinaka-maaga
    const sortedLeaves = [...empLeaves].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return sortedLeaves[0].startDate; // Ito ang magiging focus ng calendar
  }, [empLeaves]);

  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden text-slate-700">
      {/* HEADER - Pinaliit ang height sa pamamagitan ng EmpPageHeader customization kung pwede */}
      <div className="shrink-0">
        <EmpPageHeader 
          title="Leaves" 
          subtitle="Time-off tracking"
          titleIcon={<CalendarIcon size={20} className="text-white" />}
        >
          <button className="flex items-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1.5 rounded text-white hover:bg-white/20 transition-all text-xs">
            <Download size={14} /> <span>Export</span>
          </button>
        </EmpPageHeader>
      </div>

      <div className="px-4 pb-3 flex-1 flex flex-col min-h-0 relative">
        {/* MAIN CONTAINER - Binawasan ang negative margin para hindi masyadong mataas */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 -mt-28 flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          
          {/* SIDEBAR - Compressed version */}
          <div className="w-full lg:w-56 border-r border-slate-100 bg-slate-50/50 p-3 flex flex-col gap-4 shrink-0">
            
            {/* MINI LEAVE CREDITS */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3 text-white shadow-md relative overflow-hidden">
              <p className="text-[10px] opacity-80 uppercase tracking-tighter">Credits Left</p>
              <div className="flex items-baseline gap-1">
                <h2 className="text-3xl font-black">{empLeaveCredits}</h2>
                <span className="text-[10px] font-bold">DAYS</span>
              </div>
              <CalendarIcon className="absolute -bottom-1 -right-1 text-white/10" size={50} />
            </div>

            <button 
              onClick={() => setIsApplyModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white py-2 rounded font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <CalendarPlus size={14} /> New Request
            </button>

            {/* COMPACT LEGEND */}
            <div className="space-y-2 py-2 border-t border-slate-200/60">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Legends</h5>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> Approved
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div> Pending
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Rejected
                </div>
                <div className="flex items-center gap-2 text-[14px] font-semibold">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div> Holiday
                </div>
              </div>
            </div>

            {/* TINY INFO */}
            <div className="mt-auto p-2 bg-amber-50 border border-amber-100 rounded">
              <p className="flex items-center gap-1 text-[11px] text-amber-700 leading-tight m-0">
                <Info size={16} className="text-amber-500 shrink-0" /> Submit 3 days before the date.
              </p>
            </div>
          </div>

          {/* CALENDAR AREA - High density */}
          <div className="flex-1 p-2 bg-white flex flex-col min-h-0">
            <div className="h-full text-xs">
              <FullCalendar
                key={initialCalendarDate} // Force re-render kapag nakuha na ang unang leave date
                initialDate={initialCalendarDate} // Force re-render kapag nakuha na ang unang leave date
                plugins={[daygridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events} // <--- Heto na yung transformed data
                height="100%"
                fixedWeekCount={false}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                // Tooltip o Alert kapag clinick ang leave
                eventClick={(info) => {
                  alert(`Status: ${info.event.extendedProps.status}\nReason: ${info.event.extendedProps.reason}\nAdmin Remarks: ${info.event.extendedProps.adminRemarks}\nHalf-Day: ${Number(info.event.extendedProps.totalDays) === 0.5 ? 'Yes' : 'No'}`);
                }}
                eventContent={(info) => (
                  <div className="px-1 py-0.5 text-[9px] truncate font-bold text-white leading-tight cursor-pointer">
                    {info.event.title}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .fc { font-size: 11px !important; }
        .fc .fc-toolbar { margin-bottom: 0.5rem !important; padding: 0 4px; }
        .fc .fc-toolbar-title { font-size: 0.9rem !important; font-weight: 700 !important; }
        .fc .fc-button { padding: 2px 6px !important; font-size: 10px !important; height: auto !important; }
        .fc .fc-col-header-cell-cushion { padding: 4px 0 !important; color: #64748b !important; }
        .fc .fc-daygrid-day-number { padding: 2px 4px !important; }
        .fc .fc-daygrid-day-top { flex-direction: row !important; }
        .fc .fc-event { margin-top: 1px !important; margin-bottom: 0 !important; border-radius: 2px !important; }
        .fc-theme-standard .fc-scrollgrid { border: 1px solid #f1f5f9 !important; }
        .fc .fc-day-today { background: #eff6ff !important; }
        .fc .fc-scroller-harness { overflow: hidden !important; }
      `}} />


      <ApplyLeaveModal 
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default EmpLeave;