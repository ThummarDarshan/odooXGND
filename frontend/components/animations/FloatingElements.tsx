import React from 'react';

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-cosmic rounded-lg opacity-20 animate-float transform-3d perspective-1000"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-sunset rounded-full opacity-30 animate-float-delayed"></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-ocean rounded-lg opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* 3D Cubes */}
      <div className="absolute top-60 right-10 w-14 h-14 animate-spin-slow">
        <div className="w-full h-full bg-gradient-rainbow opacity-25 transform rotate-45 rounded-md shadow-neon"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-32 left-1/3 w-8 h-8 bg-primary rounded-full opacity-40 animate-bounce-gentle shadow-glow"></div>
      <div className="absolute bottom-60 right-1/3 w-6 h-6 bg-info rounded-full opacity-30 animate-scale-pulse"></div>
      
      {/* Large Background Shapes */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-hero opacity-5 rounded-full animate-spin-slow"></div>
      <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-cosmic opacity-10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
    </div>
  );
};

export default FloatingElements;