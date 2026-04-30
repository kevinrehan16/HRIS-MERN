import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, BriefcaseBusiness, Fingerprint, ReceiptText, 
  Wallet, Clock3, UserCircle, Lock, Eye, EyeOff, CalendarDays, 
  Building2, ArrowUpRight, ShieldCheck, Cake, VenusAndMars, VenetianMask, Copy, Plus
} from 'lucide-react';
import { useMyProfile } from '../../../hooks/useMyProfile';
import { formatShiftSchedule, formatCurrency, formatDate } from '../../../utils/formatters';

const MyProfile = () => {
  const [showSalary, setShowSalary] = useState(false);
  const { profile, isLoading, isError } = useMyProfile();

  const employee = {
    employeeId: profile?.employeeId,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    position: profile?.position?.title,
    department: profile?.department?.name,
    status: profile?.status,
    email: profile?.email,
    contactNo: profile?.contactNo,
    address: profile?.address,
    dateHired: profile?.dateHired,
    gender: profile?.gender,
    civilStatus: profile?.civilStatus,
    birthDate: formatDate(profile?.birthDate),
    employmentType: profile?.employmentType,
    tinNo: profile?.tinNo,
    sssNo: profile?.sssNo,
    philhealthNo: profile?.philhealthNo,
    pagibigNo: profile?.pagibigNo,
    basicSalary: formatCurrency(profile?.basicSalary),
    allowance: formatCurrency(profile?.allowance),
    totalLeaveCredits: profile?.leaveCredits,
    usedLeaveCredits: profile?.leaveSummary?.used,
    remainingLeaves: profile?.leaveSummary?.total,
    schedule: profile?.schedule?.name,
    schedTime: formatShiftSchedule(profile?.schedule?.shiftStart) + " - " + formatShiftSchedule(profile?.schedule?.shiftEnd),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 pb-12">
      <div className="h-50 bg-slate-950 absolute top-0 left-0 right-0 z-0" />
      
      <div className="w-full space-y-8 relative z-10 px-4 p-6 md:px-8">
        
        {/* --- HEADER SECTION (PIXEL PERFECT ALIGNMENT) --- */}
        {/* --- GLASSMORPHISM HEADER CARD --- */}
        <div className="relative overflow-hidden rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur-md shadow-2xl mb-6 flex flex-col md:flex-row items-start gap-4">
          
          {/* Profile Image with Purple Glow */}
          <div className="relative shrink-0 self-center md:self-start">
            {/* Mas matingkad na Purple Glow para lumitaw sa glass background */}
            <div className="absolute -inset-1 bg-purple-500 rounded-md blur opacity-60" />
            <div className="relative h-30 w-30 rounded-md bg-slate-900/80 border border-white/30 flex items-center justify-center text-white overflow-hidden shadow-xl">
              <UserCircle size={60} strokeWidth={1} className="text-slate-400" />
            </div>
          </div>

          {/* Text Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Pinalitaw ang kulay ng Name para hindi kainin ng glass effect */}
              <h1 className="text-2xl font-black tracking-tight text-white leading-none m-0 p-0 drop-shadow-sm">
                {`${employee.firstName} ${employee.lastName}`}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase tracking-widest leading-none shadow-sm">
                {employee.status}
              </span>
            </div>
            
            {/* POSITION - FIXED ALIGNMENT (PIXEL PERFECT) */}
            <div className="flex items-start gap-2 text-purple-300 mb-3">
              {/* Icon wrapper aligned to text height */}
              <div className="h-[24px] flex items-center shrink-0"> 
                <BriefcaseBusiness size={18} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              </div>
              
              <p className="text-[16px] font-bold leading-[24px] m-0 text-purple-200">
                {employee.position}
              </p>
            </div>
            
            {/* DEPARTMENT & ID - Semi-transparent tags */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/10">
                <Building2 size={13} className="text-purple-300 shrink-0"/>
                <span className="text-[10px] font-bold text-slate-100 uppercase tracking-tight leading-none pt-[1px]">
                  {employee.department}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1.5 rounded-md border border-white/10">
                <Fingerprint size={13} className="text-purple-300 shrink-0"/>
                <span className="text-[10px] font-bold text-slate-100 uppercase tracking-tight leading-none pt-[1px]">
                  ID: {employee.employeeId}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Glass Style */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 md:pt-1 w-full md:w-auto">
            <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md font-bold text-[10px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest backdrop-blur-sm">
              <Lock size={12} /> Change Password
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-bold text-[10px] shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest">
              Edit Details <ArrowUpRight size={12}/>
            </button>
          </div>

          {/* Subtle Internal Glow Effect inside the glass card */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* --- MAIN CONTENT (REST OF THE CARDS) --- */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* CONNECT CARD */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-md shadow-md border border-slate-100 flex flex-col overflow-hidden">
            {/* Header with subtle background */}
            <div className="px-4 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-md text-white shadow-sm shadow-blue-200 mb-2">
                <Send size={20} strokeWidth={2.5} />
              </div>
              <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wide leading-none">
                Connect
              </h4>
            </div>

            {/* Content List */}
            <div className="p-5 space-y-5">
              <DetailRow 
                icon={<Mail size={18} strokeWidth={2} />} 
                label="Corporate Email" 
                value={employee.email} 
                iconBg="bg-indigo-50 text-indigo-600"
              />
              <DetailRow 
                icon={<Phone size={18} strokeWidth={2} />} 
                label="Mobile Line" 
                value={employee.contactNo} 
                iconBg="bg-emerald-50 text-emerald-600"
              />
              <DetailRow 
                icon={<MapPin size={18} strokeWidth={2} />} 
                label="Primary Address" 
                value={employee.address} 
                iconBg="bg-amber-50 text-amber-600"
              />
            </div>
          </div>


          {/* STATUTORY CARD */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-md shadow-md border border-slate-100 overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-md text-white mb-1">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <h4 className="text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  Statutory Identifications
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400 italic">Verified Government Records</span>
            </div>

            {/* Grid Layout for ID Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <IDCard 
                label="Social Security System" 
                shortName="SSS"
                value={employee.sssNo} 
                imgSrc="/images/sss.jpg" 
                themeColor="blue"
              />
              <IDCard 
                label="Tax Identification No." 
                shortName="TIN"
                value={employee.tinNo} 
                imgSrc="/images/tin.jpg" 
                themeColor="emerald"
              />
              <IDCard 
                label="PhilHealth Identification" 
                shortName="PHIC"
                value={employee.philhealthNo} 
                imgSrc="/images/philhealth.png" 
                themeColor="red"
              />
              <IDCard 
                label="Pag-IBIG Fund" 
                shortName="HDMF"
                value={employee.pagibigNo} 
                imgSrc="/images/pagibig.png" 
                themeColor="amber"
              />
            </div>
          </div>

          {/* COMPENSATION & LEAVES (Row for alignment) */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Schedule */}
            <div className="group bg-white rounded-md border border-slate-200 p-7 shadow-sm transition-all hover:border-amber-200">
                {/* 1. SIMPLE HEADER (Title only) */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-md group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 mb-2">
                  <Clock3 size={20} strokeWidth={2.5} />
                </div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                  Work Schedule
                </h4>
              </div>

              {/* 2. MAIN CONTENT (Time Display) */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-bold !text-amber-600 group-hover:!text-slate-800 transition-all duration-300 tracking-tighter uppercase">
                    { employee.schedTime }
                  </h2>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded tracking-widest">
                    PHT
                  </span>
                </div>
              </div>

              {/* 3. WEEKLY TRACKER */}
              <div className="flex gap-1.5 mb-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                  // Ang logic: Monday is index 1, Friday is index 5.
                  // Kaya i >= 1 && i <= 5 ang kukulayan natin.
                  const isWorkDay = i >= 1 && i <= 5;

                  return (
                    <div 
                      key={i} 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black transition-all
                        ${isWorkDay 
                          ? 'bg-slate-900 text-white shadow-md group-hover:bg-amber-600' 
                          : 'bg-slate-50 text-slate-300 border border-slate-100'
                        }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* 4. FOOTER INFO (Grace Period & Shift Name Dito Inilipat) */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    { employee.schedule }
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">
                    15 Mins Grace Period
                  </span>
                </div>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-md p-5 text-white shadow-lg shadow-blue-900/20">
              {/* Decorative Background Circles */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-blue-400/50 rounded-full blur-xl" />

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[15px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-90">
                      Leave Credits
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <h2 className="text-5xl font-black tracking-tighter">{employee.remainingLeaves}</h2>
                      <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">Days Left</span>
                    </div>
                  </div>
                  {/* Icon Badge */}
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-md border border-white/20">
                    <CalendarDays size={50} className="text-white" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {/* Stats Row */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-blue-200 opacity-80 leading-none">Usage Status</p>
                      <p className="text-sm font-bold">
                        {employee.usedLeaveCredits} <span className="opacity-60 font-medium">Used</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black uppercase text-blue-200 opacity-80 leading-none">Allowance</p>
                      <p className="text-sm font-bold">
                        {employee.totalLeaveCredits} <span className="opacity-60 font-medium">Total</span>
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-slate-900/20 h-2.5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-emerald-400 to-cyan-300 h-full rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-1000" 
                        style={{ width: `${(employee.remainingLeaves / employee.totalLeaveCredits) * 100}%` }}
                      />
                    </div>
                    {/* Progress Glow */}
                    <div 
                      className="absolute top-0 left-0 h-full bg-white/20 blur-sm rounded-full"
                      style={{ width: `${(employee.remainingLeaves / employee.totalLeaveCredits) * 100}%` }}
                    />
                  </div>

                  <button className="
                    group relative w-full mt-2 py-2.5 
                    bg-white/10 hover:bg-white/20 
                    text-white border border-white/20 
                    rounded-md font-black text-[10px] uppercase tracking-[0.2em] 
                    transition-all duration-300 ease-out
                    hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]
                    active:scale-[0.98]
                    overflow-hidden
                  ">
                    {/* Shimmer Effect - ito yung nagpapadaan ng liwanag */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <span className="relative flex items-center justify-center gap-2">
                      <Plus size={14} className="transition-transform group-hover:rotate-90 duration-300" />
                      Apply for Leave
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Compensation (Basic + Allowance) */}
            <div className="group bg-white rounded-md border border-slate-200 p-7 shadow-sm transition-all hover:border-purple-200">
              {/* Header: Secured Icon & Toggle */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-md group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 mb-3">
                    <Wallet size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1">
                      Payroll Details
                    </h4>
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-tight">
                      Active • Monthly
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowSalary(!showSalary)} 
                  className="p-2 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showSalary ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>


              {/* Breakdown Section: Malinis at Maluwag */}
              <div className="pt-12 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Basic Salary</p>
                  <p className="flex items-baseline gap-2 text-md font-bold text-slate-700">
                    {showSalary ? `${employee.basicSalary.toLocaleString()}` : '••••••'}
                    <span className="text-[8px] font-medium text-purple-500 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wide">
                      Taxable
                    </span>
                  </p>
                  
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Allowances</p>
                  <div className="flex items-center gap-1.5 text-purple-600">
                    <Plus size={10} strokeWidth={3} />
                    <p className="text-sm font-bold">
                      {showSalary ? `${employee.allowance.toLocaleString()}` : '••••'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Added Detail: Next Payout Indicator */}
              <div className="mt-5 flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Pay Frequency</span>
                </div>
                <span className="text-[10px] font-black text-slate-700 uppercase">Semi-Monthly (15/30)</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER BIO (WITH DIVIDERS & LARGE ICONS) --- */}
        <div className="mt-8 bg-white rounded-md border border-slate-200 p-2 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between divide-x divide-slate-100">
            
            {/* Birthday - Pink Theme */}
            <div className="flex-1 min-w-[150px] px-6 py-3 group hover:bg-pink-50 transition-all duration-300 first:rounded-l-md">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-pink-50 text-pink-500 rounded-md group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <Cake size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center mt-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1 group-hover:text-pink-600 transition-colors">
                    Birthday
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-pink-900 transition-colors">
                    {employee.birthDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Civil Status - Purple Theme */}
            <div className="flex-1 min-w-[150px] px-6 py-3 group hover:bg-purple-50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <VenetianMask size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center  mt-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1 group-hover:text-purple-600 transition-colors">
                    Civil Status
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-purple-900 transition-colors">
                    {employee.civilStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Gender - Blue Theme */}
            <div className="flex-1 min-w-[150px] px-6 py-3 group hover:bg-blue-50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-md group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <VenusAndMars size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center  mt-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1 group-hover:text-blue-600 transition-colors">
                    Gender
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-blue-900 transition-colors">
                    {employee.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Type - Orange Theme */}
            <div className="flex-1 min-w-[150px] px-6 py-3 group hover:bg-orange-50 transition-all duration-300 last:rounded-r-md">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-50 text-orange-500 rounded-md group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <ReceiptText size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col justify-center  mt-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wide leading-none mb-1 group-hover:text-orange-600 transition-colors">
                    Contract
                  </p>
                  <p className="text-[13px] font-bold text-slate-800 leading-tight group-hover:text-orange-900 transition-colors">
                    {employee.employmentType}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const DetailRow = ({ icon, label, value, iconBg }) => (
  <div className="flex items-start gap-4 group cursor-default">
    {/* Icon Wrapper: Square & Centered */}
    <div className={`shrink-0 w-10 h-10 rounded-md ${iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
      {icon}
    </div>
    
    {/* Text Wrapper: Stacked but aligned to the top of the icon */}
    <div className="flex flex-col min-w-0 pt-0.5 mt-1">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1.5">
        {label}
      </span>
      <p className="text-[13px] font-bold text-slate-800 leading-tight break-words">
        {value}
      </p>
    </div>
  </div>
);

// --- Awesome ID Card Component ---
const IDCard = ({ label, shortName, value, imgSrc, themeColor }) => {
  const themes = {
    blue: "from-blue-50 to-white border-blue-100 text-blue-600",
    emerald: "from-emerald-50 to-white border-emerald-100 text-emerald-600",
    red: "from-red-50 to-white border-red-100 text-red-600",
    amber: "from-amber-50 to-white border-amber-100 text-amber-600",
  };

  return (
    <div className={`relative group overflow-hidden bg-gradient-to-br ${themes[themeColor]} border rounded-md px-4 py-1.5 transition-all hover:shadow-lg hover:-translate-y-0.5`}>
      <div className="flex items-center gap-3 relative z-10">
        {/* Government Logo Placeholder */}
        <div className="w-12 h-12 rounded-md bg-white p-1.5 shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
          <img 
            src={imgSrc} 
            alt={shortName} 
            className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
            onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }} // Fallback
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mt-3">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-white/50 rounded border border-current/10">{shortName}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[14px] font-mono font-black text-slate-800 tracking-wider">
              {value || "NOT PROVIDED"}
            </p>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-blue-500">
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Background Element */}
      <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <ShieldCheck size={80} strokeWidth={1} />
      </div>
    </div>
  );
};

const FooterItem = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-4 px-8 py-2 flex-1 justify-center first:pl-4 last:pr-4">
    <div className={`${color} shrink-0`}>{icon}</div>
    <div className="text-center md:text-left">
      <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{label}</p>
      <p className="text-xs font-bold text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

export default MyProfile;