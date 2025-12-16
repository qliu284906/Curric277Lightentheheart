import React, { useEffect } from 'react';

export const Confetti: React.FC = () => {
  useEffect(() => {
    // Simple DOM-based confetti for immediate feedback
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#e11d48'];
    const count = 50;
    
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.style.position = 'fixed';
      el.style.left = '50%';
      el.style.top = '50%';
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = '50%';
      el.style.pointerEvents = 'none';
      el.style.zIndex = '9999';
      
      // Random direction
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      el.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0, .9, .57, 1)',
      }).onfinish = () => el.remove();
      
      document.body.appendChild(el);
    }
  }, []);

  return null;
};