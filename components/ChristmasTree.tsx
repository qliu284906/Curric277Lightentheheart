
import React, { useEffect, useRef } from 'react';

export const ChristmasTree: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 300;
    let height = 400;
    
    // Static Blue Tree Particles
    const treeParticles: {x: number, y: number, z: number, size: number, alpha: number, blinkOffset: number}[] = [];
    // Dynamic Ribbon Particles
    const ribbonParticles: {yBase: number, angleBase: number, radiusOffset: number, speed: number, size: number}[] = [];

    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      width = rect.width;
      height = rect.height;
    };

    const init = () => {
      // 1. Generate Static Blue Tree (Increased Density)
      const treeCount = 1500; // Increased from 600 for denser look
      for (let i = 0; i < treeCount; i++) {
        const y = Math.random(); // 0 (top) to 1 (bottom)
        const maxRadius = y * 110; // Slightly wider cone
        
        // Distribute mostly on surface but some inside to make it look dense/solid
        // Using pow to push more particles to the edge but keep some interior
        const r = maxRadius * Math.pow(Math.random(), 0.4); 
        const theta = Math.random() * Math.PI * 2;
        
        treeParticles.push({
          x: r * Math.cos(theta),
          y: y * 260 - 130, // Tree height ~260
          z: r * Math.sin(theta),
          size: Math.random() * 1.8 + 0.5, // Slightly larger variation
          alpha: Math.random() * 0.6 + 0.4, // Higher base alpha
          blinkOffset: Math.random() * Math.PI * 2
        });
      }

      // 2. Generate Galaxy Ribbon (Silver)
      const turns = 6; // More turns
      const pointsPerTurn = 120;
      const ribbonCount = turns * pointsPerTurn;
      
      for (let i = 0; i < ribbonCount; i++) {
         const progress = i / ribbonCount; // 0 (top) to 1 (bottom)
         const y = progress;
         
         // Base Spiral Angle
         const angle = progress * Math.PI * 2 * turns;
         
         // Create a "cluster" at each point for galaxy effect
         for(let j=0; j<3; j++) {
            ribbonParticles.push({
               yBase: y,
               angleBase: angle + (Math.random() - 0.5) * 0.6, 
               radiusOffset: (Math.random() - 0.5) * 18, 
               speed: 0.02, 
               size: Math.random() * 1.5 + 0.5
            });
         }
      }
    };

    const drawStar = (cx: number, cy: number) => {
        ctx.save();
        // Silver/White Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)"; 
        ctx.fillStyle = "#ffffff";
        
        // Star shape
        ctx.beginPath();
        const outerRadius = 14; // Slightly bigger
        const innerRadius = 6;
        const spikes = 5;
        
        // Pulse scale
        const scale = 1 + Math.sin(time * 3) * 0.15;
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        let rot = Math.PI / 2 * 3;
        let x = 0;
        let y = 0;
        const step = Math.PI / spikes;

        ctx.moveTo(0, 0 - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = Math.cos(rot) * outerRadius;
            y = Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = Math.cos(rot) * innerRadius;
            y = Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(0, 0 - outerRadius);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      // Move center Y down slightly to ensure top star has room
      // Tree roughly spans -130 to +130 relative to centerY.
      // If height is 400, center is 200. Top is 70. Star radius ~15. 
      // Safe, but let's push it down a tiny bit more to be sure.
      const centerY = height / 2 + 20; 
      const treeTopY = centerY - 130;

      time += 0.02;

      // 1. Draw Static Tree (Blue)
      treeParticles.forEach(p => {
         // Project 3D to 2D
         const scale = (p.z + 450) / 450; // Adjusted perspective
         const px = centerX + p.x * scale;
         const py = centerY + p.y * scale;
         
         const twinkle = Math.sin(time * 3 + p.blinkOffset) * 0.3 + 0.7;
         
         ctx.beginPath();
         ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
         // Deep Blue to Cyan
         ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha * twinkle})`; 
         ctx.fill();
      });

      // 2. Draw Spiral Ribbon (Silver/Galaxy)
      ribbonParticles.forEach(p => {
         const currentAngle = p.angleBase - time; 
         
         const yPos = p.yBase * 260 - 130;
         const baseRadius = p.yBase * 110 + 15; 
         const r = baseRadius + p.radiusOffset;
         
         const x = r * Math.cos(currentAngle);
         const z = r * Math.sin(currentAngle);
         
         const scale = (z + 450) / 450;
         const px = centerX + x * scale;
         const py = centerY + yPos * scale;
         
         const alpha = Math.max(0.1, (z + 200) / 300);
         
         ctx.beginPath();
         ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
         
         // Silver / White
         if (Math.random() > 0.85) {
            ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`; // Hint of Blue
         } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // Pure White
         }

         if (z > 0 && Math.random() > 0.92) {
             ctx.shadowBlur = 6;
             ctx.shadowColor = "white";
         } else {
             ctx.shadowBlur = 0;
         }
         
         ctx.fill();
         ctx.shadowBlur = 0;
      });

      // 3. Draw Star on Top (Silver)
      drawStar(centerX, treeTopY);

      requestAnimationFrame(animate);
    };

    resize();
    init();
    animate();

    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} style={{width: '100%', height: '100%'}} />
    </div>
  );
};
