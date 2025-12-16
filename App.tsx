
import React, { useState, useEffect } from 'react';
import { HeartGrid } from './components/HeartGrid';
import { ParticleBackground } from './components/ParticleBackground';
import { Confetti } from './components/Confetti';
import { ChristmasTree } from './components/ChristmasTree';
import { SemesterJourney } from './components/SemesterJourney';
import { User, SignupSource } from './types';
import { TOTAL_CAPACITY, INITIAL_LEGACY_USERS, PENDING_STUDENTS, SEMESTER_THANK_YOU_MESSAGES, GOOGLE_APPS_SCRIPT_URL } from './constants';

type AppStep = 'IDLE' | 'JOURNEY' | 'INPUT' | 'PROCESSING' | 'COMPLETED';

const STORAGE_KEY = 'light-the-heart-data-v1';

const App: React.FC = () => {
  // Initialize with persistence check AND URL params check (for sharing)
  const [users, setUsers] = useState<User[]>(() => {
    let currentUsers: User[] = [...INITIAL_LEGACY_USERS, ...PENDING_STUDENTS];

    // 1. Try to load from LocalStorage first
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedSaved = JSON.parse(saved);
          if (Array.isArray(parsedSaved) && parsedSaved.length > 0) {
             currentUsers = parsedSaved;
          }
        }
      } catch (e) {
        console.error("Failed to load saved data:", e);
      }
    }

    // 2. Check for URL Params (Share Feature)
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const sharedName = params.get('lit');
        
        if (sharedName) {
            const cleanName = sharedName.trim();
            const existingIdx = currentUsers.findIndex(u => u.name.toLowerCase() === cleanName.toLowerCase());
            
            if (existingIdx !== -1) {
                if (!currentUsers[existingIdx].isLit) {
                    currentUsers[existingIdx] = {
                        ...currentUsers[existingIdx],
                        isLit: true,
                        timestamp: Date.now()
                    };
                }
            } else if (currentUsers.length < TOTAL_CAPACITY) {
                const newUser: User = {
                    id: `share-${Date.now()}`,
                    name: cleanName,
                    source: SignupSource.NEW,
                    timestamp: Date.now(),
                    label: 'Guest',
                    isLit: true
                };
                currentUsers.push(newUser);
            }
        }
    }

    return currentUsers;
  });

  const [step, setStep] = useState<AppStep>('IDLE');
  const [newName, setNewName] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [finalMessage, setFinalMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Save to LocalStorage whenever users array changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Calculate remaining UNLIT spots
  const litCount = users.filter(u => u.isLit).length;
  const remaining = Math.max(0, TOTAL_CAPACITY - litCount);

  const handleStart = () => {
    if (remaining <= 0) return;
    setStep('JOURNEY');
    setErrorMessage('');
  };

  // Helper to sync to Google Sheets
  const syncToGoogleSheet = async (user: User) => {
      if (!GOOGLE_APPS_SCRIPT_URL) return;

      try {
          // We use no-cors to avoid CORS preflight issues with simple GAS deployments.
          // This means we won't get a readable response, but the data will be sent.
          await fetch(GOOGLE_APPS_SCRIPT_URL, {
              method: 'POST',
              mode: 'no-cors', 
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(user)
          });
          console.log("Synced to Google Sheet");
      } catch (e) {
          console.error("Failed to sync to Google Sheet", e);
      }
  };

  // Logic to process the new user
  const processNewUser = (nameToProcess: string, fromJourney: boolean = false) => {
    setNewName(nameToProcess); 
    
    if (!fromJourney) {
        setStep('PROCESSING');
    }

    setTimeout(() => {
        let updatedUsers = [...users];
        const inputName = nameToProcess.trim();
        let userToSync: User | null = null;
        
        const pendingUserIndex = updatedUsers.findIndex(u => 
            !u.isLit && u.name.toLowerCase() === inputName.toLowerCase()
        );

        if (pendingUserIndex !== -1) {
            const updatedUser = {
                ...updatedUsers[pendingUserIndex],
                isLit: true,
                timestamp: Date.now(),
            };
            updatedUsers[pendingUserIndex] = updatedUser;
            userToSync = updatedUser;
        } else {
            const alreadyLitIndex = updatedUsers.findIndex(u => 
                u.isLit && u.name.toLowerCase() === inputName.toLowerCase()
            );

            if (alreadyLitIndex === -1) {
                if (updatedUsers.length < TOTAL_CAPACITY) {
                    const newUser: User = {
                        id: `new-${Date.now()}`,
                        name: inputName,
                        source: SignupSource.NEW,
                        timestamp: Date.now(),
                        label: 'Guest',
                        isLit: true
                    };
                    updatedUsers.push(newUser);
                    userToSync = newUser;
                } else {
                    setErrorMessage("Name not found in the guest list.");
                    setStep('INPUT'); 
                    return;
                }
            }
        }
        
        setUsers(updatedUsers);
        
        // SYNC TO GOOGLE SHEET (Fire and forget)
        if (userToSync) {
            syncToGoogleSheet(userToSync);
        }
        
        const randomMsg = SEMESTER_THANK_YOU_MESSAGES[Math.floor(Math.random() * SEMESTER_THANK_YOU_MESSAGES.length)];
        setFinalMessage(randomMsg);

        const delay = fromJourney ? 1500 : 2500;
        
        setTimeout(() => {
            setStep('COMPLETED');
            setShowConfetti(true);
        }, delay);

    }, 600);
  };

  const handleJourneyComplete = (name?: string) => {
      if (name) {
          processNewUser(name, true);
      } else {
          setStep('INPUT');
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setErrorMessage('');
    processNewUser(newName, false);
  };

  const handleReset = () => {
    if (window.history.pushState) {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.pushState({path:newUrl},'',newUrl);
    }
    setNewName('');
    setStep('IDLE');
    setShowConfetti(false);
    setFinalMessage('');
    setErrorMessage('');
    setCopySuccess(false);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('lit', newName);
    
    navigator.clipboard.writeText(url.toString()).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="min-h-screen text-white font-rubik overflow-hidden relative flex flex-col items-center justify-center">
      
      <ParticleBackground />
      {showConfetti && <Confetti />}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto p-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
        
        {/* LEFT SIDE: Heart Grid (Hero) */}
        <div className="order-1 md:order-2 flex flex-col items-center">
           <div className="animate-float">
              {/* revealAll is true when step is COMPLETED */}
              <HeartGrid users={users} revealAll={step === 'COMPLETED'} />
           </div>
           
           {/* Simple Status */}
           <div className="mt-8 flex gap-6 text-xs font-medium tracking-widest text-white/40 uppercase">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-pink-600 shadow-[0_0_10px_#db2777]"></div>
                 <span>Discussion</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full border border-white/20 bg-white/5"></div>
                 <span>Presentation</span>
              </div>
           </div>
        </div>

        {/* RIGHT SIDE: Interactive Panel */}
        <div className="order-2 md:order-1 w-full max-w-sm flex flex-col items-center text-center">
          
          <h1 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
            Lightening the <br/> <span className="gradient-text">Heart</span>
          </h1>
          <p className="text-blue-200/50 text-sm mb-10 tracking-wide">Section 308 Community Ritual</p>

          {/* STEP 1: IDLE - Big Pulse Button */}
          {step === 'IDLE' && (
            <div className="animate-fade-in flex flex-col items-center gap-4">
               {remaining > 0 ? (
                 <button 
                   onClick={handleStart}
                   className="relative group w-24 h-24 rounded-full flex items-center justify-center bg-blue-900/20 border border-blue-500/30 backdrop-blur-md transition-all duration-500 hover:scale-110 hover:border-blue-400/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                 >
                    <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <i className="fas fa-fingerprint text-3xl text-blue-200 group-hover:text-white transition-colors"></i>
                 </button>
               ) : (
                 <div className="glass-panel px-6 py-4 rounded-xl text-blue-200">
                    <i className="fas fa-check-circle mb-2 text-2xl"></i>
                    <p>Community Complete</p>
                 </div>
               )}
               
               {remaining > 0 && (
                 <span className="text-xs font-semibold text-blue-200/70 tracking-widest uppercase animate-pulse">
                   Start Journey
                 </span>
               )}
            </div>
          )}
          
          {/* STEP 1.5: JOURNEY GAME */}
          {step === 'JOURNEY' && (
             <SemesterJourney onComplete={handleJourneyComplete} />
          )}

          {/* STEP 2: INPUT - Name Modal (Fallback if Journey skipped or error) */}
          {(step === 'INPUT' || step === 'PROCESSING') && (
            <form onSubmit={handleSubmit} className="w-full glass-panel p-6 rounded-2xl animate-pop-in text-left relative overflow-hidden">
               {step === 'INPUT' && (
                   <button 
                     type="button" 
                     onClick={() => { setStep('IDLE'); setErrorMessage(''); }}
                     className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
                   >
                     <i className="fas fa-times"></i>
                   </button>
               )}

               <label className="block text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Please Enter Your Name</label>
               <input 
                 autoFocus
                 type="text" 
                 value={newName}
                 onChange={(e) => { setNewName(e.target.value); setErrorMessage(''); }}
                 disabled={step === 'PROCESSING'}
                 placeholder="Enter your name (e.g. Po)"
                 className="w-full bg-black/40 border border-blue-500/30 rounded-xl px-4 py-3 text-white placeholder-blue-200/20 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all mb-2"
               />
               
               {errorMessage && (
                  <div className="mb-4 text-xs text-red-400 bg-red-900/20 p-2 rounded border border-red-500/30 flex items-center gap-2">
                      <i className="fas fa-exclamation-circle"></i>
                      {errorMessage}
                  </div>
               )}
               
               <button 
                 type="submit"
                 disabled={!newName.trim() || step === 'PROCESSING'}
                 className="w-full btn-shimmer animate-shimmer text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/50 transform active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
               >
                 {step === 'PROCESSING' ? (
                     <>
                        <i className="fas fa-circle-notch animate-spin"></i> Checking list...
                     </>
                 ) : 'Light Up Pixel'}
               </button>
            </form>
          )}

        </div>
      </div>

      {/* STEP 3: SUCCESS - Christmas Tree MODAL */}
      {step === 'COMPLETED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
            <div className="relative w-full max-w-md bg-gradient-to-br from-indigo-950/90 to-black/90 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.4)] text-center animate-pop-in overflow-hidden">
                
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

                {/* The Holographic Tree - Larger Container */}
                <div className="h-80 -mt-8 mb-4 relative z-10">
                   <ChristmasTree />
                </div>
                
                <div className="relative z-10">
                    <p className="text-blue-100 text-lg leading-relaxed mb-6 font-light px-4">
                        "{finalMessage}"
                    </p>
                    
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto mb-6"></div>

                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 mb-8 font-serif tracking-wide drop-shadow-sm">
                        Merry Christmas,<br/>{newName}!
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                            onClick={handleShare}
                            className={`px-6 py-3 rounded-full border transition-all text-sm uppercase tracking-widest font-semibold flex items-center justify-center gap-2 ${copySuccess ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/40 hover:scale-105'}`}
                        >
                            {copySuccess ? (
                                <>
                                    <i className="fas fa-check"></i> Copied!
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-share-alt"></i> Share Spark
                                </>
                            )}
                        </button>

                        <button 
                            onClick={handleReset}
                            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm uppercase tracking-widest text-slate-400 font-semibold"
                        >
                            Close
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
