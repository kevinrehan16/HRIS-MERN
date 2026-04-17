import { useState } from 'react';
import { UserPlus, Users, Search, MoreVertical, Search as SearchIcon, Download, Loader2, Edit3, Trash2, Building2 } from 'lucide-react';

import { useEmployees } from '../../../hooks/useEmployees';
import { useLookups } from '../../../hooks/useLookups';

import { notificationService } from '../../../utils/notifications';
import { getInitials } from '../../../utils/formatters';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';

import AddEmployeeModal from '../../../components/modals/AddEmployeeModal';
import { useDebounce } from '../../../hooks/useDebounce';


const Employees = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { departments } = useLookups();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const limit = 10;
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { employeesQuery, createEmployee, updateEmployee, deleteEmployee } = useEmployees(page, limit, debouncedSearch, selectedDept);
  
  const { data: employeesData = [], isLoading, isError, isFetching } = employeesQuery;
  const employees = employeesData?.data || [];
  const pagination = employeesData?.pagination;

  const handleDelete = async (id: string, name: string) => {
    const result = await notificationService.confirm(
      'Are you sure?',
      `You are about to delete ${name}. This cannot be undone.`
    );

    if (result.isConfirmed) {
      deleteEmployee.mutate(id, {
        onSuccess: () => {
          notificationService.toast('Employee deleted successfully');
        },
        onError: () => {
          notificationService.toast('Failed to delete employee', 'error');
        }
      });
    }
  };

  const handleEditClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setSelectedEmployee(null); 
    setIsModalOpen(true);
  };

  return (
    // FIX 1: H-SCREEN para saktong fit sa view at hindi aabot sa footer
    <div className="bg-[#f2f5f9] h-screen flex flex-col overflow-hidden">
      <PageHeader 
        title="Employees" 
        subtitle="Centralized directory for all staff records."
        titleIcon={<Users size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all shrink-0">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      {/* FIX 2: PB-1 para saktong space sa footer, min-h-0 para gumana ang flex-1 overflow */}
      <div className="px-6 pb-1 flex-1 flex flex-col min-h-0 relative">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 flex-1 flex flex-col overflow-hidden max-h-full">
          
          {/* TOOLBAR - Compacted Padding & Font */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30 shrink-0">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                className="px-4 py-1 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Departments</option>
                {departments?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <button
                onClick={() => handleAddNewClick()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 !rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95 shrink-0 text-xs"
              >
                <UserPlus size={16} /> Add Employee
              </button>
            </div>
          </div>

          {/* TABLE AREA - Compacted Rows */}
          <div className="flex-1 relative overflow-auto custom-scrollbar border-b border-slate-100 min-h-0 bg-white">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-300 uppercase tracking-wider text-[10px]">
                  <th style={{ width: "25%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: "15%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Position</th>
                  <th style={{ width: "20%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Department</th>
                  <th style={{ width: "15%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Role</th>
                  <th style={{ width: "15%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Status</th>
                  <th style={{ width: "10%" }} className="px-4 py-3 sticky top-0 bg-slate-700 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading || isFetching ? (
                  <TableSkeleton rows={limit || 5} columns={6} />
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-500">
                        <span className="font-black uppercase tracking-widest text-[10px]">Error Loading Data</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp: any, index: number) => (
                    <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group even:bg-slate-50/20">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-xs">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate text-xs">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              {emp.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600 font-medium italic text-center">
                        {emp.position?.title || "No Position"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center gap-2 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full w-fit border border-slate-200 mx-auto">
                          <Building2 size={10} className="text-slate-400" />
                          <span className="text-[10px] font-bold">
                            {emp.department?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-500 font-medium text-center">
                        {emp.role}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          emp.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      <td className="px-4 py-2 text-center">
                        <div className="relative inline-block">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === emp.id ? null : emp.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              openMenuId === emp.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuId === emp.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              
                              {/* POPUP MENU - w-28 is the 'sweet spot' for 11px font */}
                              <div className={`absolute right-0 w-28 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 py-1 animate-in fade-in zoom-in-95 duration-100
                                ${index >= employees.length - 3 ? 'bottom-[115%]' : 'top-[115%]'}
                              `}>
                                {/* ARROW SHAPE */}
                                <div className={`absolute right-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent
                                  ${index >= employees.length - 3 
                                    ? 'top-full border-t-[6px] border-t-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.05)]' 
                                    : 'bottom-full border-b-[6px] border-b-white'}`} 
                                />

                                {/* EDIT BUTTON */}
                                <button 
                                  onClick={() => { handleEditClick(emp); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Edit3 size={14} className="text-blue-500" /> Edit
                                </button>
                                
                                {/* DELETE BUTTON - Icon returned to size 14 for visibility */}
                                <button 
                                  onClick={() => { handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - Restored Original Structure with Smaller Padding/Font */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
            <span>
              Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees
            </span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-2.5 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Prev</button>
              <div className="flex gap-1">
                {(() => {
                  const totalPages = pagination?.totalPages || 0;
                  const current = page;
                  const pages = [];
                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= current - 1 && i <= current + 1)) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "...") {
                      pages.push("...");
                    }
                  }
                  return pages.map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
                      disabled={pageNum === "..."}
                      className={`px-2.5 py-1 border rounded-md transition-all ${
                        page === pageNum 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : pageNum === "..." 
                            ? "bg-transparent border-transparent text-slate-400 cursor-default"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
                disabled={page === pagination?.totalPages || isLoading}
                className="px-2.5 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }} 
        createMutation={createEmployee}
        updateMutation={updateEmployee}
        initialData={selectedEmployee}
        onSuccessAction={() => employeesQuery.refetch()} 
      />
    </div>
  );
};

export default Employees;