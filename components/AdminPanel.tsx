import React, { useState, useMemo } from 'react';
import { User } from '../types';
import { DataImporter } from './DataImporter';

interface AdminPanelProps {
  users: User[];
  onToggleUser: (id: string) => void;
  onClose: () => void;
  onDataImported: (users: User[]) => void;
  onResetData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  users, 
  onToggleUser, 
  onClose,
  onDataImported,
  onResetData
}) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const litCount = users.filter(u => u.isLit).length;

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
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">Batch Tools</p>
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