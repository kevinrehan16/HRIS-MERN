import React, { useState } from 'react';
import { Wallet, Plus, SearchIcon, Eye, Download } from 'lucide-react';

import { getInitials, getMonthShort, getDayNumber } from '../../../utils/formatters';
import { usePayroll } from '../../../hooks/usePayroll';
import { notificationService } from '../../../utils/notifications';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import NoDataFound from '../../../components/common/NoDataFound';

const Payroll = () => {
  const { payrollQuery } = usePayroll();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payrolls, isLoading, isError } = payrollQuery;

  console.log("Data: " + payrolls);

  return (
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Payroll" 
        subtitle="Handle employee compensation and payroll records."
        titleIcon={<Wallet size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all shrink-0">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
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
                className="w-full pl-10 pr-4 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                // onClick={() => handleAddNewClick()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 !rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 shrink-0 text-xs"
              >
                <Plus size={16} /> Add Corrections
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-300 uppercase tracking-wider text-[10px]">
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 text-emerald-500 bg-slate-700 text-end border-b border-emerald-100">Salary</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 text-emerald-500 bg-slate-700 text-end border-b border-emerald-100">OverTime</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 text-rose-500 bg-slate-700 text-end border-b border-rose-100">Withholding Tax</th>
                  <th style={{ width: '17%' }} className="px-4 py-3 sticky top-0 text-rose-500 bg-slate-700 text-end border-b border-rose-100">Statutory (S/P/PI)</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 text-rose-500 bg-slate-700 text-end border-b border-rose-100">Absences</th>
                  <th style={{ width: '10%' }} className="px-4 py-3 sticky top-0 text-indigo-500 bg-slate-700 text-end border-b border-indigo-100">Net Pay</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">CutOff</th>
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Status</th> 
                  <th style={{ width: '9%' }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Action</th>
                  
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <TableSkeleton rows={4} columns={9} />
                ) : payrolls?.num > 0 ? (
                  payrolls?.formattedPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-slate-50/80 transition-all group">
                      
                      <td className="px-4 py-2 whitespace-nowrap border-r border-slate-50">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-xs">
                            {getInitials(payroll.firstName, payroll.lastName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-[11px] truncate">
                              {payroll.firstName} {payroll.lastName}
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                              {payroll.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2 text-right font-mono">
                        <span className="text-[11px] font-bold text-slate-700">{payroll.earnings.basic.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </td>

                      <td className="px-4 py-2 text-right bg-emerald-50/10 font-mono">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-emerald-600">+{payroll.earnings.overtime.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">ND: {payroll.earnings.nightDiff}</span>
                        </div>
                      </td>

                      {/* HIWALAY NA TAX */}
                      <td className="px-4 py-2 text-right bg-rose-50/20 font-mono">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-rose-600">-{payroll.deductions.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter italic">W. Tax</span>
                        </div>
                      </td>

                      {/* KUMPLETO NA STATUTORY (SSS, PH, PI) */}
                      <td className="px-4 py-2 text-right bg-rose-50/5 border-x border-rose-50/30 font-mono">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-rose-600">
                            -{(payroll.deductions.sss + payroll.deductions.philhealth + payroll.deductions.pagibig).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] font-black text-rose-400 uppercase tracking-tighter mt-0.5">
                            S:{payroll.deductions.sss.toFixed(0)} P:{payroll.deductions.philhealth.toFixed(0)} PI:{payroll.deductions.pagibig.toFixed(0)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2 text-right bg-rose-50/10 font-mono">
                        <span className="text-[11px] font-bold text-rose-600">
                          -{(payroll.deductions.absent + payroll.deductions.late).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-right bg-indigo-50 font-mono">
                        <span className="text-[13px] font-black text-indigo-700 tracking-tighter">
                          ₱{payroll.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1 py-1">
                          {/* Calendar Icon Block */}
                          <div className={`flex flex-col items-center justify-center w-7 h-7 rounded border ${
                            getDayNumber(payroll.period.end) <= 15 
                              ? "bg-blue-50 border-blue-100" 
                              : "bg-emerald-50 border-emerald-100"
                          }`}>
                            <span className={`text-[7px] font-bold uppercase leading-none ${
                              getDayNumber(payroll.period.end) <= 15 ? "text-blue-600" : "text-emerald-600"
                            }`}>
                              {getMonthShort(payroll.period.end)}
                            </span>
                            <span className={`text-[10px] font-extrabold leading-none mt-0.5 ${
                              getDayNumber(payroll.period.end) <= 15 ? "text-blue-800" : "text-emerald-800"
                            }`}>
                              {getDayNumber(payroll.period.end)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-sm ${
                          payroll.status === 'PAID' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <button className="text-slate-300 hover:text-indigo-600 transition-all p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm">
                          <Eye size={14} strokeWidth={3} />
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-24">
                      <NoDataFound
                        messageIcon={<Wallet size={48} className="opacity-20 text-indigo-500" />} 
                        message='No record found.'
                        subMessage='Everything is up to date!'
                      /> 
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>
              {/* Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees */}
            </span>
            <div className="flex gap-2 items-center">
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors">Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Payroll;