
import React from 'react';
import { Pixel } from './Pixel';
import { User } from '../types';
import { HEART_MASK, TOTAL_CAPACITY } from '../constants';

interface HeartGridProps {
  users: User[];
  revealAll?: boolean; // Prop to force show full shape
}

export const HeartGrid: React.FC<HeartGridProps> = ({ users, revealAll = false }) => {
  let userCounter = 0;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-transparent blur-3xl rounded-full pointer-events-none transform scale-150"></div>
      
      <div className="flex flex-col items-center justify-center p-4 sm:p-10 relative z-10">
        {/* Gap reduced for mobile (gap-1.5) to prevent overflow on 320px screens */}
        <div className="flex flex-col gap-1.5 sm:gap-2.5">
          {HEART_MASK.map((rowStr, rIndex) => (
            <div key={rIndex} className="flex gap-1.5 sm:gap-2.5 justify-center">
              {rowStr.split('').map((char, cIndex) => {
                const isMask = char === 'X';
                let currentUser: User | null = null;
                let key = `${rIndex}-${cIndex}`;

                if (isMask) {
                  if (userCounter < users.length) {
                    currentUser = users[userCounter];
                    key = `${key}-${currentUser.id}`;
                  }
                  userCounter++;
                }

                return (
                  <Pixel 
                    key={key} 
                    isMask={isMask} 
                    user={currentUser} 
                    index={userCounter} 
                    totalPixels={TOTAL_CAPACITY}
                    revealAll={revealAll}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
