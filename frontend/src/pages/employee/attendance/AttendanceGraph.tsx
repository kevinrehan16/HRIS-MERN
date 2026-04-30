// FUTURISTIC ENTERPRISE ATTENDANCE LOGS PAGE
// React + TailwindCSS + Recharts ONLY

import React, { useMemo, useState } from "react";

import {
  Search,
  CalendarDays,
  RefreshCcw,
  Download,
  Clock3,
  TimerReset,
  TrendingUp,
  Eye,
  Pencil,
  MoreHorizontal,
  Activity,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  BadgeAlert,
  CircleAlert,
  MoonStar,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

export default function AttendanceLogsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const attendanceData = [
    {
      id: "EMP-1001",
      name: "Kevin Macandog",
      department: "IT Development",
      date: "Apr 30, 2026",
      timeIn: "8:01 AM",
      timeOut: "5:42 PM",
      breakHours: "1h",
      totalHours: "8.7h",
      overtime: "1.2h",
      status: "Present",
      remarks: "On Time",
    },
    {
      id: "EMP-1002",
      name: "Angela Cruz",
      department: "Human Resources",
      date: "Apr 30, 2026",
      timeIn: "8:30 AM",
      timeOut: "5:10 PM",
      breakHours: "1h",
      totalHours: "7.4h",
      overtime: "0h",
      status: "Late",
      remarks: "Traffic Delay",
    },
    {
      id: "EMP-1003",
      name: "John Reyes",
      department: "Finance",
      date: "Apr 30, 2026",
      timeIn: "--",
      timeOut: "--",
      breakHours: "--",
      totalHours: "0h",
      overtime: "0h",
      status: "Absent",
      remarks: "No Attendance",
    },
    {
      id: "EMP-1004",
      name: "Samantha Lee",
      department: "Operations",
      date: "Apr 30, 2026",
      timeIn: "8:10 AM",
      timeOut: "12:00 PM",
      breakHours: "30m",
      totalHours: "4h",
      overtime: "0h",
      status: "Half Day",
      remarks: "Personal Appointment",
    },
    {
      id: "EMP-1005",
      name: "Michael Tan",
      department: "Marketing",
      date: "Apr 30, 2026",
      timeIn: "--",
      timeOut: "--",
      breakHours: "--",
      totalHours: "0h",
      overtime: "0h",
      status: "Leave",
      remarks: "Vacation Leave",
    },
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `EMP-10${i + 10}`,
      name: `Employee ${i + 1}`,
      department: ["IT", "Finance", "Operations", "Marketing"][i % 4],
      date: "Apr 30, 2026",
      timeIn: "8:00 AM",
      timeOut: "5:00 PM",
      breakHours: "1h",
      totalHours: "8h",
      overtime: `${i % 3}h`,
      status: ["Present", "Late", "Present", "Leave"][i % 4],
      remarks: "Attendance Logged",
    })),
  ];

  const filteredData = useMemo(() => {
    return attendanceData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const chartData = [
    { day: "Mon", attendance: 92 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 96 },
    { day: "Thu", attendance: 91 },
    { day: "Fri", attendance: 98 },
    { day: "Sat", attendance: 72 },
    { day: "Sun", attendance: 60 },
  ];

  const pieData = [
    { name: "Present", value: 68 },
    { name: "Late", value: 12 },
    { name: "Absent", value: 7 },
    { name: "Leave", value: 13 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

  const statCards = [
    {
      title: "Present Days",
      value: "24",
      icon: CheckCircle2,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Late Count",
      value: "4",
      icon: BadgeAlert,
      color: "from-yellow-400 to-orange-500",
    },
    {
      title: "Absent Count",
      value: "1",
      icon: XCircle,
      color: "from-rose-400 to-rose-600",
    },
    {
      title: "Hours Worked",
      value: "187h",
      icon: Clock3,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Overtime",
      value: "19h",
      icon: TimerReset,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Undertime",
      value: "2",
      icon: CircleAlert,
      color: "from-slate-500 to-slate-700",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-100 text-emerald-700";
      case "Late":
        return "bg-yellow-100 text-yellow-700";
      case "Absent":
        return "bg-rose-100 text-rose-700";
      case "Leave":
        return "bg-blue-100 text-blue-700";
      case "Half Day":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-5 text-slate-800">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-2xl bg-purple-400 p-3 text-white shadow-lg">
              <Activity size={28} />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight">
                Attendance Logs
              </h1>

              <p className="text-sm text-slate-500">
                Enterprise attendance monitoring and workforce analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">Current Time</p>
            <h2 className="font-bold">09:42:18 AM</h2>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            <Sparkles size={16} />
            Live Tracking
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className={`rounded-3xl bg-gradient-to-br ${card.color} p-[1px] shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="rounded-3xl bg-white/90 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-2xl bg-slate-100 p-3">
                    <Icon className="text-slate-700" size={22} />
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <TrendingUp size={14} />
                    +8%
                  </div>
                </div>

                <h2 className="text-3xl font-black">{card.value}</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {card.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* LEFT SIDE */}
        <div className="xl:col-span-3">
          {/* FILTERS */}
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
              <div className="relative xl:col-span-2">
                <Search
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Search employee..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-purple-400"
                />
              </div>

              <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
                <CalendarDays size={18} />
                Date Range
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              >
                <option>All</option>
                <option>Present</option>
                <option>Late</option>
                <option>Absent</option>
                <option>Half Day</option>
                <option>Leave</option>
              </select>

              <button className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90">
                <Download size={18} />
                Export
              </button>

              <button className="flex items-center justify-center gap-2 rounded-2xl bg-purple-400 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90">
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="overflow-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
                    {[
                      "Employee",
                      "Department",
                      "Date",
                      "Time In",
                      "Time Out",
                      "Hours",
                      "Overtime",
                      "Status",
                      "Remarks",
                      "Actions",
                    ].map((item) => (
                      <th key={item} className="px-5 py-4 font-semibold">
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((employee, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 font-bold text-purple-700">
                            {employee.name.charAt(0)}
                          </div>

                          <div>
                            <h3 className="font-semibold">
                              {employee.name}
                            </h3>

                            <p className="text-xs text-slate-400">
                              {employee.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {employee.department}
                      </td>

                      <td className="px-5 py-4">{employee.date}</td>

                      <td className="px-5 py-4">
                        {employee.timeIn}
                      </td>

                      <td className="px-5 py-4">
                        {employee.timeOut}
                      </td>

                      <td className="px-5 py-4">
                        {employee.totalHours}
                      </td>

                      <td className="px-5 py-4">
                        {employee.overtime}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            employee.status
                          )}`}
                        >
                          {employee.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {employee.remarks}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200">
                            <Eye size={16} />
                          </button>

                          <button className="rounded-xl bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200">
                            <Pencil size={16} />
                          </button>

                          <button className="rounded-xl bg-slate-100 p-2 transition hover:bg-slate-200">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <p className="text-sm text-slate-500">
                Showing 1-15 of 15 records
              </p>

              <div className="flex gap-2">
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                  Previous
                </button>

                <button className="rounded-xl bg-purple-400 px-4 py-2 text-sm font-semibold text-white">
                  1
                </button>

                <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {/* ANALYTICS */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Attendance Analytics
                </h2>

                <p className="text-sm text-slate-500">
                  Workforce insights
                </p>
              </div>

              <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
                <Sparkles size={20} />
              </div>
            </div>

            {/* RADIAL */}
            <div className="mb-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ value: 92 }]}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* AREA CHART */}
            <div className="mb-6 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="attendance"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#a855f7"
                        stopOpacity={0.8}
                      />

                      <stop
                        offset="95%"
                        stopColor="#a855f7"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#a855f7"
                    fill="url(#attendance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* PIE CHART */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SCORE */}
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Productivity Score
                </p>

                <span className="font-bold text-emerald-600">
                  94%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[94%] rounded-full bg-emerald-500"></div>
              </div>
            </div>
          </div>

          {/* AI INSIGHT */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <MoonStar />
              </div>

              <div>
                <h2 className="font-bold">
                  AI Attendance Insight
                </h2>

                <p className="text-xs text-slate-300">
                  Workforce behavior analysis
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-300">
              Attendance consistency improved by 12% this month.
              Employees from the IT Department showed the
              highest punctuality and overtime productivity.
            </p>

            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold">Work Streak</h3>

                <Flame />
              </div>

              <h1 className="text-4xl font-black">18 Days</h1>

              <p className="mt-2 text-sm text-slate-300">
                Consistent attendance streak maintained.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}