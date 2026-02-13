
import React, { useState, useMemo } from 'react';
import { AppState, EstablishmentMaster, YearlyEstablishment } from '../types';
import { Button } from './Button';
import { Building, Plus, Search, ExternalLink, MapPin, User, Phone } from 'lucide-react';

interface EstablishmentListProps {
  state: AppState;
  onAddEstablishment: (e: EstablishmentMaster) => void;
  onLinkToYear: (ye: YearlyEstablishment) => void;
}

export const EstablishmentList: React.FC<EstablishmentListProps> = ({ state, onAddEstablishment, onLinkToYear }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<EstablishmentMaster | null>(null);

  const filteredMasters = useMemo(() => {
    return state.establishments.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.establishments, searchTerm]);

  const yearlyLinked = useMemo(() => {
    const linked = state.yearlyEstablishments.filter(ye => ye.yearId === state.currentYearId);
    const map: Record<string, YearlyEstablishment> = {};
    linked.forEach(l => map[l.masterId] = l);
    return map;
  }, [state.yearlyEstablishments, state.currentYearId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Establishments Master</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Establishment
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name or registration number..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMasters.map((estab) => {
          const isLinked = !!yearlyLinked[estab.id];
          const yearlyData = yearlyLinked[estab.id];

          return (
            <div key={estab.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Building className="w-6 h-6" />
                  </div>
                  {isLinked ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase">
                      Active this Year
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500 uppercase">
                      Inactive this Year
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1">{estab.name}</h3>
                <p className="text-xs text-slate-500 mb-4">Reg: {estab.registrationNumber} • {estab.type}</p>

                {isLinked && yearlyData ? (
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{yearlyData.siteAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{yearlyData.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{yearlyData.ownerMobile}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                    No active site record for current year
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit Master
                </Button>
                {!isLinked ? (
                  <Button size="sm" className="w-full" onClick={() => setShowLinkModal(estab)}>
                    Activate Year
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="w-full">
                    View Workers
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Register New Establishment</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onAddEstablishment({
                  id: Math.random().toString(36).substr(2, 9),
                  name: formData.get('name') as string,
                  registrationNumber: formData.get('regNo') as string,
                  type: formData.get('type') as string,
                });
                setShowAddModal(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Establishment Name</label>
                  <input name="name" required className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Ranga Reddy Bricks" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Registration Number</label>
                  <input name="regNo" required className="w-full border rounded-lg px-3 py-2" placeholder="Govt Reg No." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select name="type" className="w-full border rounded-lg px-3 py-2">
                    <option>Brick Kiln</option>
                    <option>Construction Site</option>
                    <option>Pharma Unit</option>
                    <option>Rice Mill</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Create Master</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Activate for Cycle</h2>
              <p className="text-sm text-slate-500 mb-6">Linking {showLinkModal.name} to year cycle.</p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onLinkToYear({
                  id: Math.random().toString(36).substr(2, 9),
                  yearId: state.currentYearId,
                  masterId: showLinkModal.id,
                  siteAddress: formData.get('siteAddress') as string,
                  ownerName: formData.get('ownerName') as string,
                  ownerMobile: formData.get('ownerMobile') as string,
                });
                setShowLinkModal(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Current Site Address</label>
                  <textarea name="siteAddress" required className="w-full border rounded-lg px-3 py-2 h-24" placeholder="Full address of the work site for this year" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Site In-charge</label>
                    <input name="ownerName" required className="w-full border rounded-lg px-3 py-2" placeholder="Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact No</label>
                    <input name="ownerMobile" required className="w-full border rounded-lg px-3 py-2" placeholder="10-digit mobile" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowLinkModal(null)}>Cancel</Button>
                  <Button type="submit" className="flex-1">Activate Profile</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
