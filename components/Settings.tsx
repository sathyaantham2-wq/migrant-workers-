
import React, { useState } from 'react';
import { AppState, WorkYear, YearStatus } from '../types';
import { Button } from './Button';
import { Calendar, Plus, CheckCircle2, Lock, Link as LinkIcon, Info, Save, Copy, Check } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onAddYear: (y: WorkYear) => void;
  onSwitchYear: (id: string) => void;
  onCloseYear: (id: string) => void;
  onUpdateConfig: (config: Partial<AppState>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, onAddYear, onSwitchYear, onCloseYear, onUpdateConfig }) => {
  const [sheetUrl, setSheetUrl] = useState(state.googleSheetUrl || '');
  const [copied, setCopied] = useState(false);

  const handleSaveIntegration = () => {
    onUpdateConfig({ googleSheetUrl: sheetUrl });
    alert('Integration settings updated! You can now sync data from the Reports tab.');
  };

  const appsScriptCode = `function doPost(e) {
  var payload = JSON.parse(e.postData.contents);
  var data = payload.data;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Update Workers Sheet
  var workerSheet = ss.getSheetByName("Workers") || ss.insertSheet("Workers");
  workerSheet.clear();
  workerSheet.appendRow([
    "ID", "Year", "Worker Name", "Father Name", "Age", "Gender", 
    "Caste", "Mobile", "Aadhaar", "State", "Work Nature", 
    "Joining", "Exit", "Family", "Notes"
  ]);
  data.workers.forEach(function(w) {
    workerSheet.appendRow([
      w.id, w.yearId, w.name, w.fatherName, w.age, w.gender, 
      w.caste, w.mobile, w.aadhaarNumber, w.nativeState, w.natureOfWork, 
      w.joiningDate, w.expectedEndDate, w.hasFamilyAtSite, w.notes || ""
    ]);
  });

  // Update Establishments Sheet
  var estabSheet = ss.getSheetByName("Establishments") || ss.insertSheet("Establishments");
  estabSheet.clear();
  estabSheet.appendRow(["ID", "Name", "Reg No", "Type"]);
  data.establishments.forEach(function(e) {
    estabSheet.appendRow([e.id, e.name, e.registrationNumber, e.type]);
  });

  return ContentService.createTextOutput("Sync Successful").setMimeType(ContentService.MimeType.TEXT);
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Work Year Cycle Master</h2>
            <p className="text-sm text-slate-500 font-medium">Manage yearly registration cycles and governance periods.</p>
          </div>
          <Button onClick={() => {
            const label = prompt('Enter Year Label (e.g. 2026-27):');
            if (label) {
              onAddYear({
                id: Math.random().toString(36).substr(2, 9),
                label,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                status: YearStatus.ACTIVE
              });
            }
          }} className="rounded-2xl px-8 shadow-xl shadow-indigo-100">
            <Plus className="w-4 h-4 mr-2" />
            New Cycle
          </Button>
        </div>
        <div className="divide-y divide-slate-100">
          {state.years.map((year) => (
            <div key={year.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-[1.25rem] ${year.status === YearStatus.ACTIVE ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">{year.label}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cycle duration: {new Date(year.startDate).toLocaleDateString()} — {new Date(year.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {year.id === state.currentYearId && (
                  <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
                {year.status === YearStatus.CLOSED ? (
                  <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    <Lock className="w-3 h-3" /> Archive
                  </span>
                ) : (
                  <div className="flex gap-3">
                    {year.id !== state.currentYearId && (
                      <Button variant="secondary" size="sm" onClick={() => onSwitchYear(year.id)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4">
                        Switch
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => onCloseYear(year.id)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-4">
                      Finalize
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-slate-100 flex items-center gap-5 bg-slate-50/50">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl shadow-sm">
            <LinkIcon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cloud Integration</h2>
            <p className="text-sm text-slate-500 font-medium">Connect your district spreadsheet for real-time compliance backups.</p>
          </div>
        </div>
        <div className="p-10 space-y-12">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Apps Script Web App Endpoint</label>
            <div className="flex gap-3">
              <input 
                type="url" 
                className="flex-grow border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-inner bg-slate-50 transition-all font-medium"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
              />
              <Button onClick={handleSaveIntegration} className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100">
                <Save className="w-4 h-4 mr-2" />
                Connect
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-500" />
                Updated Sync Bridge (Schema v2.0)
              </h4>
              <button 
                onClick={copyCode}
                className="text-[10px] font-black text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-indigo-100"
              >
                {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Snippet</>}
              </button>
            </div>
            <div className="bg-slate-900 rounded-3xl p-6 overflow-x-auto max-h-60 scrollbar-thin scrollbar-thumb-slate-700 shadow-2xl">
              <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
                {appsScriptCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
