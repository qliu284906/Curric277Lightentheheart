
import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface AdminPanelProps {
  users: User[];
  onToggleUser: (id: string) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onToggleUser, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  const litCount = users.filter(u => u.isLit).length;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-white/10 shadow-2xl flex flex-col animate-shine" style={{animation: 'none'}}> 
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Teacher Controls</h2>
            <p className="text-xs text-blue-400 font-mono mt-1">
              PROGRESS: {litCount} / {users.length}
            </p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                    type="text" 
                    placeholder="Find student..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
            {filteredUsers.map(user => (
                <div 
                    key={user.id}
                    onClick={() => onToggleUser(user.id)}
                    className={`
                        flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-all
                        ${user.isLit ? 'bg-blue-900/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${user.isLit ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]' : 'bg-slate-700'}`}></div>
                        <div>
                            <p className={`font-medium ${user.isLit ? 'text-white' : 'text-slate-400'}`}>{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.label}</p>
                        </div>
                    </div>
                    
                    <button className={`text-xs px-2 py-1 rounded border ${user.isLit ? 'bg-blue-500 text-white border-blue-400' : 'text-slate-500 border-slate-700'}`}>
                        {user.isLit ? 'ON' : 'OFF'}
                    </button>
                </div>
            ))}
            
            {filteredUsers.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                    No students found.
                </div>
            )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-slate-500">
            Tap a name to toggle light status manually. Changes save automatically.
        </div>

      </div>
    </div>
  );
};
