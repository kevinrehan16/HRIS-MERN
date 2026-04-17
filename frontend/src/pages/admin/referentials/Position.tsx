import { useState } from 'react';
import { BriefcaseBusiness, Users, MoreVertical, Download, SearchIcon, Plus, Building2, CalendarPlus2  } from 'lucide-react';

import { usePositions } from '../../../hooks/usePositions';

import AddPositionModal from '../../../components/modals/AddPositionModal';

import PageHeader from '../../../components/common/PageHeader';
import TableSkeleton from '../../../components/common/TableSkeleton';
import { formatCurrency, formatID } from '../../../utils/formatters';

const Position = () => {
  const [search, setSearch] = useState("");
  const { positionsQuery } = usePositions();
  const { data: positions, isLoading, isError } = positionsQuery;
  // console.log("Positions Data:", positions);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Positions" 
        subtitle="Centralized directory for all position records."
        titleIcon={<BriefcaseBusiness size={25} className="text-white" />}
      >
        <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all">
          <Download size={18} /> <span className="text-sm font-semibold">Export CSV</span>
        </button>
      </PageHeader>

      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 -mt-28 min-h-[400px]">
          {/* TOOLBAR */}
          <div className="p-2 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/30">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                onClick={()=>setIsModalOpen(true)}
              >
                <Plus size={20} /> Add Position
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="relative overflow-y-auto overflow-x-auto h-[370px] custom-scrollbar border-b border-slate-100">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Position Details</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Department</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Headcount</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Salary Range</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Create At</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <TableSkeleton rows={4} columns={6} />
                ) : positions?.map((pos: any) => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                          <BriefcaseBusiness size={18} />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-700 transition-colors group-hover:text-blue-600">{pos.title}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{formatID(pos.id, "POS")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full w-fit border border-slate-200">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="text-xs font-bold">
                          {/* Ginagamit natin ang 'department' relation object */}
                          {pos.department?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">
                          {pos._count?.employees || 0} Staff
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-600">
                          {/* Format as Currency (₱) */}
                          {formatCurrency(pos.minSalary || 0)} - {formatCurrency(pos.maxSalary || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Monthly Range</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <CalendarPlus2 size={14} />{new Date(pos.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                {/* {(() => {
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
                })()} */}
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
     
      <AddPositionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    
    </div>
  );
};

export default Position;