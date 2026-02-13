
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, WorkYear, EstablishmentMaster, YearlyEstablishment, WorkerRegistration, YearStatus, FamilyMember } from './types';
import { loadState, saveState } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { EstablishmentList } from './components/EstablishmentList';
import { WorkerRegistry } from './components/WorkerRegistry';
import { Settings } from './components/Settings';
import { Button } from './components/Button';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Settings as SettingsIcon, 
  LogOut,
  CalendarDays,
  Menu,
  X,
  Download,
  CloudUpload,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'establishments' | 'workers' | 'reports' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeYear = useMemo(() => 
    state.years.find(y => y.id === state.currentYearId) || state.years[0],
    [state.years, state.currentYearId]
  );

  const handleUpdateConfig = (config: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...config }));
  };

  const handleAddEstablishment = (master: EstablishmentMaster) => {
    setState(prev => ({ ...prev, establishments: [...prev.establishments, master] }));
  };

  const handleLinkToYear = (ye: YearlyEstablishment) => {
    setState(prev => ({ ...prev, yearlyEstablishments: [...prev.yearlyEstablishments, ye] }));
  };

  const handleRegisterWorker = (w: WorkerRegistration) => {
    setState(prev => ({ ...prev, workers: [...prev.workers, w] }));
  };

  const handleUpdateWorker = (updatedWorker: WorkerRegistration) => {
    setState(prev => ({
      ...prev,
      workers: prev.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w)
    }));
  };

  const handleAddFamilyMember = (member: FamilyMember) => {
    setState(prev => ({ ...prev, familyMembers: [...prev.familyMembers, member] }));
  };

  const handleDeleteFamilyMember = (memberId: string) => {
    setState(prev => ({ ...prev, familyMembers: prev.familyMembers.filter(f => f.id !== memberId) }));
  };

  const handleSwitchYear = (id: string) => {
    setState(prev => ({ ...prev, currentYearId: id }));
  };

  const handleAddYear = (year: WorkYear) => {
    setState(prev => ({ ...prev, years: [...prev.years, year], currentYearId: year.id }));
  };

  const handleCloseYear = (id: string) => {
    if (window.confirm("Are you sure you want to close this cycle? It will become read-only for governance compliance.")) {
      setState(prev => ({
        ...prev,
        years: prev.years.map(y => y.id === id ? { ...y, status: YearStatus.CLOSED } : y)
      }));
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const workerData = state.workers.map(w => {
      const year = state.years.find(y => y.id === w.yearId)?.label;
      const ye = state.yearlyEstablishments.find(ye => ye.id === w.establishmentId);
      const master = state.establishments.find(m => m.id === ye?.masterId);
      return {
        'Work Year': year,
        'Worker Name': w.name,
        'Father Name': w.fatherName,
        'Age': w.age,
        'Gender': w.gender,
        'Caste': w.caste,
        'Aadhaar No': w.aadhaarNumber,
        'Mobile': w.mobile,
        'Native State': w.nativeState,
        'Nature of Work': w.natureOfWork,
        'Establishment': master?.name,
        'Site Address': ye?.siteAddress,
        'Joining Date': w.joiningDate,
        'Expected Exit': w.expectedEndDate,
        'Family On Site': w.hasFamilyAtSite ? 'Yes' : 'No',
        'Officer Notes': w.notes || ''
      };
    });
    const wsWorkers = XLSX.utils.json_to_sheet(workerData);
    XLSX.utils.book_append_sheet(wb, wsWorkers, "Workers_Report");

    const estabData = state.yearlyEstablishments.map(ye => {
      const year = state.years.find(y => y.id === ye.yearId)?.label;
      const master = state.establishments.find(m => m.id === ye.masterId);
      return {
        'Work Year': year,
        'Establishment Name': master?.name,
        'Govt Reg No': master?.registrationNumber,
        'Category': master?.type,
        'Site Address': ye.siteAddress,
        'Owner/In-Charge': ye.ownerName,
        'Contact Number': ye.ownerMobile
      };
    });
    const wsEstabs = XLSX.utils.json_to_sheet(estabData);
    XLSX.utils.book_append_sheet(wb, wsEstabs, "Establishments_Active");

    XLSX.writeFile(wb, `Pravasi_Registry_RR_${activeYear.label}_District_Report.xlsx`);
  };

  const handleSyncToSheets = async () => {
    if (!state.googleSheetUrl) {
      alert("No Google Sheets bridge URL found. Go to 'Year Master' > 'Integrations' to set it up.");
      setActiveTab('settings');
      return;
    }

    setSyncStatus('syncing');
    try {
      await fetch(state.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          data: {
            workers: state.workers,
            establishments: state.establishments,
            yearlyEstablishments: state.yearlyEstablishments,
            familyMembers: state.familyMembers,
            years: state.years
          }
        })
      });

      setSyncStatus('success');
      setState(prev => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 translate-x-2' 
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-200">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none text-slate-900 tracking-tighter">Pravasi Registry</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mt-1">RR District Office</p>
            </div>
          </div>

          <nav className="space-y-3 flex-grow">
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="establishments" label="Establishments" icon={Building2} />
            <NavItem id="workers" label="Worker Registry" icon={Users} />
            <NavItem id="reports" label="Export & Sync" icon={FileText} />
            <NavItem id="settings" label="Year Master" icon={SettingsIcon} />
          </nav>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <div className="bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-100 shadow-inner">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Authenticated</p>
              <p className="text-sm font-black text-slate-800 tracking-tight">District Labor Officer</p>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-black text-sm uppercase tracking-widest">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-3 text-slate-600 hover:bg-slate-50 rounded-2xl" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">{activeYear.label} Cycle</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${activeYear.status === YearStatus.ACTIVE ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${activeYear.status === YearStatus.ACTIVE ? 'text-emerald-700' : 'text-slate-500'}`}>
                 {activeYear.status} Mode
               </span>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-white shadow-xl overflow-hidden ring-2 ring-indigo-50">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=DLO&backgroundColor=6366f1`} alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="p-8 overflow-auto flex-grow bg-slate-50/50">
          {activeTab === 'dashboard' && <Dashboard state={state} />}
          {activeTab === 'establishments' && (
            <EstablishmentList 
              state={state} 
              onAddEstablishment={handleAddEstablishment} 
              onLinkToYear={handleLinkToYear} 
            />
          )}
          {activeTab === 'workers' && (
            <WorkerRegistry 
              state={state} 
              onRegisterWorker={handleRegisterWorker}
              onUpdateWorker={handleUpdateWorker}
              onAddFamilyMember={handleAddFamilyMember}
              onDeleteFamilyMember={handleDeleteFamilyMember}
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              state={state} 
              onAddYear={handleAddYear} 
              onSwitchYear={handleSwitchYear} 
              onCloseYear={handleCloseYear}
              onUpdateConfig={handleUpdateConfig}
            />
          )}
          {activeTab === 'reports' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Governance Archive</h2>
                    <p className="text-slate-500 mt-2 font-medium">Generate official district reports and secure cloud backups.</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      Last District Sync
                    </div>
                    <div className="text-xs font-black text-slate-700">
                      {state.lastSyncedAt ? new Date(state.lastSyncedAt).toLocaleString() : 'Archive Never Synced'}
                    </div>
                  </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-sm">
                        <Download className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">District Excel Archive</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Generate a certified Excel workbook containing the complete district worker registry for the current cycle including demographic profiles.</p>
                    <Button onClick={handleExportExcel} className="w-full py-4 shadow-2xl shadow-indigo-100 rounded-2xl font-black uppercase tracking-widest text-[10px]" variant="primary">
                      Download District Report
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl shadow-sm">
                        <CloudUpload className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Secure Sheet Backup</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Perform an end-of-day synchronization to your connected Google Sheet. This ensures redundancy and allows real-time viewing for state-level auditors.</p>
                    <Button 
                      onClick={handleSyncToSheets} 
                      className={`w-full py-4 transition-all duration-500 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl ${
                        syncStatus === 'success' ? 'bg-emerald-500 shadow-emerald-100' : 
                        syncStatus === 'error' ? 'bg-rose-500 shadow-rose-100' : 'bg-emerald-600 shadow-emerald-100'
                      }`}
                      disabled={syncStatus === 'syncing'}
                    >
                      {syncStatus === 'idle' && <><CloudUpload className="w-4 h-4 mr-2" /> Sync Local Data</>}
                      {syncStatus === 'syncing' && <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Transferring...</>}
                      {syncStatus === 'success' && <><CheckCircle className="w-4 h-4 mr-2" /> Archive Secured</>}
                      {syncStatus === 'error' && <><AlertCircle className="w-4 h-4 mr-2" /> Sync Failure</>}
                    </Button>
                  </div>
                </div>

                <div className="p-10 border-t border-slate-100 bg-slate-50/40">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">District Statistics: {activeYear.label}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <StatBox label="Workers" value={state.workers.filter(w => w.yearId === state.currentYearId).length} />
                    <StatBox label="Family" value={state.familyMembers.length} />
                    <StatBox label="Sites" value={state.yearlyEstablishments.filter(ye => ye.yearId === state.currentYearId).length} />
                    <StatBox label="Master" value={state.establishments.length} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: number }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl text-center hover:scale-105 transition-transform duration-300 ring-4 ring-slate-50">
    <p className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">{value}</p>
    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">{label}</p>
  </div>
);

export default App;
