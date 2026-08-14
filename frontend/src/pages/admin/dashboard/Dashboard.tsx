import { Activity, AlertCircle, Building2, CheckCircle2, Clock3, DollarSign, FileCheck2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../../../hooks/useDashboard';
import { formatCurrency } from '../../../utils/formatters';

const Stat = ({ icon: Icon, label, value, tone, helper }: any) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>
      <div className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></div>
    </div>
    <p className="mt-3 text-xs text-slate-500">{helper}</p>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useAdminDashboard();
  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading workforce intelligence…</div>;
  if (isError || !data) return <div className="m-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load dashboard data. Please refresh or check the API connection.</div>;
  const attendanceRate = data.attendance.totalEmployees ? Math.round(((data.attendance.present + data.attendance.late) / data.attendance.totalEmployees) * 100) : 0;

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-semibold text-indigo-600">WORKFORCE COMMAND CENTER</p><h1 className="text-2xl font-bold text-slate-900">People operations at a glance</h1><p className="mt-1 text-sm text-slate-500">Live attendance, approval workload, payroll exposure, and activity history.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">Updated {new Date(data.generatedAt).toLocaleString()}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Active workforce" value={data.attendance.totalEmployees} helper={`${data.departments.length} departments represented`} tone="bg-indigo-50 text-indigo-600" />
        <Stat icon={CheckCircle2} label="Checked in today" value={`${attendanceRate}%`} helper={`${data.attendance.present} present · ${data.attendance.late} late`} tone="bg-emerald-50 text-emerald-600" />
        <Stat icon={AlertCircle} label="Approval queue" value={data.approvals.total} helper={`${data.approvals.leave} leave · ${data.approvals.correction} corrections · ${data.approvals.overtime} OT`} tone="bg-amber-50 text-amber-600" />
        <Stat icon={DollarSign} label="Monthly net payroll" value={formatCurrency(data.payroll.netPay)} helper={`${data.payroll.employeesProcessed} payroll records processed`} tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Seven-day attendance pulse</h2><p className="text-xs text-slate-500">Present and late employee check-ins</p></div><Activity className="text-indigo-500" size={20} /></div>
          <div className="mt-6 grid h-48 grid-cols-7 items-end gap-3">
            {data.attendance.trend.map((day: any) => { const high = Math.max(1, data.attendance.totalEmployees); const value = day.present + day.late; return <div key={day.day} className="flex h-full flex-col justify-end text-center"><div className="relative mx-auto w-full max-w-10 rounded-t-lg bg-indigo-100" style={{ height: `${Math.max(8, (value / high) * 100)}%` }} title={`${day.present} present, ${day.late} late`}><div className="absolute bottom-0 w-full rounded-t-lg bg-indigo-600" style={{ height: `${value ? (day.present / value) * 100 : 0}%` }} /></div><p className="mt-2 text-xs font-medium text-slate-500">{day.label}</p><p className="text-[10px] text-slate-400">{value}</p></div>; })}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-500"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-indigo-600" />Present</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-indigo-100" />Late</span><span className="ml-auto">{data.attendance.absent} unaccounted today</span></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Approval workbench</h2><p className="text-xs text-slate-500">Items requiring an HR decision</p></div><FileCheck2 className="text-amber-500" size={20} /></div>
          <div className="mt-5 space-y-3">
            {[['Leave requests', data.approvals.leave, '/admin/leave-requests'], ['Attendance corrections', data.approvals.correction, '/admin/attendance-corrections'], ['Overtime requests', data.approvals.overtime, '/admin/overtime-requests']].map(([label, count, to]: any) => <Link key={label} to={to} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 no-underline transition hover:border-indigo-200 hover:bg-indigo-50"><span className="text-sm font-medium text-slate-700">{label}</span><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">{count}</span></Link>)}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"><div className="flex items-center gap-2"><Building2 size={18} className="text-indigo-500" /><h2 className="font-bold text-slate-900">Headcount by department</h2></div><div className="mt-4 space-y-3">{data.departments.length ? data.departments.map((department: any) => <div key={department.name}><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{department.name}</span><b className="text-slate-800">{department.employees}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.max(4, (department.employees / Math.max(1, data.attendance.totalEmployees)) * 100)}%` }} /></div></div>) : <p className="text-sm text-slate-500">No departments have been configured.</p>}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3"><div className="flex items-center gap-2"><Clock3 size={18} className="text-slate-500" /><h2 className="font-bold text-slate-900">Recent HR activity</h2></div><div className="mt-3 divide-y divide-slate-100">{data.audit.length ? data.audit.map((item: any) => <div key={item.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-semibold text-slate-700">{item.action.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{item.actorName} · {item.entity}{item.entityId ? ` #${item.entityId}` : ''}</p></div><time className="whitespace-nowrap text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</time></div>) : <p className="py-8 text-center text-sm text-slate-500">Activity will appear after HR actions are completed.</p>}</div></section>
      </div>
    </div>
  );
};
export default Dashboard;