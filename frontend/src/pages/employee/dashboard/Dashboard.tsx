// ADVANCED ENTERPRISE DASHBOARD VERSION
// Premium Employee Analytics Dashboard

import {
  Activity,
  Clock3,
  Briefcase,
  Coffee,
  CheckCircle,
  Timer,
  LogOut,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* -------------------------------------------------------------------------- */
/*                                   DATA                                     */
/* -------------------------------------------------------------------------- */

const performanceTrendData = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 78 },
  { month: "Apr", score: 75 },
  { month: "May", score: 82 },
  { month: "Jun", score: 89 },
];

const miniHoursData = [
  { day: "M", hours: 8 },
  { day: "T", hours: 7 },
  { day: "W", hours: 9 },
  { day: "T", hours: 8 },
  { day: "F", hours: 6 },
];

const attendanceData = [
  { day: "Mon", hours: 8, overtime: 2 },
  { day: "Tue", hours: 7, overtime: 1 },
  { day: "Wed", hours: 9, overtime: 3 },
  { day: "Thu", hours: 8, overtime: 2 },
  { day: "Fri", hours: 6, overtime: 1 },
  { day: "Sat", hours: 5, overtime: 0 },
  { day: "Sun", hours: 0, overtime: 0 },
];

const productivityData = [
  { day: "Mon", completed: 12, pending: 4 },
  { day: "Tue", completed: 15, pending: 3 },
  { day: "Wed", completed: 10, pending: 5 },
  { day: "Thu", completed: 18, pending: 2 },
  { day: "Fri", completed: 20, pending: 1 },
];

const payrollPieData = [
  { name: "Basic Salary", value: 35000, color: "#8b5cf6" },
  { name: "Allowance", value: 12000, color: "#10b981" },
  { name: "Bonus", value: 8000, color: "#3b82f6" },
  { name: "Tax", value: 5000, color: "#ef4444" },
];

const tasks = [
  {
    title: "Complete API Integration",
    deadline: "Due Tomorrow",
    priority: "High",
    priorityColor: "bg-red-100 text-red-600",
    progress: 85,
  },
  {
    title: "UI Dashboard Revision",
    deadline: "Friday",
    priority: "Medium",
    priorityColor: "bg-yellow-100 text-yellow-700",
    progress: 60,
  },
  {
    title: "Database Optimization",
    deadline: "Next Week",
    priority: "Low",
    priorityColor: "bg-green-100 text-green-700",
    progress: 30,
  },
];

const actions = [
  { label: "Clock In", icon: Clock3 },
  { label: "Break", icon: Coffee },
  { label: "Tasks", icon: CheckCircle },
  { label: "Logout", icon: LogOut },
];

const insights = [
  "Your productivity is 18% higher compared to last month.",
  "You achieved 24 perfect attendance days this month.",
  "Peak performance recorded every Thursday afternoon.",
];

const announcements = [
  {
    title: "Company Townhall",
    time: "2 hrs ago",
    description: "Monthly company-wide meeting this Friday at 3PM.",
    border: "border-purple-500",
  },
  {
    title: "Payroll Release",
    time: "Yesterday",
    description: "Salary will be credited on April 30.",
    border: "border-emerald-500",
  },
  {
    title: "New HR Policy",
    time: "2 days ago",
    description: "Updated leave filing procedure is now active.",
    border: "border-blue-500",
  },
];

const summaryCards = [
  {
    title: "Monthly Salary",
    value: "₱95,600",
    subtitle: "Updated this month",
    trend: "+8%",
    trendColor: "text-emerald-600",
    progress: 85,
    progressColor: "bg-purple-500",
    icon: Briefcase,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Attendance",
    value: "96%",
    subtitle: "Excellent record",
    trend: "+2%",
    trendColor: "text-emerald-600",
    progress: 96,
    progressColor: "bg-emerald-500",
    icon: CheckCircle,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Overtime",
    value: "14 hrs",
    subtitle: "This month",
    trend: "+4 hrs",
    trendColor: "text-blue-600",
    progress: 70,
    progressColor: "bg-blue-500",
    icon: Timer,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Tasks Done",
    value: "82%",
    subtitle: "Completion rate",
    trend: "+10%",
    trendColor: "text-emerald-600",
    progress: 82,
    progressColor: "bg-purple-500",
    icon: Activity,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Break Time",
    value: "1.5 hrs",
    subtitle: "Average daily",
    trend: "Healthy",
    trendColor: "text-amber-600",
    progress: 60,
    progressColor: "bg-amber-500",
    icon: Coffee,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Performance",
    value: "89%",
    subtitle: "Overall score",
    trend: "+12%",
    trendColor: "text-emerald-600",
    progress: 89,
    progressColor: "bg-emerald-500",
    icon: Activity,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

const heatmapData = Array.from({ length: 35 }, (_, i) => {
  const colors = [
    "bg-gray-100",
    "bg-purple-200",
    "bg-purple-300",
    "bg-purple-400",
    "bg-purple-500",
  ];

  return {
    label: `Day ${i + 1}`,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
});

const taskStatusData = [
  { name: "Completed", value: 65, color: "#10b981" },
  { name: "In Progress", value: 20, color: "#3b82f6" },
  { name: "Pending", value: 10, color: "#f59e0b" },
  { name: "Overdue", value: 5, color: "#ef4444" },
];

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-3 text-gray-900">
      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="rounded-md border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <h2 className="mt-1 text-lg font-semibold">{card.value}</h2>
              </div>

              <div className={`rounded-md p-2 ${card.iconBg}`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-gray-500">{card.subtitle}</span>
              <span className={card.trendColor}>{card.trend}</span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-gray-100">
              <div
                className={`h-full rounded-md ${card.progressColor}`}
                style={{ width: `${card.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* LEFT SIDE */}
        <div className="space-y-3 xl:col-span-9">
          {/* PERFORMANCE OVERVIEW */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-purple-100">
                    Monthly Performance
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">89%</h2>
                  <p className="mt-1 text-xs text-purple-100">
                    Productivity increased by 12% this month
                  </p>
                </div>

                <div className="rounded-md bg-white/10 p-2 backdrop-blur-sm">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceTrendData}>
                    <defs>
                      <linearGradient
                        id="colorPerformance"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ffffff"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ffffff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#E9D5FF" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#fff"
                      fillOpacity={1}
                      fill="url(#colorPerformance)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Work Hours</p>
                    <h3 className="mt-1 text-xl font-semibold">46 hrs</h3>
                  </div>

                  <div className="rounded-md bg-emerald-100 p-2">
                    <Clock3 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>

                <div className="mt-3 h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={miniHoursData}>
                      <Bar
                        dataKey="hours"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Task Completion</p>
                    <h3 className="mt-1 text-xl font-semibold">24/30</h3>
                  </div>

                  <div className="rounded-md bg-blue-100 p-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-md bg-gray-100">
                  <div className="h-full w-[80%] rounded-md bg-blue-500" />
                </div>

                <p className="mt-2 text-[11px] text-gray-500">
                  80% completed this month
                </p>
              </div>
            </div>
          </div>

          {/* ATTENDANCE + HEATMAP */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Attendance & Overtime Trends
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Weekly work analytics
                  </p>
                </div>
              </div>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient
                        id="hoursGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#a855f7"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#a855f7"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />

                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#a855f7"
                      fill="url(#hoursGradient)"
                      strokeWidth={2}
                    />

                    <Line
                      type="monotone"
                      dataKey="overtime"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
              <div className="mb-3">
                <h2 className="text-sm font-semibold">
                  Attendance Heatmap
                </h2>

                <p className="text-[11px] text-gray-500">
                  Last 30 days
                </p>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {heatmapData.map((item, index) => (
                  <div
                    key={index}
                    className={`h-7 rounded-md ${item.color}`}
                    title={item.label}
                  />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 p-2">
                  <p className="text-[11px] text-gray-500">Late Days</p>
                  <h3 className="mt-1 text-sm font-semibold">2</h3>
                </div>

                <div className="rounded-md bg-gray-50 p-2">
                  <p className="text-[11px] text-gray-500">
                    Perfect Days
                  </p>
                  <h3 className="mt-1 text-sm font-semibold">24</h3>
                </div>
              </div>
            </div>
          </div>

          {/* TASKS + PRODUCTIVITY */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
            <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">
                    Task Productivity
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Weekly completion performance
                  </p>
                </div>

                <div className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700">
                  +18% this week
                </div>
              </div>

              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                    />

                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} />

                    <Tooltip />

                    <Bar
                      dataKey="completed"
                      fill="#a855f7"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="pending"
                      fill="#d8b4fe"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm lg:col-span-2">
              <div className="mb-3">
                <h2 className="text-sm font-semibold">
                  Upcoming Tasks
                </h2>

                <p className="text-[11px] text-gray-500">
                  Priority-based tasks
                </p>
              </div>

              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-gray-200 p-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-medium">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {task.deadline}
                        </p>
                      </div>

                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${task.priorityColor}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-md bg-gray-100">
                      <div
                        className="h-full rounded-md bg-purple-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TASK STATUS ANALYTICS */}
          </div>
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">
                Task Status Analytics
              </h2>

              <p className="text-[11px] text-gray-500">
                Current task distribution
              </p>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-2">
              {taskStatusData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    {item.name}
                  </div>

                  <span className="font-medium">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-3 xl:col-span-3">
          {/* QUICK ACTIONS */}
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-[11px] font-medium transition-all duration-200 hover:border-purple-300 hover:bg-purple-50"
                >
                  <action.icon className="h-4 w-4 text-purple-600" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAYROLL PIE */}
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">
                Payroll Breakdown
              </h2>

              <p className="text-[11px] text-gray-500">
                Current salary distribution
              </p>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payrollPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {payrollPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-2">
              {payrollPieData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    {item.name}
                  </div>

                  <span className="font-medium">
                    ₱{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="rounded-md border border-purple-200 bg-gradient-to-br from-purple-500 to-purple-600 p-3 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">AI Insights</h2>

              <div className="rounded-md bg-white/10 px-2 py-1 text-[10px] backdrop-blur-sm">
                Smart Analytics
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="rounded-md bg-white/10 p-2 text-[11px] backdrop-blur-sm"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
            <div className="mb-3">
              <h2 className="text-sm font-semibold">
                Announcements
              </h2>

              <p className="text-[11px] text-gray-500">
                Company updates
              </p>
            </div>

            <div className="space-y-2">
              {announcements.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-md border-l-4 ${item.border} bg-gray-50 p-2`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-medium">
                      {item.title}
                    </h3>

                    <span className="text-[10px] text-gray-400">
                      {item.time}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-gray-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}