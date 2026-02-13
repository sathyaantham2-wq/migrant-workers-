
import React, { useState, useMemo } from 'react';
import { AppState, WorkerRegistration, FamilyMember } from '../types';
import { Button } from './Button';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Info, 
  UserPlus, 
  Trash2, 
  Heart, 
  X as CloseIcon, 
  Save,
  Baby,
  MessageSquare,
  CreditCard,
  User as UserIcon,
  Briefcase,
  // Fix: Added missing Building icon import for the form section
  Building
} from 'lucide-react';
import { INDIAN_STATES } from '../constants';

interface WorkerRegistryProps {
  state: AppState;
  onRegisterWorker: (w: WorkerRegistration) => void;
  onUpdateWorker: (w: WorkerRegistration) => void;
  onAddFamilyMember: (f: FamilyMember) => void;
  onDeleteFamilyMember: (id: string) => void;
}

export const WorkerRegistry: React.FC<WorkerRegistryProps> = ({ state, onRegisterWorker, onUpdateWorker, onAddFamilyMember, onDeleteFamilyMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEstab, setSelectedEstab] = useState('');
  const [detailsWorker, setDetailsWorker] = useState<WorkerRegistration | null>(null);

  const [isAddingFamily, setIsAddingFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({ name: '', relation: '', age: '', notes: '' });

  const activeYearEstablishments = useMemo(() => {
    const activeYE = state.yearlyEstablishments.filter(ye => ye.yearId === state.currentYearId);
    return activeYE.map(ye => {
      const master = state.establishments.find(e => e.id === ye.masterId);
      return { ...ye, name: master?.name || 'Unknown' };
    });
  }, [state.yearlyEstablishments, state.establishments, state.currentYearId]);

  const filteredWorkers = useMemo(() => {
    return state.workers.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.mobile.includes(searchTerm) ||
                          w.aadhaarNumber?.includes(searchTerm);
      const matchesYear = w.yearId === state.currentYearId;
      const matchesEstab = selectedEstab ? w.establishmentId === selectedEstab : true;
      return matchesSearch && matchesYear && matchesEstab;
    });
  }, [state.workers, state.currentYearId, searchTerm, selectedEstab]);

  const getWorkerFamily = (workerId: string) => {
    return state.familyMembers.filter(f => f.workerRegId === workerId);
  };

  const handleFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (detailsWorker && familyForm.name && familyForm.relation && familyForm.age !== '') {
      onAddFamilyMember({
        id: Math.random().toString(36).substr(2, 9),
        workerRegId: detailsWorker.id,
        name: familyForm.name,
        relation: familyForm.relation,
        age: parseInt(familyForm.age) || 0,
        notes: familyForm.notes
      });
      setIsAddingFamily(false);
      setFamilyForm({ name: '', relation: '', age: '', notes: '' });
    }
  };

  const handleUpdateWorkerNotes = (notes: string) => {
    if (detailsWorker) {
      const updated = { ...detailsWorker, notes };
      setDetailsWorker(updated);
      onUpdateWorker(updated);
    }
  };

  const confirmDeleteFamily = (memberId: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the registry?`)) {
      onDeleteFamilyMember(memberId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Registry</h1>
        <Button onClick={() => setShowAddModal(true)} disabled={activeYearEstablishments.length === 0} className="shadow-lg shadow-indigo-100">
          <Plus className="w-4 h-4 mr-2" />
          Register New Worker
        </Button>
      </div>

      {activeYearEstablishments.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 animate-pulse">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Please activate at least one establishment for the current year cycle before registering workers.</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by worker name, mobile or Aadhaar..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select 
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white font-medium"
            value={selectedEstab}
            onChange={(e) => setSelectedEstab(e.target.value)}
          >
            <option value="">All Establishments</option>
            {activeYearEstablishments.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Worker / Father Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile & Aadhaar</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nature of Work</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Establishment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkers.length > 0 ? filteredWorkers.map((worker) => {
                const estab = activeYearEstablishments.find(e => e.id === worker.establishmentId);
                return (
                  <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{worker.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">S/o: {worker.fatherName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${worker.gender === 'Female' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            {worker.gender}, {worker.age}y
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{worker.caste}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                          <CreditCard className="w-3 h-3 text-slate-400" /> Aadhaar: {worker.aadhaarNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{worker.natureOfWork}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{worker.nativeState}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{estab?.name || 'N/A'}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3" /> {worker.mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDetailsWorker(worker)} className="hover:bg-indigo-50 hover:text-indigo-600 rounded-xl">
                        <ChevronRight className="w-4 h-4 mr-1" />
                        Profile
                      </Button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 bg-white">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-16 h-16 opacity-10" />
                      <p className="font-bold tracking-tight text-slate-500">No worker records found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Worker Registration</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">District Registry • {state.years.find(y => y.id === state.currentYearId)?.label}</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2.5 hover:bg-slate-50 rounded-xl">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onRegisterWorker({
                id: Math.random().toString(36).substr(2, 9),
                yearId: state.currentYearId,
                establishmentId: formData.get('estabId') as string,
                name: formData.get('name') as string,
                fatherName: formData.get('fatherName') as string,
                age: parseInt(formData.get('age') as string),
                gender: formData.get('gender') as 'Male' | 'Female' | 'Other',
                caste: formData.get('caste') as string,
                mobile: formData.get('mobile') as string,
                aadhaarNumber: formData.get('aadhaar') as string,
                nativeState: formData.get('state') as string,
                natureOfWork: formData.get('natureOfWork') as string,
                joiningDate: formData.get('joiningDate') as string,
                expectedEndDate: formData.get('endDate') as string,
                hasFamilyAtSite: formData.get('hasFamily') === 'on',
                notes: formData.get('notes') as string
              });
              setShowAddModal(false);
            }} className="overflow-auto flex-grow p-8 space-y-8">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Building className="w-5 h-5" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Work Location Info</h3>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Establishment / Work Site</label>
                  <select name="estabId" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all bg-slate-50/50">
                    <option value="">Select Work Site</option>
                    {activeYearEstablishments.map(e => (
                      <option key={e.id} value={e.id}>{e.name} — {e.siteAddress}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <UserIcon className="w-5 h-5" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Personal Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Worker Full Name</label>
                    <input name="name" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="As per Aadhaar" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Father's Name</label>
                    <input name="fatherName" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="Full name" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Age</label>
                    <input name="age" type="number" required min="18" max="75" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="Years" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Gender</label>
                    <select name="gender" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all bg-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Caste / Category</label>
                    <input name="caste" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="e.g. SC, ST, OBC, Gen" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                    <input name="mobile" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="10 digits" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Aadhaar Card Number</label>
                    <input name="aadhaar" required pattern="\d{12}" title="12 digit Aadhaar number" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="0000 0000 0000" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Briefcase className="w-5 h-5" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Employment Info</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Native State</label>
                    <select name="state" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all">
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nature of Work</label>
                    <input name="natureOfWork" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="e.g. Mason, Helper, Loading" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Joining Date</label>
                    <input name="joiningDate" type="date" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Expected End Date</label>
                    <input name="endDate" type="date" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-indigo-600">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Remarks & Family</h3>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Officer Remarks</label>
                  <textarea name="notes" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all" placeholder="Any additional group family remarks..."></textarea>
                </div>
                <div className="col-span-2 flex items-center gap-3 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-inner">
                  <input type="checkbox" name="hasFamily" id="hasFamily" className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <label htmlFor="hasFamily" className="text-sm font-bold text-indigo-900 cursor-pointer">Family members are staying at the work site</label>
                </div>
              </div>
            </form>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-4">
              <Button type="button" variant="secondary" className="flex-1 py-3.5 rounded-2xl font-bold" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => (document.querySelector('form') as HTMLFormElement).requestSubmit()} className="flex-1 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200">Finalize Registration</Button>
            </div>
          </div>
        </div>
      )}

      {/* Details & Family Management Modal */}
      {detailsWorker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-5">
                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{detailsWorker.name}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Aadhaar: {detailsWorker.aadhaarNumber}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Cycle: {state.years.find(y => y.id === state.currentYearId)?.label}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setDetailsWorker(null); setIsAddingFamily(false); }} 
                className="text-slate-400 hover:text-rose-500 transition-all p-3 rounded-2xl hover:bg-rose-50 border border-slate-100"
              >
                <CloseIcon className="w-7 h-7" />
              </button>
            </div>

            <div className="overflow-auto flex-grow p-8 space-y-8 bg-slate-50/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <DetailItem label="Father's Name" value={detailsWorker.fatherName} icon={<UserIcon className="w-3.5 h-3.5 text-indigo-500" />} />
                    <DetailItem label="Age & Gender" value={`${detailsWorker.gender}, ${detailsWorker.age}y`} icon={<UserIcon className="w-3.5 h-3.5 text-indigo-500" />} />
                    <DetailItem label="Caste / Category" value={detailsWorker.caste} icon={<UserIcon className="w-3.5 h-3.5 text-indigo-500" />} />
                    <DetailItem label="Native State" value={detailsWorker.nativeState} icon={<MapPin className="w-3.5 h-3.5 text-indigo-500" />} />
                    <DetailItem label="Mobile" value={detailsWorker.mobile} icon={<Phone className="w-3.5 h-3.5 text-indigo-500" />} />
                    <DetailItem label="Work Nature" value={detailsWorker.natureOfWork} icon={<Briefcase className="w-3.5 h-3.5 text-indigo-500" />} />
                  </div>
                  
                  <div className="pt-8 border-t border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                      Registry Remarks
                    </label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner bg-slate-50/50"
                      placeholder="Add registry observations..."
                      value={detailsWorker.notes || ''}
                      onChange={(e) => handleUpdateWorkerNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Family Summary Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${detailsWorker.hasFamilyAtSite ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-300'}`}>
                    <Heart className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Family Info</h3>
                    <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">
                      {detailsWorker.hasFamilyAtSite ? `${getWorkerFamily(detailsWorker.id).length} Members On-Site` : 'No Family Registered'}
                    </p>
                  </div>
                  {detailsWorker.hasFamilyAtSite && (
                    <Button size="sm" onClick={() => setIsAddingFamily(true)} className="rounded-xl w-full py-3">
                      Add Family Member
                    </Button>
                  )}
                </div>
              </div>

              {/* Extended Family List */}
              {detailsWorker.hasFamilyAtSite && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <UserPlus className="w-6 h-6 text-indigo-600" />
                      Family Registry
                    </h3>
                  </div>

                  {isAddingFamily && (
                    <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-3xl shadow-inner mb-10 animate-in fade-in slide-in-from-top-6">
                      <form onSubmit={handleFamilySubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FormInput label="Full Name" value={familyForm.name} onChange={v => setFamilyForm({...familyForm, name: v})} />
                          <FormSelect 
                            label="Relation" 
                            value={familyForm.relation} 
                            onChange={v => setFamilyForm({...familyForm, relation: v})}
                            options={['Spouse', 'Son', 'Daughter', 'Parent', 'Sibling', 'Other']}
                          />
                          <FormInput label="Age" type="number" value={familyForm.age} onChange={v => setFamilyForm({...familyForm, age: v})} />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                           <Button type="button" variant="ghost" className="font-bold rounded-xl" onClick={() => setIsAddingFamily(false)}>Cancel</Button>
                           <Button type="submit" className="font-bold rounded-xl px-8 shadow-lg shadow-indigo-100">Register Member</Button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getWorkerFamily(detailsWorker.id).map((member) => (
                      <div key={member.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-indigo-400 hover:bg-white transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                              {member.age < 12 ? <Baby className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-none mb-1.5">{member.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">{member.relation}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-black text-slate-500">{member.age} Years</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 p-2 transition-all"
                            onClick={() => confirmDeleteFamily(member.id, member.name)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end">
              <Button onClick={() => { setDetailsWorker(null); setIsAddingFamily(false); }} className="px-12 py-3.5 shadow-xl shadow-slate-200 rounded-2xl font-bold">Close Registry Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
      {icon} {label}
    </p>
    <p className="text-sm font-bold text-slate-900">{value}</p>
  </div>
);

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type={type}
      required
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select 
      required
      className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm bg-white font-medium"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select</option>
      {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
