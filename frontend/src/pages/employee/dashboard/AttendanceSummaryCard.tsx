import React from 'react';
import { Clock, CalendarDays, ClipboardList, CheckCircle } from 'lucide-react';

const AttendanceSummaryCard = () => {
  const cards = [
    {
      title: "Today's Attendance",
      icon: <Clock size={20} className="text-purple-500" />,
      data: [
        { label: 'Time In', value: '8:12 AM' },
        { label: 'Time Out', value: '--' },
        { label: 'Status', value: 'Present', color: 'text-green-600' },
      ],
      gradient: 'from-purple-500/10 to-purple-500/5',
    },
    {
      title: 'Leave Balance',
      icon: <CalendarDays size={20} className="text-blue-500" />,
      data: [
        { label: 'Vacation', value: '8 Days' },
        { label: 'Sick Leave', value: '4 Days' },
        { label: 'Next Leave', value: 'May 5, 2026' },
      ],
      gradient: 'from-blue-500/10 to-blue-500/5',
    },
    {
      title: 'Pending Requests',
      icon: <ClipboardList size={20} className="text-yellow-500" />,
      data: [
        { label: 'Approvals', value: '3' },
        { label: 'Time Off', value: '2' },
        { label: 'Total Pending', value: '5' },
      ],
      gradient: 'from-yellow-500/10 to-yellow-500/5',
    },
    {
      title: 'Current Tasks',
      icon: <CheckCircle size={20} className="text-green-500" />,
      data: [
        { label: 'In Progress', value: '5' },
        { label: 'Completed', value: '8' },
        { label: 'Overdue', value: '2' },
      ],
      gradient: 'from-green-500/10 to-green-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`backdrop-blur-md bg-gradient-to-br ${card.gradient} dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200/40 dark:border-slate-700/40 rounded-xl shadow-lg p-5 transition-all hover:shadow-xl`}
        >
          <div className="flex items-center gap-2 mb-3">
            {card.icon}
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{card.title}</h3>
          </div>

          <div className="space-y-2 text-sm">
            {card.data.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                <span className={`font-semibold ${item.color || 'text-slate-900 dark:text-slate-100'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceSummaryCard;
