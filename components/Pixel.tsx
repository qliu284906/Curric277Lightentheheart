
import React, { useMemo } from 'react';
import { User } from '../types';

interface PixelProps {
  user: User | null;
  isMask: boolean;
  index: number;
  totalPixels: number;
  revealAll?: boolean; 
}

export const Pixel: React.FC<PixelProps> = ({ user, isMask, index, totalPixels, revealAll }) => {
  
  const randomDelay = useMemo(() => Math.random() * 4, []); 
  const randomShineDelay = useMemo(() => Math.random() * 10, []); 

  // Responsive sizing:
  // Base: w-7 h-7 (28px) -> Fits nicely on 320px-375px mobile screens
  // sm: w-9 h-9 (36px)   -> Tablets / Large phones
  // md: w-12 h-12 (48px) -> Desktop
  const baseClasses = "w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 rounded-lg sm:rounded-xl transition-all duration-1000 ease-out border backdrop-blur-md flex flex-col items-center justify-center";
  
  if (!isMask) {
    return <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 opacity-0 pointer-events-none" />;
  }

  // Initials Helper
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    // Single word: take first 2 chars
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    // Multi word: take first char of up to 3 parts
    return parts.slice(0, 3).map(p => p[0]).join('').toUpperCase();
  };

  // --- STYLE LOGIC ---
  
  // 1. Calculate color based on position
  const hue = 340 - (index / totalPixels) * 40; 
  const lightness = 45 + (index / totalPixels) * 25; 

  // 2. Define Styles based on state
  
  // STATE A: LIT USER (Active, Colorful, Glowing)
  const litStyle: React.CSSProperties = {
    backgroundColor: `hsla(${hue}, 60%, ${lightness}%, 0.75)`,
    boxShadow: `0 0 15px hsla(${hue}, 60%, 60%, 0.25)`,
    transform: 'scale(1)',
    opacity: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  };

  // STATE B: UNLIT USER (Pending, Transparent, Visible Text)
  const unlitStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.03)', // Very faint background
    boxShadow: 'none',
    transform: 'scale(0.95)',
    opacity: 0.5, // Dimmer
    borderColor: 'rgba(255,255,255,0.1)', // Faint border
    color: 'rgba(255,255,255,0.4)' // Dim text
  };

  // STATE C: GHOST (No user assigned, but revealed for shape)
  const ghostStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
    transform: 'scale(0.95)',
    opacity: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed'
  };

  // STATE D: EMPTY (Hidden placeholder)
  const emptyStyle: React.CSSProperties = {
    transform: 'scale(0.8)',
    opacity: 0.3,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'transparent'
  };

  // Determine which style to use
  let currentStyle = emptyStyle;
  let isLit = false;

  if (user) {
    if (user.isLit) {
      currentStyle = litStyle;
      isLit = true;
    } else {
      currentStyle = unlitStyle;
    }
  } else if (revealAll) {
    currentStyle = ghostStyle;
  }

  // --- RENDER ---

  // Case 1: No User (Ghost or Empty)
  if (!user) {
    if (revealAll) {
         return (
            <div className={`${baseClasses} animate-pulse`} style={currentStyle}>
               <div className="w-1 h-1 rounded-full bg-white/30"></div>
            </div>
         );
    }
    return (
      <div className={`${baseClasses}`} style={currentStyle}>
        <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse"></div>
      </div>
    );
  }

  // Case 2: User (Lit or Unlit)
  const initials = getInitials(user.name);
  const isCompactText = initials.length > 2;

  return (
    <div className={`relative group w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 animate-pop-in hover:z-20`}>
        
        {/* Inner Card */}
        <div 
            style={{
                ...currentStyle, 
                // Only pulse if lit, otherwise static or very slow breathe
                animationDelay: `-${randomDelay}s`
            }}
            className={`
                w-full h-full absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden flex flex-col items-center justify-center 
                transition-all duration-1000 
                ${isLit ? 'animate-subtle-pulse border border-white/20 backdrop-blur-md text-white' : 'border border-white/10'}
                ${!isLit && 'hover:bg-white/10 hover:border-white/30 hover:opacity-80 hover:scale-100 transition-all duration-300'}
            `}
        >
            {/* Shine Effect (Only if Lit) */}
            {isLit && (
                <div 
                    className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none"
                    style={{ animationDelay: `${randomShineDelay}s` }}
                />
            )}

            {/* Initials (Always visible if user exists, just dimmer if unlit) */}
            {/* Font size adjusted for new mobile base size */}
            <span className={`font-rubik font-bold ${isCompactText ? 'text-[6px] sm:text-[8px] md:text-[10px]' : 'text-[8px] sm:text-[10px] md:text-xs'} tracking-wider leading-none z-10 ${isLit ? 'opacity-90 drop-shadow-md' : 'opacity-60'}`}>
                {initials}
            </span>
            
            {/* Heart Icon */}
            <i className={`fas fa-heart text-[5px] sm:text-[6px] md:text-[8px] mt-0.5 z-10 ${isLit ? 'opacity-70 animate-pulse-slow' : 'opacity-40 text-white/50'}`}></i>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max max-w-[150px] sm:max-w-[180px] bg-slate-900/90 backdrop-blur-xl text-white text-xs rounded-xl py-2 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-2xl translate-y-2 group-hover:translate-y-0 border border-white/20">
            <p className="font-bold text-sm truncate bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">{user.name}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">
              {isLit ? user.label : 'Waiting to light up...'}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/90"></div>
        </div>
    </div>
  );
};
