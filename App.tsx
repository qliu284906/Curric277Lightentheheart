// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { HeartGrid } from './components/HeartGrid';
import { ParticleBackground } from './components/ParticleBackground';
import { Confetti } from './components/Confetti';
import { ChristmasTree } from './components/ChristmasTree';
import { SemesterJourney } from './components/SemesterJourney';
import { AdminPanel } from './components/AdminPanel';
import { processSheetData } from './utils/csvParser';
import { User, SignupSource } from './types';
import { TOTAL_CAPACITY, INITIAL_LEGACY_USERS, PENDING_STUDENTS, SEMESTER_THANK_YOU_MESSAGES, GOOGLE_APPS_SCRIPT_URL, ADMIN_PASSWORD, LIVE_CSV_URL } from './constants';

type AppStep = 'IDLE' | 'JOURNEY' | 'INPUT' | 'PROCESSING' | 'COMPLETED';

const STORAGE_KEY = 'light-the-heart-data-v1';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    let currentUsers: User[] = [...INITIAL_LEGACY_USERS, ...PENDING_STUDENTS];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedSaved = JSON.parse(saved);
          if (Array.isArray(parsedSaved) && parsedSaved.length > 0) currentUsers = parsedSaved;
        }
      } catch (e) { console.error(e); }
    }
    return currentUsers;
  });

  const [step, setStep] = useState<AppStep>('IDLE');
  const [newName, setNewName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // 智能合并数据逻辑
  const handleDataMerge = useCallback((importedUsers: User[]) => {
      setUsers(prevUsers => {
          const newUsersList = [...prevUsers];
          let changed = false;

          importedUsers.forEach(importedUser => {
              const importedNameNorm = importedUser.name.trim().toLowerCase();
              
              // 1. 尝试在现有列表中找到匹配的名字
              const existingIndex = newUsersList.findIndex(
                  u => u.name.trim().toLowerCase() === importedNameNorm
              );

              if (existingIndex !== -1) {
                  // 如果找到了，且当前未点亮，则更新为点亮
                  if (!newUsersList[existingIndex].isLit) {
                      newUsersList[existingIndex] = {
                          ...newUsersList[existingIndex],
                          isLit: true,
                          label: importedUser.label || newUsersList[existingIndex].label
                      };
                      changed = true;
                  }
              } else {
                  // 2. 如果没找到，且容量允许，则作为新用户添加
                  // 检查是否已经在本次导入中添加过 (通过 ID)
                  const alreadyAdded = newUsersList.some(u => u.id === importedUser.id);
                  
                  if (!alreadyAdded) {
                      // 关键修复：直接使用 parser 解析出的稳定 ID，不要重新生成随机 ID
                      // 这样可以防止每次 polling 时重复添加同一行数据
                      const safeUser = { ...importedUser, isLit: true };
                      newUsersList.push(safeUser);
                      changed = true;
                  }
              }
          });

          return changed ? newUsersList : prevUsers;
      });
  }, []);

  // 自动同步逻辑：如果配置了 LIVE_CSV_URL，每 10 秒拉取一次
  useEffect(() => {
      if (!LIVE_CSV_URL) return;

      const fetchData = async () => {
          try {
              const response = await fetch(LIVE_CSV_URL);
              if (response.ok) {
                  const text = await response.text();
                  const importedUsers = processSheetData(text);
                  if (importedUsers.length > 0) {
                      handleDataMerge(importedUsers);
                  }
              }
          } catch (e) {
              console.error("Auto-sync failed:", e);
          }
      };

      // 首次加载立即执行一次
      fetchData();

      // 设置定时器
      const intervalId = setInterval(fetchData, 10000); // 10秒

      return () => clearInterval(intervalId);
  }, [handleDataMerge]);

  const syncToGoogleSheet = async (user: User) => {
      if (!GOOGLE_APPS_SCRIPT_URL) return;
      try {
          await fetch(GOOGLE_APPS_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...user,
                  spreadsheetName: "Lightentheheart",
                  sheetName: "sheet1"
              })
          });
      } catch (e) { console.error("Sync failed:", e); }
  };

  const processNewUser = async (nameToProcess: string, fromJourney: boolean = false): Promise<{success: boolean, message?: string}> => {
    const inputName = nameToProcess.trim();
    if (!inputName) return { success: false, message: "Please enter a name." };

    return new Promise((resolve) => {
        setTimeout(() => {
            let updatedUsers = [...users];
            let userToSync: User | null = null;
            const normalizedInput = inputName.toLowerCase();

            const pendingIdx = updatedUsers.findIndex(u => !u.isLit && u.name.toLowerCase() === normalizedInput);
            const litIdx = updatedUsers.findIndex(u => u.isLit && u.name.toLowerCase() === normalizedInput);

            if (pendingIdx !== -1) {
                const updatedUser = { ...updatedUsers[pendingIdx], name: inputName, isLit: true, timestamp: Date.now() };
                updatedUsers[pendingIdx] = updatedUser;
                userToSync = updatedUser;
            } else if (litIdx !== -1) {
                userToSync = updatedUsers[litIdx];
            } else {
                const currentLitCount = updatedUsers.filter(u => u.isLit).length;
                if (currentLitCount < TOTAL_CAPACITY) {
                    const newUser: User = { 
                        id: `new-${Date.now()}`, 
                        name: inputName, 
                        source: SignupSource.NEW, 
                        timestamp: Date.now(), 
                        label: 'Guest Participant', 
                        isLit: true 
                    };
                    updatedUsers.push(newUser);
                    userToSync = newUser;
                } else {
                    resolve({ success: false, message: "Heart is full! Thank you for participating." });
                    return;
                }
            }
            
            setUsers(updatedUsers);
            setNewName(inputName);
            if (userToSync) syncToGoogleSheet(userToSync);
            setFinalMessage(SEMESTER_THANK_YOU_MESSAGES[Math.floor(Math.random() * SEMESTER_THANK_YOU_MESSAGES.length)]);
            
            setTimeout(() => {
                setStep('COMPLETED');
                setShowConfetti(true);
            }, fromJourney ? 400 : 200);

            resolve({ success: true });
        }, 300);
    });
  };

  const toggleUserLit = (id: string) => {
      const updated = users.map(u => {
          if (u.id === id) {
              const newStatus = !u.isLit;
              const updatedUser = { ...u, isLit: newStatus, timestamp: Date.now() };
              if (newStatus) syncToGoogleSheet(updatedUser);
              return updatedUser;
          }
          return u;
      });
      setUsers(updated);
  };

  const handleAdminAuth = () => {
      const pass = window.prompt("Enter Teacher Passcode:");
      if (pass === ADMIN_PASSWORD) {
          setIsAdminOpen(true);
      } else if (pass !== null) {
          alert("Access Denied.");
      }
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('lit', newName);
    navigator.clipboard.writeText(url.toString()).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const litCount = users.filter(u => u.isLit).length;

  return (
    <div className="min-h-screen text-white font-rubik overflow-hidden relative flex flex-col items-center justify-center">
      <ParticleBackground />
      {showConfetti && <Confetti />}

      {isAdminOpen && (
        <AdminPanel 
          users={users} 
          onToggleUser={toggleUserLit} 
          onClose={() => setIsAdminOpen(false)} 
          onDataImported={handleDataMerge}
          onResetData={() => {
              setUsers([...INITIAL_LEGACY_USERS, ...PENDING_STUDENTS]);
              localStorage.removeItem(STORAGE_KEY);
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        <div className="order-1 md:order-2 flex flex-col items-center">
           <div className="animate-float">
              <HeartGrid users={users} revealAll={step === 'COMPLETED'} />
           </div>
           <div className="mt-8 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-blue-300/60 uppercase">
              Section 308 Progress: {litCount} / {TOTAL_CAPACITY}
           </div>
        </div>

        <div className="order-2 md:order-1 w-full max-w-sm flex flex-col items-center text-center">
          <h1 
            onDoubleClick={handleAdminAuth}
            className="text-3xl md:text-5xl font-bold mb-2 tracking-tight cursor-default select-none hover:text-blue-200 transition-colors"
            title="Double click for admin"
          >
            Light Up the <span className="gradient-text">Heart</span>
          </h1>
          <p className="text-blue-200/50 text-sm mb-10 tracking-wide uppercase">Classroom Ritual</p>

          {step === 'IDLE' && (
            <div className="animate-fade-in flex flex-col items-center gap-4">
                 <button 
                   onClick={() => setStep('JOURNEY')}
                   className="relative group w-24 h-24 rounded-full flex items-center justify-center bg-blue-900/20 border border-blue-500/30 backdrop-blur-md hover:scale-110 transition-all cursor-pointer"
                 >
                    <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping opacity-20"></div>
                    <i className="fas fa-fingerprint text-3xl text-blue-200"></i>
                 </button>
                 <span className="text-xs font-semibold text-blue-200/70 tracking-widest uppercase animate-pulse">Touch to Start Journey</span>
            </div>
          )}
          
          {step === 'JOURNEY' && (
            <SemesterJourney onComplete={async (name) => {
               if (!name) { setStep('INPUT'); return { success: true }; }
               return await processNewUser(name, true);
            }} />
          )}

          {(step === 'INPUT' || step === 'PROCESSING') && (
            <form onSubmit={async (e) => { 
                e.preventDefault(); 
                setStep('PROCESSING');
                const res = await processNewUser(newName);
                if (!res.success) {
                    setErrorMessage(res.message || "Error");
                    setStep('INPUT');
                }
            }} className="w-full glass-panel p-6 rounded-2xl animate-pop-in text-left relative">
               <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Sign the Guestbook</label>
               <input 
                 autoFocus type="text" value={newName}
                 onChange={(e) => { setNewName(e.target.value); setErrorMessage(''); }}
                 disabled={step === 'PROCESSING'}
                 placeholder="Your Name..."
                 className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-4 py-3 text-white mb-2 outline-none focus:border-blue-400 transition-all"
               />
               {errorMessage && <div className="mb-4 text-xs text-red-400">{errorMessage}</div>}
               <button type="submit" disabled={!newName.trim() || step === 'PROCESSING'} className="w-full btn-shimmer text-white font-bold py-3 rounded-xl cursor-pointer">
                 {step === 'PROCESSING' ? 'Processing...' : 'Light Up Pixel'}
               </button>
               <button 
                 type="button" 
                 onClick={() => setStep('IDLE')}
                 className="w-full mt-2 text-[10px] text-white/30 hover:text-white/60 uppercase tracking-widest cursor-pointer"
               >
                 Cancel
               </button>
            </form>
          )}
        </div>
      </div>

      {step === 'COMPLETED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-md bg-indigo-950/90 p-8 rounded-3xl border border-blue-500/30 text-center animate-pop-in">
                <div className="h-64 -mt-8 mb-4">
                  <ChristmasTree />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Thank you, {newName}!</h3>
                <p className="text-blue-100/70 text-sm mb-8 font-light italic">"{finalMessage}"</p>
                
                <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
                    <div className="text-[10px] text-blue-400 uppercase font-mono mb-1">Ritual Status</div>
                    <div className="text-xl font-bold text-white">{litCount} / {TOTAL_CAPACITY} Hearts Lit</div>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={() => setStep('IDLE')} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all">
                        VIEW COMMUNITY HEART
                    </button>
                    <div className="flex gap-2">
                        <button onClick={handleShare} className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all cursor-pointer">
                            {copySuccess ? 'Link Copied!' : 'Share Link'}
                        </button>
                        <button 
                          onClick={() => { setStep('IDLE'); setNewName(''); setShowConfetti(false); }}
                          title="Reset My Session"
                          className="px-4 py-3 rounded-xl border border-white/10 text-white/30 text-xs hover:text-white transition-all cursor-pointer"
                        >
                            <i className="fas fa-undo"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;