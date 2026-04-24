import React from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  Calendar, ShieldCheck, Clock, FileText, 
  Building2, ChevronRight, Fingerprint, 
  Wallet, Award
} from 'lucide-react';

const DailyLogs = () => {
  return (
    <div className="p-6 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- 1. TOP STATS BAR (Quick Info) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Clock className="text-blue-600" />} label="Shift Today" value="08:00 AM - 05:00 PM" />
          <StatCard icon={<Fingerprint className="text-emerald-600" />} label="Status" value="On-Duty" isStatus />
          <StatCard icon={<Calendar className="text-orange-600" />} label="Leave Balance" value="12.5 Days" />
          <StatCard icon={<Wallet className="text-purple-600" />} label="Last Payslip" value="Oct 15, 2023" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- 2. LEFT SIDE: PRIMARY INFO (4 cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="h-24 bg-purple-600"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4 flex justify-center">
                  <div className="h-24 w-24 rounded-2xl bg-slate-800 border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-black italic">
                    JD
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold text-slate-800">John Doe</h2>
                  <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Senior Systems Analyst</p>
                  <p className="text-xs text-slate-400 font-medium">EMP-2023-0892</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                  <ContactRow icon={<Mail size={16}/>} text="john.doe@company.com" />
                  <ContactRow icon={<Phone size={16}/>} text="+63 912 345 6789" />
                  <ContactRow icon={<Building2 size={16}/>} text="IT Department / Fintech Group" />
                  <ContactRow icon={<MapPin size={16}/>} text="BGC, Taguig City, PH" />
                </div>
              </div>
            </div>

            {/* Quick Actions for HRIS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Request Leave" />
                <ActionButton label="File OT" />
                <ActionButton label="Correction" />
                <ActionButton label="View Taxes" />
              </div>
            </div>
          </div>

          {/* --- 3. RIGHT SIDE: DETAILED INFO (8 cols) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tabs Header Style */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
              <div className="flex border-b border-slate-100 px-6">
                <button className="py-4 px-6 text-sm font-bold text-purple-600 border-b-2 border-purple-600">Employment Profile</button>
                <button className="py-4 px-6 text-sm font-bold text-slate-400 hover:text-slate-600">Compensation</button>
                <button className="py-4 px-6 text-sm font-bold text-slate-400 hover:text-slate-600">Documents</button>
              </div>
              
              <div className="p-8 space-y-8">
                {/* Organization Section */}
                <section>
                  <SectionTitle title="Organization Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <DataField label="Job Grade" value="Level 4 (Senior)" />
                    <DataField label="Reports To" value="Michael Scott (VP of Engineering)" />
                    <DataField label="Date Joined" value="August 15, 2021" />
                    <DataField label="Tenure" value="2 Years, 2 Months" />
                    <DataField label="Work Location" value="Corporate Office (Hybrid)" />
                    <DataField label="Contract Status" value="Regular Employment" />
                  </div>
                </section>

                {/* Government IDs Section */}
                <section className="pt-8 border-t border-slate-50">
                  <SectionTitle title="Government Identifications" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">SSS Number</p>
                      <p className="text-sm font-mono font-bold text-slate-700">34-1234567-8</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">PhilHealth</p>
                      <p className="text-sm font-mono font-bold text-slate-700">12-987654321-0</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">TIN</p>
                      <p className="text-sm font-mono font-bold text-slate-700">456-789-123-000</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Recent Activities Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <SectionTitle title="Recent Attendance Logs" />
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Time In</th>
                      <th className="pb-3">Time Out</th>
                      <th className="pb-3">Late/Undertime</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <LogRows date="Oct 24, 2023" in="07:55 AM" out="05:10 PM" status="On-Time" />
                    <LogRows date="Oct 23, 2023" in="08:15 AM" out="05:00 PM" status="15m Late" isWarning />
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, isStatus }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className={`text-sm font-black ${isStatus ? 'text-emerald-600' : 'text-slate-700'}`}>{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-2 mb-6">
    <div className="h-4 w-1 bg-purple-600 rounded-full"></div>
    <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
  </div>
);

const DataField = ({ label, value }) => (
  <div>
    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700">{value}</p>
  </div>
);

const ContactRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-slate-600">
    <span className="text-slate-400">{icon}</span>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const ActionButton = ({ label }) => (
  <button className="w-full py-2 px-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 border border-slate-100 rounded-xl text-[11px] font-bold text-slate-600 transition-all">
    {label}
  </button>
);

const LogRows = ({ date, in: timeIn, out: timeOut, status, isWarning }) => (
  <tr className="group">
    <td className="py-4 text-xs font-bold text-slate-700">{date}</td>
    <td className="py-4 text-xs font-medium text-slate-600">{timeIn}</td>
    <td className="py-4 text-xs font-medium text-slate-600">{timeOut}</td>
    <td className="py-4 text-[10px] font-bold">
      <span className={isWarning ? 'text-rose-500' : 'text-emerald-500'}>{status}</span>
    </td>
    <td className="py-4 text-right">
      <button className="text-slate-300 hover:text-purple-600"><ChevronRight size={16}/></button>
    </td>
  </tr>
);

export default DailyLogs;