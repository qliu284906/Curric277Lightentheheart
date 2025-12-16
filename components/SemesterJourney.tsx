
import React, { useState, useEffect, useMemo, useRef } from 'react';

interface SemesterJourneyProps {
  onComplete: (name?: string) => void;
}

// --- Custom Pixel Icons ---
const PixelIconBasics = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M4 6h16v12H4z" fillOpacity="0.2"/>
    <path d="M4 6h2v12H4zm14 0h2v12h-2zM4 6h16v2H4zm0 10h16v2H4z" />
    <path d="M8 10h2v4H8zm8 0h2v4h-2zM12 10h2v4h-2z" />
  </svg>
);

const PixelIconPen = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M14.5 5.5l4 4l-11 11h-4v-4l11-11z" fillOpacity="0.2"/>
    <path d="M14 4h2v2h-2zm2 2h2v2h-2zm2 2h2v2h-2zM6 16h2v2H6zm2-2h2v2H8zm2-2h2v2h-2zm2-2h2v2h-2zm-6 8h4v2H4v-4h2z" />
  </svg>
);

const PixelIconFlow = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
     <path d="M13 2L3 14h7v8l10-12h-7z" fillOpacity="0.2"/>
     <path d="M12 2h2v4h-2zm-2 4h2v4h-2zm-4 4h4v2H6zm-2 2h2v2H4zm8 0h4v2h-4zm2 2h2v4h-2zm-2 4h2v2h-2z" />
  </svg>
);

const PixelIconMask = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
     <path d="M4 4h16v16H4z" fillOpacity="0.2"/>
     <path d="M4 4h2v16H4zm14 0h2v16h-2zM4 4h16v2H4zm0 14h16v2H4z" />
     <path d="M8 8h2v2H8zm6 0h2v2h-2zM8 14h8v2H8z" />
  </svg>
);

// 14 Week Configuration
const LEVELS_CONFIG = [
  { id: 1,  title: "Introduction",      weeks: "Week 1",  coords: {x: -600, z: -1000},  icon: 0, color: "text-blue-400",    border: "border-blue-400",    bg: "from-blue-500/20 to-blue-900/40" },
  { id: 2,  title: "Representation",    weeks: "Week 2",  coords: {x: -300, z: -2200},  icon: 1, color: "text-indigo-400",  border: "border-indigo-400",  bg: "from-indigo-500/20 to-indigo-900/40" },
  { id: 3,  title: "Teaching History",  weeks: "Week 3",  coords: {x: 100,  z: -3400},  icon: 2, color: "text-violet-400",  border: "border-violet-400",  bg: "from-violet-500/20 to-violet-900/40" },
  { id: 4,  title: "Journaling & DKP",  weeks: "Week 4",  coords: {x: 500,  z: -4600},  icon: 3, color: "text-purple-400",  border: "border-purple-400",  bg: "from-purple-500/20 to-purple-900/40" },
  { id: 5,  title: "Gee's Principles",  weeks: "Week 5",  coords: {x: 300,  z: -5800},  icon: 0, color: "text-fuchsia-400", border: "border-fuchsia-400", bg: "from-fuchsia-500/20 to-fuchsia-900/40" },
  { id: 6,  title: "Library Workshop",  weeks: "Week 6",  coords: {x: -100, z: -7000},  icon: 1, color: "text-pink-400",    border: "border-pink-400",    bg: "from-pink-500/20 to-pink-900/40" },
  { id: 7,  title: "Control & Agency",  weeks: "Week 7",  coords: {x: -500, z: -8200},  icon: 2, color: "text-rose-400",    border: "border-rose-400",    bg: "from-rose-500/20 to-rose-900/40" },
  { id: 8,  title: "Empathy Games",     weeks: "Week 8",  coords: {x: -300, z: -9400},  icon: 3, color: "text-orange-400",  border: "border-orange-400",  bg: "from-orange-500/20 to-orange-900/40" },
  { id: 9,  title: "Expertise",         weeks: "Week 9",  coords: {x: 100,  z: -10600}, icon: 0, color: "text-amber-400",   border: "border-amber-400",   bg: "from-amber-500/20 to-amber-900/40" },
  { id: 10, title: "1:1 Meetings",      weeks: "Week 10", coords: {x: 500,  z: -11800}, icon: 1, color: "text-yellow-400",  border: "border-yellow-400",  bg: "from-yellow-500/20 to-yellow-900/40" },
  { id: 11, title: "Flow",              weeks: "Week 11", coords: {x: 300,  z: -13000}, icon: 2, color: "text-lime-400",    border: "border-lime-400",    bg: "from-lime-500/20 to-lime-900/40" },
  { id: 12, title: "Identity",          weeks: "Week 12", coords: {x: -100, z: -14200}, icon: 3, color: "text-green-400",   border: "border-green-400",   bg: "from-green-500/20 to-green-900/40" },
  { id: 13, title: "Games & Cognition", weeks: "Week 14", coords: {x: -400, z: -15400}, icon: 0, color: "text-emerald-400", border: "border-emerald-400", bg: "from-emerald-500/20 to-emerald-900/40" },
  { id: 14, title: "Presentations",     weeks: "Week 15", coords: {x: 600,  z: -16800}, icon: 1, color: "text-teal-400",    border: "border-teal-400",    bg: "from-teal-500/20 to-teal-900/40" },
];

const ICONS = [PixelIconBasics, PixelIconPen, PixelIconFlow, PixelIconMask];
const HEART_POS = { x: 1000, z: -18500 };

// Intro Text Content - UPDATED to match course keywords + Review statement
const INTRO_TEXT = "From Representation and Agency to Flow and Identity... We explored Gee's Principles, Empathy, and Cognition to understand the true power of play. Let's revisit the path we walked together.";

export const SemesterJourney: React.FC<SemesterJourneyProps> = ({ onComplete }) => {
  // Game Phases: 'TITLE' -> 'INTRO_TYPEWRITER' -> 'JOURNEY'
  const [phase, setPhase] = useState<'TITLE' | 'INTRO_TYPEWRITER' | 'JOURNEY'>('TITLE');
  
  // Journey State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [cameraZ, setCameraZ] = useState(0);
  const [cameraX, setCameraX] = useState(0);
  const [isTravelling, setIsTravelling] = useState(false);
  const [collected, setCollected] = useState<number[]>([]);
  
  // Typewriter State
  const [typedText, setTypedText] = useState('');
  
  // Final Input State
  const [arrivedAtHeart, setArrivedAtHeart] = useState(false);
  const [inputName, setInputName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial mount: Set initial camera
  useEffect(() => {
    // Start exactly at week 1 Z, slightly pulled back
    setCameraZ(LEVELS_CONFIG[0].coords.z + 800);
    setCameraX(LEVELS_CONFIG[0].coords.x);
  }, []);

  // Typewriter Effect Logic
  useEffect(() => {
    if (phase === 'INTRO_TYPEWRITER') {
      let i = 0;
      const speed = 40; // typing speed ms
      const interval = setInterval(() => {
        if (i < INTRO_TEXT.length) {
          setTypedText(INTRO_TEXT.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          // Wait a bit after typing finishes, then go to journey
          setTimeout(() => {
             setPhase('JOURNEY');
          }, 2000);
        }
      }, speed);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleStartAdventure = () => {
    setPhase('INTRO_TYPEWRITER');
  };

  const handleCollect = (levelIndex: number) => {
    if (levelIndex !== currentLevelIdx || isTravelling) return;

    setIsTravelling(true);
    setCollected(prev => [...prev, LEVELS_CONFIG[currentLevelIdx].id]);

    setTimeout(() => {
        let nextZ, nextX;
        let isFinalLeg = false;

        if (currentLevelIdx < LEVELS_CONFIG.length - 1) {
            nextZ = LEVELS_CONFIG[currentLevelIdx + 1].coords.z + 800; 
            nextX = LEVELS_CONFIG[currentLevelIdx + 1].coords.x;
        } else {
            nextZ = HEART_POS.z + 800;
            nextX = HEART_POS.x;
            isFinalLeg = true;
        }

        setCameraZ(nextZ);
        setCameraX(nextX);

        setTimeout(() => {
            setIsTravelling(false);
            if (!isFinalLeg) {
                setCurrentLevelIdx(prev => prev + 1);
            } else {
                setArrivedAtHeart(true);
            }
        }, 1500); 
    }, 500);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(inputName.trim() && !isSubmitting) {
          setIsSubmitting(true);
          onComplete(inputName);
      }
  };
  
  // Focus input when arriving at heart
  useEffect(() => {
      if (arrivedAtHeart && inputRef.current) {
          // Small timeout to ensure visibility transition is done
          setTimeout(() => {
              inputRef.current?.focus();
          }, 500);
      }
  }, [arrivedAtHeart]);

  const roadPath = useMemo(() => {
    // START PATH VISUAL FIX: 
    // Start slightly BEHIND the first level so the road doesn't look like it spawns under feet.
    // Level 1 is at -1000. Start at -500 to give a lead-in.
    const startX = LEVELS_CONFIG[0].coords.x;
    const startZ = LEVELS_CONFIG[0].coords.z + 500;
    
    let d = `M ${startX} ${startZ}`;
    d += ` L ${LEVELS_CONFIG[0].coords.x} ${LEVELS_CONFIG[0].coords.z}`; // Connect to node 1
    
    for (let i = 0; i < LEVELS_CONFIG.length - 1; i++) {
        const next = LEVELS_CONFIG[i+1];
        d += ` L ${next.coords.x} ${next.coords.z}`;
    }
    d += ` L ${HEART_POS.x} ${HEART_POS.z}`;
    return d;
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black/90 z-40 flex items-center justify-center overflow-hidden font-rubik">
      
      {/* --- PHASE 1: TITLE SCREEN --- */}
      {phase === 'TITLE' && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black text-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
           
           <div className="relative z-10 max-w-2xl">
               <div className="mb-4 inline-block px-3 py-1 border border-blue-500/30 rounded-full bg-blue-900/20 text-blue-300 text-xs font-mono tracking-[0.2em] uppercase">
                  Class Data Loaded
               </div>
               
               <h1 className="text-4xl md:text-7xl font-bold text-white mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  CURRIC 277
               </h1>
               
               <h2 className="text-xl md:text-3xl text-blue-200/80 font-light mb-8 tracking-wide">
                  Video Games and Learning
               </h2>
               
               <p className="text-slate-400 mb-12 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
                  The semester is complete. The logs are finalized. 
                  Revisit the journey through Representation, Identity, and Cognition 
                  to unlock the final community artifact.
               </p>
               
               <button 
                  onClick={handleStartAdventure}
                  className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-sm transition-all hover:scale-105"
               >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute inset-0 w-full h-full border border-white/20"></div>
                  <span className="relative z-10 font-bold text-white tracking-widest flex items-center gap-3">
                     START ADVENTURE
                     <i className="fas fa-rocket group-hover:translate-x-1 transition-transform"></i>
                  </span>
               </button>
           </div>
        </div>
      )}

      {/* --- PHASE 2: TYPEWRITER INTRO --- */}
      {phase === 'INTRO_TYPEWRITER' && (
        <div className="absolute inset-0 z-[70] bg-black flex items-center justify-center p-8">
            <div className="max-w-3xl text-left">
                <p className="text-2xl md:text-4xl leading-relaxed text-blue-100 font-mono">
                    <span className="text-blue-400 mr-2">&gt;</span>
                    {typedText}
                    <span className="inline-block w-3 h-8 ml-1 align-middle bg-blue-500 animate-pulse"></span>
                </p>
                <div className="mt-12 flex justify-end">
                    <button 
                        onClick={() => setPhase('JOURNEY')}
                        className="text-white/30 hover:text-white text-sm uppercase tracking-widest transition-colors animate-pulse"
                    >
                        Skip &gt;&gt;
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- PHASE 3: JOURNEY (HUD & 3D) --- */}
      
      {/* HUD: Top Bar */}
      <div className={`absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none transition-opacity duration-1000 ${phase === 'JOURNEY' && !arrivedAtHeart ? 'opacity-100' : 'opacity-0'}`}>
         <div>
            <h2 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
               SEMESTER LOG
            </h2>
            <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isTravelling ? 'bg-green-400 animate-ping' : 'bg-blue-500'}`}></div>
                <span className="text-xs font-mono text-blue-200/60 uppercase tracking-widest">
                    {isTravelling ? 'WARP ENGAGED' : 'SYSTEM READY'}
                </span>
            </div>
         </div>
         
         <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-blue-400/50 font-mono tracking-widest">DESTINATION DISTANCE</span>
            <span className="text-2xl font-mono text-white/90">
                {Math.max(0, Math.floor((Math.abs(HEART_POS.z) - Math.abs(cameraZ))/10))} <span className="text-sm text-white/30">LY</span>
            </span>
         </div>
      </div>

      {/* 3D Viewport */}
      <div 
        className={`w-full h-full relative perspective-container transition-opacity duration-1000 ${phase === 'JOURNEY' ? 'opacity-100' : 'opacity-0'}`}
        style={{ 
            perspective: '1000px', 
            transformStyle: 'preserve-3d' 
        }}
      >
        {/* The World Container - FIX: Changed from top-1/2 left-1/2 to inset-0 to center the coordinate system */}
        <div 
            className="absolute inset-0 w-full h-full transition-transform cubic-bezier(0.45, 0, 0.55, 1)"
            style={{ 
                transformStyle: 'preserve-3d',
                transitionDuration: isTravelling ? '1500ms' : '1000ms', 
                transform: `translateZ(${-cameraZ}px) translateX(${-cameraX}px) translateY(100px)` 
            }}
        >
            {/* Road - SVG MAPPING FIX */}
            {/* Removed w-full h-full to prevent scaling issues. Using fixed large size to ensure 1:1 unit mapping */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                    width: '4000px',
                    height: '40000px',
                    transform: 'rotateX(90deg)', // Lay flat
                    transformStyle: 'preserve-3d',
                    opacity: arrivedAtHeart ? 0.3 : 1, 
                    transition: 'opacity 1s ease-in-out'
                }}
            >
                <svg 
                    width="4000" height="40000" 
                    viewBox="-2000 -20000 4000 40000"
                    className="overflow-visible"
                    style={{
                         // Explicitly center SVG content in the 4000x40000 container
                         // The viewBox (-2000 -20000) puts (0,0) exactly in the middle of this div
                         width: '100%',
                         height: '100%'
                    }}
                >
                    <defs>
                        <linearGradient id="cosmicBeam" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                        </linearGradient>
                        <filter id="glow-strong">
                            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <path d={roadPath} stroke="url(#cosmicBeam)" strokeWidth="120" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="blur(20px)" className="opacity-70" />
                    <path d={roadPath} stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" fill="none" strokeDasharray="10 30" strokeLinecap="round" filter="url(#glow-strong)" />
                </svg>
            </div>

            {/* Levels */}
            {LEVELS_CONFIG.map((level, index) => {
                const isCurrent = index === currentLevelIdx;
                const isPassed = index < currentLevelIdx;
                const Icon = ICONS[level.icon];
                
                return (
                    <div 
                        key={level.id}
                        className={`absolute top-1/2 left-1/2 flex flex-col items-center justify-center transition-all duration-1000 ${isCurrent ? 'z-50' : 'z-auto'}`}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: `
                                translate3d(${level.coords.x}px, 0, ${level.coords.z}px) 
                                rotateY(${isPassed ? (index % 2 === 0 ? -15 : 15) : 0}deg)
                            `,
                            opacity: isPassed ? 0.3 : (arrivedAtHeart && isCurrent ? 0 : 1), 
                            filter: isPassed ? 'grayscale(0.8) blur(1px)' : 'none',
                        }}
                    >
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCollect(index);
                            }}
                            className={`
                                relative group w-64 h-64 flex flex-col items-center justify-center
                                transition-all duration-500
                                ${isCurrent && !isTravelling ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}
                            `}
                        >
                            <div className={`mb-8 text-center transition-all duration-700 ${isCurrent ? 'scale-125 opacity-100 -translate-y-8' : 'scale-75 opacity-60'}`}>
                                <h3 className={`font-bold ${level.color} drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] whitespace-nowrap transition-all duration-500 ${isCurrent ? 'text-6xl md:text-7xl animate-pulse-slow' : 'text-3xl'}`}>
                                    {level.title}
                                </h3>
                                {isCurrent && (
                                    <p className="text-sm text-white/80 font-mono tracking-[0.3em] uppercase mt-2 bg-black/40 inline-block px-3 py-1 rounded border border-white/10">
                                        Current Sector: {level.weeks}
                                    </p>
                                )}
                            </div>

                            <div className={`
                                relative w-32 h-32 rounded-full flex items-center justify-center
                                border border-white/20 backdrop-blur-md shadow-2xl
                                bg-gradient-to-br ${level.bg}
                                ${isCurrent ? 'animate-float shadow-[0_0_80px_currentColor]' : ''}
                                ${level.color}
                                transition-all duration-500 hover:scale-105
                            `}>
                                <Icon className="w-16 h-16 drop-shadow-lg" />
                                {isCurrent && (
                                    <>
                                        <div className="absolute inset-0 -m-6 border border-white/20 rounded-full animate-spin-slow"></div>
                                        <div className="absolute inset-0 -m-2 border-2 border-white/40 rounded-full animate-ping opacity-20"></div>
                                    </>
                                )}
                            </div>
                            
                            {isCurrent && !isTravelling && (
                                <button className="absolute -bottom-24 animate-bounce flex flex-col items-center group-hover:scale-110 transition-transform pointer-events-auto">
                                    <div className="bg-white/10 hover:bg-white/20 border border-white/40 backdrop-blur-md px-8 py-3 rounded-full transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        <span className="text-white font-bold tracking-widest text-base uppercase flex items-center gap-2">
                                            Warp to Next <i className="fas fa-forward"></i>
                                        </span>
                                    </div>
                                    <div className="h-8 w-0.5 bg-white/30 mt-2"></div>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* THE HEART (Visual Only in 3D) */}
            <div 
                className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center pointer-events-none"
                style={{
                    transform: `translate3d(${HEART_POS.x}px, -100px, ${HEART_POS.z}px)`,
                }}
            >
                <div className={`transition-all duration-1000 ${arrivedAtHeart ? 'scale-[2] opacity-20 blur-xl' : 'scale-100 opacity-100'}`}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-pink-500/30 blur-[120px] rounded-full animate-pulse-slow"></div>
                        <div className="w-96 h-96 text-pink-500 animate-float drop-shadow-[0_0_80px_rgba(236,72,153,0.8)]">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 4h16v16H4z" fillOpacity="0"/> 
                                <path d="M7 5h2v2H7zm2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM5 9h2v2H5zm0 2h2v2H5zm0 2h2v2H5zm2 2h2v2H7zm2 2h2v2H9zm2 2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2zm2-2h2v2h-2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warp Particles */}
            {isTravelling && (
                <div className="absolute inset-0 pointer-events-none w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                     {[...Array(40)].map((_, i) => (
                         <div 
                            key={i}
                            className="absolute top-1/2 left-1/2 bg-white rounded-full"
                            style={{
                                width: '2px',
                                height: '800px',
                                opacity: Math.random() * 0.5,
                                transform: `
                                    rotate(${Math.random() * 360}deg) 
                                    translateY(${Math.random() * 600 + 200}px)
                                    translateZ(${-cameraZ - 500}px) 
                                    rotateX(90deg)
                                `,
                            }}
                         ></div>
                     ))}
                </div>
            )}
        </div>
      </div>

      {/* --- PHASE 4: FINAL FORM (2D OVERLAY) --- */}
      {/* This renders ON TOP of the 3D scene, not inside it, guaranteeing clickability */}
      {arrivedAtHeart && (
         <div className="absolute inset-0 z-[100] flex items-center justify-center">
            <div className="w-full max-w-md px-4">
                <form 
                   onSubmit={handleFinalSubmit} 
                   className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/50 p-8 rounded-3xl shadow-[0_0_100px_rgba(236,72,153,0.5)] text-center animate-pop-in"
                >
                   <i className="fas fa-heart text-5xl text-pink-500 mb-6 animate-pulse"></i>
                   {/* UPDATED: Simple, Direct Text */}
                   <h2 className="text-2xl font-bold text-white mb-2">Light Up The Heart</h2>
                   <p className="text-pink-200/70 text-sm mb-6">Please enter your name to complete the journey.</p>
                   
                   <input 
                     ref={inputRef}
                     type="text"
                     value={inputName}
                     onChange={(e) => setInputName(e.target.value)}
                     disabled={isSubmitting}
                     placeholder="Your Name..."
                     className="w-full bg-black/60 border border-pink-500/30 rounded-xl px-4 py-4 text-white text-xl font-bold placeholder-pink-200/20 focus:outline-none focus:border-pink-400 focus:shadow-[0_0_20px_rgba(244,114,182,0.4)] transition-all mb-6 text-center disabled:opacity-50"
                   />
                   
                   <button 
                     type="submit"
                     disabled={!inputName.trim() || isSubmitting}
                     className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest flex justify-center items-center gap-2 text-lg"
                   >
                     {isSubmitting ? (
                        <>
                            <i className="fas fa-circle-notch animate-spin"></i> Processing...
                        </>
                     ) : (
                         'Light Up'
                     )}
                   </button>
                </form>
            </div>
         </div>
      )}

    </div>
  );
};
