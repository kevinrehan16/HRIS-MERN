import { useState } from 'react';
import { UserPlus, Users, Search, MoreVertical, Filter, Download, Loader2 } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import AddEmployeeModal from '../../../components/modals/AddEmployeeModal';
import { useEmployees } from '../../../hooks/useEmployees'; // Tawagin ang hook
import { getInitials } from '../../../utils/formatters';

const Employees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Gamitin ang React Query Hook
  const { employeesQuery } = useEmployees();
  const { data: employees = [], isLoading, isError } = employeesQuery;

  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Employees" 
        subtitle="Centralized directory for all staff records."
        titleIcon={<Users size={28} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      <div className="px-6 pb-10">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 p-2 min-h-[462px]">
          {/* TOOLBAR (Walang pagbabago sa UI) */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                name='search'
                type="text"
                placeholder="Search by name, ID, or position..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold transition-all">
                <Filter size={18} />
                Filters
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <UserPlus size={20} />
                Add Employee
              </button>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100 font-black text-slate-400 uppercase tracking-widest text-[12px]">
                <tr>
                  <th style={{ width: "30%" }} className="px-4 py-4">Employee Information</th>
                  <th style={{ width: "15%" }} className="px-4 py-4">Position</th>
                  <th style={{ width: "15%" }} className="px-4 py-4">Department</th>
                  <th style={{ width: "15%" }} className="px-4 py-4">Role</th>
                  <th style={{ width: "15%" }} className="px-4 py-4 text-center">Status</th>
                  <th style={{ width: "10%" }} className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
                ) : isError ? (
                  <tr><td colSpan={5} className="py-20 text-center text-red-500 font-bold">Error loading data.</td></tr>
                ) : (
                  employees.map((emp: any) => (
                     <tr key={emp.id} className="hover:bg-blue-200/50 transition-colors group even:bg-slate-200/50">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-medium shadow-md">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs font-medium text-slate-500 tracking-tight">
                              {emp.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-500 font-medium tracking-tight">
                        {emp.position?.title || <span className="text-slate-400 italic font-normal">No Position Set</span>}
                      </td>
                      <td className="px-4 py-2 text-sm font-semibold text-slate-600">
                        {emp.department?.name || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                      </td>
                      <td className="px-4 py-2 text-sm text-slate-500 font-medium tracking-tight">
                        {emp.role}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-black uppercase tracking-wider border border-green-200">
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all shadow-sm border border-transparent hover:border-slate-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* FOOTER NG CARD (Pagination Info) */}
          <div className="px-4 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>Showing 1 to 10 of 124 Employees</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 transition-colors disabled:opacity-50">Prev</button>
              <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>

      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Employees;