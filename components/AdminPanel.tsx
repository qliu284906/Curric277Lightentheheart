import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { DataImporter } from './DataImporter';
import { processSheetData } from '../utils/csvParser';

interface AdminPanelProps {
  users: User[];
  onToggleUser: (id: string) => void;
  onClose: () => void;
  onDataImported: (users: User[]) => void;
  onResetData: () => void;
}

const SHEET_URL_KEY = 'light-the-heart-sheet-csv-url';

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, 
  onToggleUser, 
  onClose,
  onDataImported,
  onResetData
}) => {
  const [search, setSearch] = useState('');
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
      const saved = localStorage.getItem(SHEET_URL_KEY);
      if (saved) setSyncUrl(saved);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const litCount = users.filter(u => u.isLit).length;

  const handleSync = async () => {
      if (!syncUrl) return;
      setIsSyncing(true);
      setSyncStatus('idle');
      localStorage.setItem(SHEET_URL_KEY, syncUrl);

      try {
          const response = await fetch(syncUrl);
          if (!response.ok) throw new Error('Network error');
          const text = await response.text();
          const importedUsers = processSheetData(text);
          if (importedUsers.length > 0) {
              onDataImported(importedUsers);
              setSyncStatus('success');
              setTimeout(() => setSyncStatus('idle'), 3000);
          } else {
              setSyncStatus('error');
              alert("No valid data found in CSV. Check headers.");
          }
      } catch (e) {
          console.error(e);
          setSyncStatus('error');
      } finally {
          setIsSyncing(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-white/10 shadow-2xl flex flex-col"> 
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Controls</h2>
            <p className="text-xs text-blue-400 font-mono mt-1 uppercase tracking-widest">
              LIT: {litCount} / {users.length}
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-2">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Sync Section (New) */}
        <div className="p-4 bg-blue-900/20 border-b border-blue-500/20">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Sync from Google Sheet</h3>
            <div className="flex gap-2 mb-2">
                <input 
                    type="text" 
                    placeholder="Paste Published CSV Link here..." 
                    value={syncUrl}
                    onChange={e => setSyncUrl(e.target.value)}
                    className="flex-1 bg-black/30 border border-blue-500/30 rounded text-xs px-2 text-white focus:outline-none focus:border-blue-400"
                />
                <button 
                    onClick={handleSync}
                    disabled={isSyncing || !syncUrl}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sync"></i>}
                    Sync
                </button>
            </div>
            {syncStatus === 'success' && <p className="text-[10px] text-green-400"><i className="fas fa-check"></i> Data synced successfully!</p>}
            {syncStatus === 'error' && <p className="text-[10px] text-red-400"><i className="fas fa-times"></i> Failed to sync. Check link.</p>}
            <p className="text-[9px] text-white/30 mt-1">File &gt; Share &gt; Publish to web &gt; CSV</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10 bg-slate-800/30">
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                    type="text" 
                    placeholder="Find student..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredUsers.map(user => (
                <div 
                    key={user.id}
                    onClick={() => onToggleUser(user.id)}
                    className={`
                        flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border
                        ${user.isLit ? 'bg-blue-600/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-transparent hover:border-white/10'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${user.isLit ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]' : 'bg-slate-700'}`}></div>
                        <div>
                            <p className={`text-sm font-semibold ${user.isLit ? 'text-white' : 'text-slate-400'}`}>{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{user.label || 'Student'}</p>
                        </div>
                    </div>
                    
                    <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter ${user.isLit ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        {user.isLit ? 'LIT' : 'OFF'}
                    </div>
                </div>
            ))}
            
            {filteredUsers.length === 0 && (
                <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                    <i className="fas fa-user-slash text-3xl mb-3 opacity-20"></i>
                    <p className="text-sm">No students matching "{search}"</p>
                </div>
            )}
        </div>

        {/* Tools Section (Batch Import) */}
        <div className="p-6 bg-slate-950/50 border-t border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Manual Import Tools</p>
            <DataImporter 
              onDataLoaded={onDataImported}
              onReset={() => {
                  if (window.confirm("This will clear all custom data and restore defaults. Proceed?")) {
                      onResetData();
                  }
              }}
              hasData={users.length > 20}
            />
        </div>

      </div>
    </div>
  );
};