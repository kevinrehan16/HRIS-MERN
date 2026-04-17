import React from 'react';
import { Building2, Download, SearchIcon, Plus, MoreVertical, CalendarPlus2, BriefcaseBusiness, Users } from 'lucide-react';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';

import AddDepartmentModal from '../../../components/modals/AddDepartmentModal';

import { useDepartments } from '../../../hooks/useDepartments';
import { formatID } from '../../../utils/formatters';

const Department = () => {
  const { departmentsQuery } = useDepartments();
  const {data: departments, isLoading, isError} = departmentsQuery;

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);


  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Departments" 
        subtitle="Departments overview and content summary"
        titleIcon={<Building2 size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      {/* MAIN BODY CONTAINER */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 min-h-[400px]">
          {/* TOOLBAR */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by department or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={20} /> Add Department
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="relative overflow-y-auto overflow-x-auto h-[370px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                  <th style={{  width: '25%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Department Details</th>
                  <th style={{  width: '14%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Description</th>
                  <th style={{  width: '28%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Positions</th>
                  <th style={{  width: '12%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">HeadCount</th>
                  <th style={{  width: '11%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Created At</th>
                  <th style={{  width: '10%' }} className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ?
                  (<TableSkeleton rows={4} columns={6} />)
                : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                      <div className="p-2 text-center flex flex-col items-center gap-3">
                        <div className="text-red-500 bg-red-50 p-4 rounded-full">⚠️</div>
                        <h3 className="font-bold text-slate-700">Failed to load Departments</h3>
                        <button onClick={() => departmentsQuery.refetch()} className="text-blue-600 text-sm font-bold underline">Try Again</button>
                      </div>
                    </td>
                  </tr>
                )
                : departments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-slate-500 italic">
                      No departments found
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <span className="block font-bold text-slate-700 transition-colors group-hover:text-blue-600">{department.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{formatID(department.id, "DEPT")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium italic">{department.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium max-w-[250px]">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {department.positions.slice(0, 2).map((pos) => (
                            <span 
                              key={pos.id} 
                              className="flex align-items-center justify-between gap-1 px-2 py-0.5 bg-blue-50 text-slate-600 text-[11px] font-bold rounded-md border border-blue-100 transition-all hover:bg-blue-100"
                            >
                              <BriefcaseBusiness size={12} className="text-slate-400" /> {pos.title}
                            </span>
                          ))}
                          {department.positions.length > 2 && (
                            <span className="px-2 py-0.5 bg-blue-50 text-slate-400 font-black bg-slate-100 text-[11px] font-bold rounded-md border border-blue-100 transition-all">
                              +{department.positions.length - 2} more
                            </span>
                          )}
                          {department.positions.length === 0 && (
                            <span className="text-[11px] text-slate-400 italic">
                              No positions assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-sm font-semibold text-slate-600">
                            {department._count?.employees || 0} Staff
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                          <CalendarPlus2 size={14} />{new Date(department.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )
              }
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span>
              {/* Showing {employees.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, pagination?.total || 0)} of {pagination?.total || 0} Employees */}
            </span>
            <div className="flex gap-2 items-center">
              <button 
                // onClick={() => setPage(p => Math.max(1, p - 1))}
                // disabled={page === 1 || isLoading}
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Prev</button>
              <div className="flex gap-1">
                
              </div>
              <button 
                // onClick={() => setPage(p => Math.min(pagination?.totalPages || 1, p + 1))}
                // disabled={page === pagination?.totalPages || isLoading}
                className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-100 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>
      </div>

      <AddDepartmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

    </div>
  );
};

export default Department;