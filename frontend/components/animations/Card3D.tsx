import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

const Card3D: React.FC<Card3DProps> = ({ 
  children, 
  className = "",
  intensity = 15 
}) => {
  // Remove state and handlers for transform and hover
  return (
    <div
      className={`card-3d ${className} shadow-card`}
      style={{}}
    >
      <Card className="w-full h-full bg-gradient-card backdrop-blur-sm border-white/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5 animate-gradient"></div>
        <div className="relative z-10">
          {children}
        </div>
      </Card>
    </div>
  );
};

export default Card3D;