// EmployeeDashboardBodyGlass.tsx
import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * EmployeeDashboardBodyGlass.tsx
 * - Dashboard BODY only (no sidebar/topbar)
 * - React + TypeScript + Tailwind CSS + Recharts
 * - Glassmorphism style, compact, rounded-md only
 */

/* ===========================
   Mock Data (hardcoded)
   =========================== */
const topSummary = {
  attendance: { status: "Present", timeIn: "8:02 AM", hoursToday: 8.0, trend: [8, 8.5, 7.5, 8, 9] },
  leave: { vacation: 8, sick: 5, usedPct: 35 },
  payroll: { net: 50000, next: "2026-05-15", trend: [48000, 49000, 50000] },
  tasks: { active: 12, completed: 48, pending: 5 },
  overtime: { approved: 6, pending: 2 },
  performance: { kpi: 89, monthly: 92 },
};

const attendanceData = [
  { day: "Mon", hours: 8, late: 5, overtime: 1 },
  { day: "Tue", hours: 9, late: 0, overtime: 2 },
  { day: "Wed", hours: 7, late: 10, overtime: 0 },
  { day: "Thu", hours: 8, late: 0, overtime: 1 },
  { day: "Fri", hours: 9, late: 2, overtime: 3 },
  { day: "Sat", hours: 4, late: 0, overtime: 0 },
  { day: "Sun", hours: 0, late: 0, overtime: 0 },
];

const productivityData = [
  { week: "W1", completed: 18, planned: 22 },
  { week: "W2", completed: 25, planned: 26 },
  { week: "W3", completed: 20, planned: 24 },
  { week: "W4", completed: 30, planned: 28 },
];

const leavePie = [
  { name: "Vacation", value: 8 },
  { name: "Sick", value: 5 },
  { name: "Used", value: 7 },
];

const payrollPie = [
  { name: "Net", value: 50000 },
  { name: "Deductions", value: 8000 },
  { name: "Allowances", value: 3000 },
  { name: "OT", value: 2000 },
];

const COLORS = ["#9333EA", "#10B981", "#3B82F6", "#F97316"];

/* ===========================
   Reusable UI Components
   =========================== */

type StatCardProps = {
  title: string;
  primary: string | number;
  secondary?: string;
  accent?: "purple" | "emerald" | "blue" | "gray";
  mini?: React.ReactNode;
  glass?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({ title, primary, secondary, accent = "purple", mini, glass = true }) => {
  const accentBg =
    accent === "purple" ? "bg-purple-50 text-purple-600" : accent === "emerald" ? "bg-emerald-50 text-emerald-600" : accent === "blue" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600";

  return (
    <div
      className={`rounded-md p-3 flex items-center gap-3 ${glass ? "bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm" : "bg-white"} hover:shadow transition`}
      style={{ minHeight: 64 }}
    >
      <div className={`w-9 h-9 rounded-md flex items-center justify-center ${accentBg}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 8v12h12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-600">{title}</div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-semibold text-black truncate">{primary}</div>
          {mini && <div className="ml-auto">{mini}</div>}
        </div>
        {secondary && <div className="text-xs text-gray-400 truncate">{secondary}</div>}
      </div>
    </div>
  );
};

const MiniSpark = ({ values, color = "#9333EA" }: { values: number[]; color?: string }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = max === min ? 50 : 100 - ((v - min) / (max - min)) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="80" height="28" viewBox="0 0 100 28" className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ActionBtn = ({ label, color = "purple" }: { label: string; color?: string }) => {
  const base = "text-xs rounded-md p-2 flex items-center justify-center gap-2 transition";
  const style = color === "purple" ? "bg-purple-50 text-purple-600 hover:bg-purple-100" : color === "blue" ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-gray-50 text-gray-700 hover:bg-gray-100";
  return (
    <button className={`${base} ${style}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

const TaskRow = ({ title, due, status, progress, priority }: { title: string; due?: string; status?: string; progress?: number; priority?: "low" | "med" | "high" }) => {
  const statusCls = status === "done" ? "bg-emerald-100 text-emerald-700" : status === "in-progress" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600";
  const prioColor = priority === "high" ? "bg-orange-100 text-orange-600" : priority === "med" ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-600";
  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-white/30 border border-transparent hover:border-white/20">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`w-2.5 h-2.5 rounded-full ${prioColor} mt-1`} />
        <div className="min-w-0">
          <div className="text-sm text-black truncate">{title}</div>
          <div className="text-xs text-gray-400 truncate">{due}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-xs px-2 py-1 rounded-md ${statusCls}`}>{status}</div>
        <div className="w-20 h-2 bg-gray-100 rounded-md overflow-hidden">
          <div className="h-2 bg-purple-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

/* ===========================
   Main Component
   =========================== */

export default function EmployeeDashboardBodyGlass(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Top summary - compact glass cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
        <StatCard
          title="Attendance"
          primary={`${topSummary.attendance.status}`}
          secondary={`In: ${topSummary.attendance.timeIn} • ${topSummary.attendance.hoursToday} hrs`}
          accent="purple"
          mini={<MiniSpark values={topSummary.attendance.trend} color="#9333EA" />}
        />
        <StatCard
          title="Leave Credits"
          primary={`VL ${topSummary.leave.vacation} • SL ${topSummary.leave.sick}`}
          secondary={`Used ${topSummary.leave.usedPct}%`}
          accent="blue"
          mini={
            <div className="w-20 h-2 bg-gray-100 rounded-md overflow-hidden">
              <div className="h-2 bg-emerald-500" style={{ width: `${topSummary.leave.usedPct}%` }} />
            </div>
          }
        />
        <StatCard
          title="Payroll"
          primary={`₱${topSummary.payroll.net.toLocaleString()}`}
          secondary={`Next: ${topSummary.payroll.next}`}
          accent="purple"
          mini={<MiniSpark values={topSummary.payroll.trend} color="#10B981" />}
        />
        <StatCard title="Tasks" primary={`${topSummary.tasks.active} Active`} secondary={`${topSummary.tasks.completed} Done • ${topSummary.tasks.pending} Pending`} accent="gray" />
        <StatCard title="Overtime" primary={`${topSummary.overtime.approved} hrs`} secondary={`${topSummary.overtime.pending} Pending`} accent="emerald" />
        <StatCard title="Performance" primary={`${topSummary.performance.kpi}%`} secondary={`Monthly ${topSummary.performance.monthly}%`} accent="purple" mini={<MiniSpark values={[80,85,88,89,92]} color="#9333EA" />} />
      </section>

      {/* Main grid: left (2 cols) and right (1 col) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT (larger) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Attendance Analytics (glass) */}
          <div className="rounded-md p-4 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-black">Attendance Analytics</h3>
              <div className="text-xs text-gray-400">Weekly • Trends</div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 6, right: 8, left: -8, bottom: 6 }}>
                  <XAxis dataKey="day" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip wrapperStyle={{ borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }} />
                  <Line type="monotone" dataKey="hours" stroke="#9333EA" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="overtime" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="late" stroke="#F97316" fill="#FEEBC8" fillOpacity={0.18} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs text-gray-600 mt-3">
              <div>
                <div className="text-xs">Attendance Rate</div>
                <div className="text-sm font-semibold text-black">95%</div>
              </div>
              <div>
                <div className="text-xs">Total Hours</div>
                <div className="text-sm font-semibold text-black">41 hrs</div>
              </div>
              <div>
                <div className="text-xs">Late Minutes</div>
                <div className="text-sm font-semibold text-black">17 mins</div>
              </div>
              <div>
                <div className="text-xs">Overtime</div>
                <div className="text-sm font-semibold text-black">7 hrs</div>
              </div>
            </div>
          </div>

          {/* Tasks & Productivity (glass) */}
          <div className="rounded-md p-4 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-black">Tasks & Productivity</h3>
              <div className="text-xs text-gray-400">Daily • Weekly</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500 mb-2">Today's Tasks</div>
                <div className="space-y-1">
                  <TaskRow title="Finish Q2 report" due="Due Today" status="in-progress" progress={60} priority="high" />
                  <TaskRow title="Client follow-up" due="Tomorrow" status="pending" progress={10} priority="med" />
                  <TaskRow title="Timesheet" due="Today" status="done" progress={100} priority="low" />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2">Weekly Completion</div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productivityData} margin={{ top: 6, right: 6, left: -6, bottom: 6 }}>
                      <XAxis dataKey="week" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip wrapperStyle={{ borderRadius: 8 }} />
                      <Bar dataKey="completed" fill="#9333EA" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-gray-500">Completed this month: <span className="text-black font-semibold">89%</span></div>
              </div>
            </div>
          </div>

          {/* Futuristic mini-widgets row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Productivity Ring */}
            <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm flex flex-col items-center">
              <div className="text-xs text-gray-500 mb-2">Productivity</div>
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: "score", value: 89 }, { name: "rest", value: 11 }]} dataKey="value" startAngle={90} endAngle={-270} innerRadius={28} outerRadius={40}>
                      <Cell key="c1" fill="#9333EA" />
                      <Cell key="c2" fill="#EDE9FE" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-sm font-semibold text-black mt-2">89%</div>
              <div className="text-xs text-gray-400">Monthly</div>
            </div>

            {/* Attendance Heatmap (simple) */}
            <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-gray-500">Attendance Heatmap</div>
                <div className="text-xs text-gray-400">30 days</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  const intensity = [0.9,0.7,0.5,0.2][Math.floor(Math.random()*4)];
                  const bg = intensity > 0.8 ? "bg-purple-600" : intensity > 0.6 ? "bg-purple-400" : intensity > 0.3 ? "bg-purple-200" : "bg-gray-100";
                  return <div key={i} className={`w-full h-4 rounded-md ${bg}`} />;
                })}
              </div>
            </div>

            {/* Monthly Goal Tracker */}
            <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
              <div className="text-xs text-gray-500 mb-2">Monthly Goal</div>
              <div className="text-sm font-semibold text-black">Project milestones</div>
              <div className="mt-2 text-xs text-gray-400">Progress</div>
              <div className="w-full h-2 bg-gray-100 rounded-md mt-2 overflow-hidden">
                <div className="h-2 bg-emerald-500" style={{ width: "72%" }} />
              </div>
              <div className="mt-2 text-xs text-gray-600">72% complete • 3 left</div>
            </div>
          </div>
        </div>

        {/* RIGHT (smaller) */}
        <aside className="space-y-3">
          {/* Quick Actions (glass) */}
          <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-black">Quick Actions</h4>
              <div className="text-xs text-gray-400">Fast</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ActionBtn label="Time In" color="purple" />
              <ActionBtn label="Time Out" color="gray" />
              <ActionBtn label="Request Leave" color="purple" />
              <ActionBtn label="File OT" color="blue" />
              <ActionBtn label="Payslip" color="gray" />
              <ActionBtn label="Correction" color="purple" />
            </div>
          </div>

          {/* Leave Management */}
          <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-black">Leave Management</h4>
              <div className="text-xs text-gray-400">Balances</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leavePie} dataKey="value" innerRadius={22} outerRadius={36} startAngle={90} endAngle={-270}>
                      {leavePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs">
                <div className="text-sm font-semibold text-black">VL: 8 • SL: 5</div>
                <div className="text-gray-500 mt-1">Pending: 2</div>
                <div className="text-gray-500 mt-1">Approved: 6</div>
              </div>
            </div>
          </div>

          {/* Payroll Overview */}
          <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-black">Payroll Overview</h4>
              <div className="text-xs text-gray-400">Latest</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={payrollPie} dataKey="value" innerRadius={22} outerRadius={36} startAngle={90} endAngle={-270}>
                      {payrollPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs">
                <div className="text-sm font-semibold text-black">Net: ₱50,000</div>
                <div className="text-gray-500 mt-1">Deductions: ₱8,000</div>
                <div className="text-gray-500 mt-1">OT Pay: ₱2,000</div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-black">Announcements</h4>
              <div className="text-xs text-gray-400">Latest</div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="border-l-2 border-purple-400 pl-2 py-1">
                <div className="text-black text-sm">HR Update: Policy change effective May 1</div>
                <div className="text-gray-400">2h ago</div>
              </div>
              <div className="border-l-2 border-blue-400 pl-2 py-1">
                <div className="text-black text-sm">Holiday: Labor Day - May 1</div>
                <div className="text-gray-400">1d ago</div>
              </div>
              <div className="border-l-2 border-emerald-400 pl-2 py-1">
                <div className="text-black text-sm">Event: Team Building - May 10</div>
                <div className="text-gray-400">3d ago</div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-md p-3 bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-black">AI Insights</h4>
              <div className="text-xs text-gray-400">Auto summary</div>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Attendance improved by <span className="font-semibold text-black">12%</span> this month.</li>
              <li>• Completed <span className="font-semibold text-black">89%</span> of assigned tasks.</li>
              <li>• Rendered <span className="font-semibold text-black">6 hrs</span> overtime this week.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
