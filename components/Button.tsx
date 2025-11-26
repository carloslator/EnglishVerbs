import React from 'react';
import { playRetroSound } from '../utils/audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  onClick,
  ...props 
}) => {
  // Retro 90s Game Style: No rounded corners, thick borders, hard shadows
  const baseStyles = "py-3 px-6 text-xl md:text-2xl transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider border-4 border-black font-console font-bold retro-shadow relative overflow-hidden";
  
  const variants = {
    primary: "bg-cyan-400 hover:bg-cyan-300 text-black", // Arcade Blue/Cyan
    secondary: "bg-purple-600 hover:bg-purple-500 text-white", // Deep Purple
    danger: "bg-pink-600 hover:bg-pink-500 text-white", // Hot Pink
    outline: "bg-slate-800 hover:bg-slate-700 text-cyan-400 border-cyan-400",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-900 border-transparent shadow-none active:translate-y-0",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!props.disabled) {
      playRetroSound('click');
    }
    onClick?.(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};