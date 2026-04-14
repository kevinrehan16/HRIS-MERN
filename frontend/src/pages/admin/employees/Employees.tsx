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

  // 1. Kunin ang createEmployee mula sa hook
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
    setSelectedEmployee(null); // Siguraduhing null para "Add" mode
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Employees" 
        subtitle="Centralized directory for all staff records."
        titleIcon={<Users size={35} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      <div className="px-6 pb-10">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 p-2 min-h-[462px]">
          {/* TOOLBAR */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset page on search
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(1); // Reset page on filter
                }}
              >
                <option value="">All Departments</option>
                {departments?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <button
                onClick={() => handleAddNewClick()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <UserPlus size={20} /> Add Employee
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="relative overflow-y-auto overflow-x-auto h-[310px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr className="text-slate-400 uppercase tracking-wider text-[11px]">
                  <th style={{ width: "25%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold">Employee Information</th>
                  <th style={{ width: "15%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold">Position</th>
                  <th style={{ width: "20%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold">Department</th>
                  <th style={{ width: "15%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold">Role</th>
                  <th style={{ width: "15%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold text-center">Status</th>
                  <th style={{ width: "10%" }} className="px-4 py-4 sticky top-0 bg-slate-50 border-b border-slate-100 font-extrabold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* 1. LOADING & FETCHING STATE */}
                {isLoading || isFetching ? (
                  <TableSkeleton rows={limit || 5} columns={6} />
                ) : isError ? (
                  /* 2. ERROR STATE */
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-red-500">
                        <span className="font-black uppercase tracking-widest text-xs">Error Loading Data</span>
                        <p className="text-sm text-slate-500 font-medium">Please check your connection and try again.</p>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  /* 3. NO DATA / EMPTY STATE */
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-800 font-bold">No employees found</p>
                          <p className="text-slate-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* 4. ACTUAL DATA LISTING */
                  employees.map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-blue-50/50 transition-colors group even:bg-slate-50/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          {/* Avatar with Initials */}
                          <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm text-sm">
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          {/* Name & ID */}
                          <div className="truncate">
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                              {emp.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600 font-medium italic">
                        {emp.position?.title || "No Position"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full w-fit border border-slate-200">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-xs font-bold">
                            {emp.department?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-500 font-medium">
                        {emp.role}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          emp.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-100' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === emp.id ? null : emp.id);
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            openMenuId === emp.id ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* DROPDOWN MENU */}
                        {openMenuId === emp.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-4 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                              <button 
                                onClick={() => {
                                  handleEditClick(emp);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                <Edit3 size={16} /> Edit
                              </button>
                              <button 
                                onClick={() => {
                                  handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>
              Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees
            </span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Prev</button>
              <div className="flex gap-1">
                {(() => {
                  const totalPages = pagination?.totalPages || 0;
                  const current = page;
                  const pages = [];

                  // Logic para sa Visible Pages
                  // Kung gusto mo ng "1 2 3 4 5 ...", ipakita natin ang unang 5 pages
                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 || // Laging ipakita ang page 1
                      i === totalPages || // Laging ipakita ang last page
                      (i >= current - 1 && i <= current + 1) // Ipakita ang katabi ng current page
                    ) {
                      pages.push(i);
                    } else if (pages[pages.length - 1] !== "...") {
                      // Maglagay ng ellipsis kung may gap sa numbers
                      pages.push("...");
                    }
                  }

                  return pages.map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => typeof pageNum === 'number' && setPage(pageNum)}
                      disabled={pageNum === "..."}
                      className={`px-3 py-1 border rounded-md transition-all ${
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
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ipasa ang createEmployee at setPage action sa Modal */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
          }
        } 
        createMutation={createEmployee}
        updateMutation={updateEmployee}
        initialData={selectedEmployee}
        onSuccessAction={() => employeesQuery.refetch()} 
      />
    </div>
  );
};

export default Employees;