import React, { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  particleCount?: number;
  className?: string;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  particleCount = 50, 
  className = "" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-primary/30 rounded-full pointer-events-none';
      
      // Random position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // Random animation delay and duration
      const duration = 3 + Math.random() * 4;
      const delay = Math.random() * 2;
      
      particle.style.animation = `particleFloat ${duration}s ease-in-out infinite`;
      particle.style.animationDelay = `${delay}s`;
      
      container.appendChild(particle);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [particleCount]);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    />
  );
};

export default ParticleSystem;