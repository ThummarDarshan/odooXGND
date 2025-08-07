import React, { useState, useEffect } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  [key: string]: any;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = "", 
  intensity = 0.3,
  ...props 
}) => {
  // Remove state and handlers for position and hover
  return (
    <div
      className={`magnetic ${className}`}
      style={{}}
      {...props}
    >
      {children}
    </div>
  );
};

export default MagneticButton;