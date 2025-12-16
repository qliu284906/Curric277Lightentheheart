
import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
      history: {x: number, y: number}[];
    }

    let particles: Particle[] = [];
    
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createParticles = () => {
      particles = [];
      const count = window.innerWidth < 768 ? 80 : 150;
      
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5, 
          // Vary speed: some slow stars, some faster "drifting" particles
          speedX: (Math.random() - 0.5) * 0.3, 
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
          history: [] // For trails
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // 1. Update Position
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around screen
        let wrapped = false;
        if (p.x < 0) { p.x = canvas.width; wrapped = true; }
        if (p.x > canvas.width) { p.x = 0; wrapped = true; }
        if (p.y < 0) { p.y = canvas.height; wrapped = true; }
        if (p.y > canvas.height) { p.y = 0; wrapped = true; }
        
        // Reset history if wrapped so we don't draw lines across screen
        if (wrapped) {
            p.history = [];
        }

        // 2. Update History for Trails
        p.history.push({x: p.x, y: p.y});
        if (p.history.length > 15) { // Trail length
            p.history.shift();
        }

        // 3. Draw Trail
        if (p.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.history[0].x, p.history[0].y);
            for (let i = 1; i < p.history.length; i++) {
                ctx.lineTo(p.history[i].x, p.history[i].y);
            }
            // Fade trail opacity
            ctx.strokeStyle = `rgba(220, 230, 255, ${p.opacity * 0.15})`;
            ctx.lineWidth = p.size;
            ctx.stroke();
        }

        // 4. Draw Particle Head (Star)
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = Math.sin(p.twinklePhase) * 0.5 + 0.5; // 0 to 1
        const currentOpacity = p.opacity * (0.3 + twinkle * 0.7);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(220, 230, 255, ${currentOpacity})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};
