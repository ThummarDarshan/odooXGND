import React from 'react';
import { Globe, MapPin, Compass } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showIcon = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const isWhiteTheme = className.includes('text-white');

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && (
        <div className="relative">
          <Globe className={`${iconSizes[size]} ${isWhiteTheme ? 'text-white' : 'text-blue-600'}`} />
          <Compass className={`${iconSizes[size]} absolute inset-0 ${isWhiteTheme ? 'text-white opacity-60' : 'text-purple-600 opacity-60'}`} />
        </div>
      )}
      <span className={`font-bold ${isWhiteTheme ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'} ${sizeClasses[size]}`}>
        GlobeTrotter
      </span>
    </div>
  );
}

export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showIcon'>) {
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`relative ${className}`}>
      <Globe className={`${iconSizes[size]} text-blue-600`} />
      <Compass className={`${iconSizes[size]} absolute inset-0 text-purple-600 opacity-60`} />
    </div>
  );
}

export function LogoText({ size = 'md', className = '' }: Omit<LogoProps, 'showIcon'>) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${sizeClasses[size]} ${className}`}>
      GlobeTrotter
    </span>
  );
}
