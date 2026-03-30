import { LayoutDashboard, Calendar } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';

const Dashboard = () => {
  return (
    <div className="bg-[#f2f5f9]">
      <PageHeader 
        title="Dashboard" 
        subtitle="Dashboard overview and content summary"
        titleIcon={<LayoutDashboard size={28} className="text-white" />}
      >
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white">
          <Calendar size={18} />
          <span className="text-sm font-medium">Mar 30, 2026 - Mar 30, 2026</span>
        </div>
      </PageHeader>

      {/* MAIN BODY CONTAINER */}
      <div className="px-6 pb-10">
        
        {/* ANG MALAKING CARD NA NAKAPATONG */}
        <div className="bg-white rounded-md shadow-xl border border-slate-200 -mt-28 p-2 min-h-[462px]">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Content goes here...</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {/* Sample Stats Inside the Card */}
             <div className="p-5 border border-slate-100 rounded-lg bg-slate-50">
                <span className="text-slate-500 text-xs font-bold uppercase">Total Staff</span>
                <p className="text-2xl font-bold">1,234</p>
             </div>
             {/* ... dagdag ka pa dito */}
          </div>

          

          {/* Dito mo na ilalagay yung mga Tables o Charts mo */}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;