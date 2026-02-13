
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, Building2, UserPlus, IndianRupee, MapPin } from 'lucide-react';

interface DashboardProps {
  state: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const activeYear = useMemo(() => 
    state.years.find(y => y.id === state.currentYearId), 
    [state.years, state.currentYearId]
  );

  const stats = useMemo(() => {
    const yearWorkers = state.workers.filter(w => w.yearId === state.currentYearId);
    const yearEstabs = state.yearlyEstablishments.filter(e => e.yearId === state.currentYearId);
    const yearAdvances = state.advances.filter(a => 
      yearWorkers.some(w => w.id === a.workerRegId)
    );
    const yearFamily = state.familyMembers.filter(f => 
      yearWorkers.some(w => w.id === f.workerRegId)
    );

    return {
      totalWorkers: yearWorkers.length,
      totalEstablishments: yearEstabs.length,
      totalAdvances: yearAdvances.reduce((sum, a) => sum + a.amount, 0),
      totalFamily: yearFamily.length
    };
  }, [state, state.currentYearId]);

  const stateData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.workers
      .filter(w => w.yearId === state.currentYearId)
      .forEach(w => {
        counts[w.nativeState] = (counts[w.nativeState] || 0) + 1;
      });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.workers, state.currentYearId]);

  const genderData = useMemo(() => {
    const counts: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
    state.workers
      .filter(w => w.yearId === state.currentYearId)
      .forEach(w => {
        counts[w.gender] = (counts[w.gender] || 0) + 1;
      });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [state.workers, state.currentYearId]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview for Active Cycle: <span className="font-semibold text-indigo-600">{activeYear?.label}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Registered Workers" 
          value={stats.totalWorkers} 
          icon={<Users className="w-6 h-6" />}
          color="bg-indigo-500"
        />
        <StatCard 
          label="Active Establishments" 
          value={stats.totalEstablishments} 
          icon={<Building2 className="w-6 h-6" />}
          color="bg-emerald-500"
        />
        <StatCard 
          label="Total Advances Paid" 
          value={`₹${stats.totalAdvances.toLocaleString()}`} 
          icon={<IndianRupee className="w-6 h-6" />}
          color="bg-amber-500"
        />
        <StatCard 
          label="Family Members on Site" 
          value={stats.totalFamily} 
          icon={<UserPlus className="w-6 h-6" />}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Migrant Workers by Native State
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Gender Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`${color} p-3 rounded-lg text-white shadow-md`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);
