import React from 'react';

interface SunburstProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Sunburst: React.FC<SunburstProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className={`inline-block ${sizeMap[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="5" fill="#FFE15C" />
      {/* 8 golden sun rays in bursts */}
      <line x1="24" y1="6" x2="24" y2="12" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="36" x2="24" y2="42" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="6" y1="24" x2="12" y2="24" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="24" x2="42" y2="24" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="11" y1="11" x2="16" y2="16" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="32" x2="37" y2="37" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="11" y1="37" x2="16" y2="32" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="16" x2="37" y2="11" stroke="#FFE15C" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export const FloatingCloud: React.FC<{ className?: string; opacity?: string }> = ({
  className = '',
  opacity = 'opacity-80',
}) => {
  return (
    <svg
      viewBox="0 0 120 60"
      className={`pointer-events-none ${className} ${opacity}`}
      fill="#FFF6E3"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M 25 50 Q 15 50 12 40 Q 8 30 18 20 Q 28 8 42 16 Q 55 5 70 18 Q 80 10 92 24 Q 102 35 95 48 Q 90 52 80 50 Z" />
    </svg>
  );
};
